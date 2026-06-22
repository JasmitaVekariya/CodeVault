// controllers/updateRepo.js
const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config.js");

async function renameRepoFolder(username, oldRepoName, newRepoName) {
  const localRoot = path.resolve(process.cwd(), ".github_clone");
  const oldPath = path.join(localRoot, username, oldRepoName);
  const newPath = path.join(localRoot, username, newRepoName);

  try {
    // Rename local folder
    await fs.rename(oldPath, newPath);
    console.log(`✅ Renamed local repo folder: ${oldRepoName} → ${newRepoName}`);

    // Rename S3 folder
    const listResponse = await s3
      .listObjectsV2({
        Bucket: S3_BUCKET,
        Prefix: `${username}/${oldRepoName}/`,
      })
      .promise();

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      console.log("⚠️ No objects found in S3, creating new folder");
      await s3.putObject({
        Bucket: S3_BUCKET,
        Key: `${username}/${newRepoName}/`,
      }).promise();
      return;
    }

    for (const obj of listResponse.Contents) {
      const oldKey = obj.Key;
      const newKey = oldKey.replace(
        `${username}/${oldRepoName}/`,
        `${username}/${newRepoName}/`
      );
      await s3.copyObject({ Bucket: S3_BUCKET, CopySource: `${S3_BUCKET}/${oldKey}`, Key: newKey }).promise();
    }

    await s3.deleteObjects({
      Bucket: S3_BUCKET,
      Delete: { Objects: listResponse.Contents.map(o => ({ Key: o.Key })) },
    }).promise();

    console.log(`✅ Renamed S3 repo folder: ${oldRepoName} → ${newRepoName}`);
  } catch (err) {
    console.error("Error renaming repo folder:", err);
  }
}

module.exports = { renameRepoFolder };