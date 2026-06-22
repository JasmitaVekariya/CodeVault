// const fs = require("fs").promises; // file system 
// const path = require("path");

// async function initRepo(user, repoName) {
//   // Root directory for .github_clone
//   const rootPath = path.resolve(process.cwd(), ".github_clone");  

//   // User folder inside .github_clone
//   const userFolder = path.join(rootPath, user);

//   // Repo folder inside user's folder
//   const repoFolder = path.join(userFolder, repoName);

//   // Commits folder inside repo
//   const commitsPath = path.join(repoFolder, "commits");

//   try {
//     // Make sure all required folders exist
//     await fs.mkdir(rootPath, { recursive: true });
//     await fs.mkdir(userFolder, { recursive: true });
//     await fs.mkdir(repoFolder, { recursive: true });
//     await fs.mkdir(commitsPath, { recursive: true });

//     // Create a config.json for this repo
//     await fs.writeFile(
//       path.join(repoFolder, "config.json"),
//       JSON.stringify({ bucket: process.env.S3_Bucket }, null, 2)
//     );

//     console.log(`Repo '${repoName}' created for user '${user}'`);
//   } catch (err) {
//     console.error("Error Initialising repository", err);
//   }
// }

// module.exports = { initRepo };

const fs = require("fs").promises; // file system 
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config.js"); // use same S3 config as push/pull

async function initRepo(user, repoName) {
  // Root directory for .github_clone
  const rootPath = path.resolve(process.cwd(), ".github_clone");  

  // User folder inside .github_clone
  const userFolder = path.join(rootPath, user);

  // Repo folder inside user's folder
  const repoFolder = path.join(userFolder, repoName);

  // Commits folder inside repo
  const commitsPath = path.join(repoFolder, "commits");

  try {
    // 1️⃣ Create local folders
    await fs.mkdir(rootPath, { recursive: true });
    await fs.mkdir(userFolder, { recursive: true });
    await fs.mkdir(repoFolder, { recursive: true });
    await fs.mkdir(commitsPath, { recursive: true });

    // 2️⃣ Create config.json for repo
    await fs.writeFile(
      path.join(repoFolder, "config.json"),
      JSON.stringify({ bucket: S3_BUCKET }, null, 2)
    );

    console.log(`✅ Repo '${repoName}' created locally for user '${user}'`);

    // 3️⃣ Create a "folder" in S3 (dummy object)
    const s3Key = `${user}/${repoName}/`;
    await s3.putObject({
      Bucket: S3_BUCKET,
      Key: s3Key,
    }).promise();

    console.log(`✅ Repo '${repoName}' created in S3 for user '${user}'`);
  } catch (err) {
    console.error("Error Initialising repository:", err);
  }
}

module.exports = { initRepo };