// controllers/deleteUser.js
const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config.js");

// Delete local folder
async function deleteLocalFolder(username) {
  const localRoot = path.resolve(process.cwd(), ".github_clone");
  const localUserFolder = path.join(localRoot, username);

  try {
    await fs.rm(localUserFolder, { recursive: true, force: true });
    console.log(`✅ Deleted local folder for ${username}`);
  } catch (err) {
    console.error("Error deleting local folder:", err);
  }
}

// Delete AWS S3 folder
async function deleteS3Folder(username) {
  try {
    const listResponse = await s3
      .listObjectsV2({
        Bucket: S3_BUCKET,
        Prefix: `${username}/`,
      })
      .promise();

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      console.log(`⚠️ No objects found for ${username} in S3`);
      return;
    }

    const deleteParams = {
      Bucket: S3_BUCKET,
      Delete: {
        Objects: listResponse.Contents.map((obj) => ({ Key: obj.Key })),
      },
    };

    await s3.deleteObjects(deleteParams).promise();
    console.log(`✅ Deleted S3 folder for ${username}`);
  } catch (err) {
    console.error("Error deleting S3 folder:", err);
  }
}

async function deleteUserFolder(username) {
  await deleteLocalFolder(username);
  await deleteS3Folder(username);
}

module.exports = { deleteUserFolder };