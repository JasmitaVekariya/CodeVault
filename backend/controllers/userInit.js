// controllers/userInit.js
const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config.js"); // use same AWS config as push/pull

async function userInit(user) {
  const localRoot = path.resolve(process.cwd(), ".github_clone");
  const localUserFolder = path.join(localRoot, user);

  try {
    // ✅ Create local folder
    await fs.mkdir(localUserFolder, { recursive: true });
    console.log(`User '${user}' initialized locally at ${localUserFolder}`);

    // ✅ Create empty "folder" in S3
    const s3Key = `${user}/`; // S3 folder prefix
    await s3.putObject({
      Bucket: S3_BUCKET,
      Key: s3Key,
    }).promise();

    console.log(`User '${user}' initialized in S3 at ${s3Key}`);
  } catch (err) {
    console.error("Error initializing user folder:", err);
  }
}

module.exports = { userInit };