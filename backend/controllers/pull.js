const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config.js");

async function pullRepo(user, repoName) {
  const rootPath = path.resolve(process.cwd(), ".github_clone");
  const userFolder = path.join(rootPath, user);
  const repoPath = path.join(userFolder, repoName);
  const commitsPath = path.join(repoPath, "commits");

  try {
    // 1. List all objects for this user's repo
    const data = await s3
      .listObjectsV2({ Bucket: S3_BUCKET, Prefix: `${user}/${repoName}/commits/` })
      .promise();

    if (!data.Contents || data.Contents.length === 0) {
      console.log(`No commits found for repo "${repoName}" of user "${user}" in S3`);
      return;
    }

    // 2. Iterate over all objects (files) in this repo's commits
    for (const object of data.Contents) {
      const key = object.Key; // e.g. alice/myrepo/commits/123456/file.txt
      const relativePath = key.replace(`${user}/${repoName}/`, ""); 
      const localPath = path.join(repoPath, relativePath);

      // Ensure directory exists before writing
      await fs.mkdir(path.dirname(localPath), { recursive: true });

      // Skip "folders" (S3 sometimes stores empty keys for dirs)
      if (key.endsWith("/")) continue;

      // Download file from S3
      const params = { Bucket: S3_BUCKET, Key: key };
      const fileContent = await s3.getObject(params).promise();

      // Write file locally
      await fs.writeFile(localPath, fileContent.Body);

      console.log(`Pulled ${key} → ${localPath}`);
    }

    console.log(`Successfully pulled repo "${repoName}" for user "${user}"`);
  } catch (error) {
    console.error("Error pulling repository:", error);
  }
}

module.exports = { pullRepo };