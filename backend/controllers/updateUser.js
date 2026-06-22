// controllers/updateUser.js
const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config.js");

// Local rename
async function renameLocalFolder(oldUsername, newUsername) {
  const localRoot = path.resolve(process.cwd(), ".github_clone");
  const oldPath = path.join(localRoot, oldUsername);
  const newPath = path.join(localRoot, newUsername);

  try {
    await fs.rename(oldPath, newPath);
    console.log(`✅ Renamed local folder: ${oldUsername} → ${newUsername}`);
  } catch (err) {
    console.error("Error renaming local folder:", err);
  }
}

// AWS rename (copy + delete)
async function renameS3Folder(oldUsername, newUsername) {
  try {
    const listResponse = await s3
      .listObjectsV2({
        Bucket: S3_BUCKET,
        Prefix: `${oldUsername}/`,
      })
      .promise();

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      console.log(`⚠️ No objects found for ${oldUsername} in S3`);
      return;
    }

    // Copy each object to new prefix
    for (const obj of listResponse.Contents) {
      const oldKey = obj.Key;
      const newKey = oldKey.replace(
        `${oldUsername}/`,
        `${newUsername}/`
      );

      await s3
        .copyObject({
          Bucket: S3_BUCKET,
          CopySource: `${S3_BUCKET}/${oldKey}`,
          Key: newKey,
        })
        .promise();
    }

    // Delete old objects
    await s3
      .deleteObjects({
        Bucket: S3_BUCKET,
        Delete: {
          Objects: listResponse.Contents.map((obj) => ({ Key: obj.Key })),
        },
      })
      .promise();

    console.log(`✅ Renamed S3 folder: ${oldUsername} → ${newUsername}`);
  } catch (err) {
    console.error("Error renaming S3 folder:", err);
  }
}

async function updateUserFolder(oldUsername, newUsername) {
  await renameLocalFolder(oldUsername, newUsername);
  await renameS3Folder(oldUsername, newUsername);
}

module.exports = { updateUserFolder };