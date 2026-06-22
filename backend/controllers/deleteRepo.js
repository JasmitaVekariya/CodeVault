// controllers/deleteRepo.js
const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config.js");

async function deleteRepoFolder(username, repoName) {
  const localRoot = path.resolve(process.cwd(), ".github_clone");
  const repoFolder = path.join(localRoot, username, repoName);

  try {
    // Delete local folder
    await fs.rm(repoFolder, { recursive: true, force: true });
    console.log(`✅ Deleted local repo folder: ${repoFolder}`);

    // Delete S3 folder
    const listResponse = await s3
      .listObjectsV2({ Bucket: S3_BUCKET, Prefix: `${username}/${repoName}/` })
      .promise();

    if (listResponse.Contents && listResponse.Contents.length > 0) {
      await s3.deleteObjects({
        Bucket: S3_BUCKET,
        Delete: { Objects: listResponse.Contents.map(o => ({ Key: o.Key })) },
      }).promise();
      console.log(`✅ Deleted S3 repo folder: ${username}/${repoName}/`);
    }
  } catch (err) {
    console.error("Error deleting repo folder:", err);
  }
}

module.exports = { deleteRepoFolder };