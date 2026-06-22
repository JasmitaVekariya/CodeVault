const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config.js");

async function pushRepo(user, repoName) {
  const rootPath = path.resolve(process.cwd(), ".github_clone");
  const repoPath = path.join(rootPath, user, repoName);
  const commitsPath = path.join(repoPath, "commits");

  try {
    const commitDirs = await fs.readdir(commitsPath);
    if (commitDirs.length === 0) {
      console.log("No commits to push.");
      return;
    }

    // Upload each commit to S3 (no local modification)
    for (const commitDir of commitDirs) {
      const commitPath = path.join(commitsPath, commitDir);
      const files = await fs.readdir(commitPath);

      for (const file of files) {
        if (file === "commit.json" || file === "message.txt") continue;

        const filePath = path.join(commitPath, file);
        const fileContent = await fs.readFile(filePath);

        const params = {
          Bucket: S3_BUCKET,
          Key: `${user}/${repoName}/commits/${commitDir}/${file}`,
          Body: fileContent,
        };

        await s3.upload(params).promise();
      }

      // Upload metadata
      const commitMeta = {
        commitId: commitDir,
        timestamp: new Date().toISOString(),
        message: await safeReadFile(path.join(commitPath, "message.txt")),
        author: user,
      };

      await s3
        .upload({
          Bucket: S3_BUCKET,
          Key: `${user}/${repoName}/commits/${commitDir}/commit.json`,
          Body: JSON.stringify(commitMeta, null, 2),
        })
        .promise();

      console.log(`✅ Pushed commit ${commitDir} (${commitMeta.message})`);
    }

    // Update HEAD pointer
    const latestCommit = commitDirs[commitDirs.length - 1];
    const headData = { branch: "main", latestCommit };

    await s3
      .upload({
        Bucket: S3_BUCKET,
        Key: `${user}/${repoName}/HEAD.json`,
        Body: JSON.stringify(headData, null, 2),
      })
      .promise();

    console.log(`🔁 Updated HEAD → ${latestCommit}`);
  } catch (error) {
    console.error("❌ Error pushing repository:", error);
  }
}

async function safeReadFile(filePath) {
  try {
    return (await fs.readFile(filePath, "utf8")).trim();
  } catch {
    return "";
  }
}

// Get all committed files (used for frontend commit history)
async function getCommittedFiles(user, repoName) {
  const rootPath = path.resolve(process.cwd(), ".github_clone");
  const repoPath = path.join(rootPath, user, repoName);
  const commitsPath = path.join(repoPath, "commits");

  try {
    const commitDirs = await fs.readdir(commitsPath);
    commitDirs.sort((a, b) => Number(a) - Number(b)); // Sort ascending

    const commits = [];

    for (const commitDir of commitDirs) {
      const commitPath = path.join(commitsPath, commitDir);
      const files = await fs.readdir(commitPath);
      const actualFiles = files.filter(f => f !== "commit.json" && f !== "message.txt");

      let commitMeta = {};
      try {
        const metaContent = await fs.readFile(path.join(commitPath, "commit.json"), "utf8");
        commitMeta = JSON.parse(metaContent);
      } catch {
        commitMeta = { message: await safeReadFile(path.join(commitPath, "message.txt")) };
      }

      commits.push({
        commitId: commitDir,
        message: commitMeta.message || "No message",
        timestamp: commitMeta.timestamp || new Date().toISOString(),
        author: user,
        files: actualFiles,
      });
    }

    return commits;
  } catch (error) {
    console.error("Error reading commit history:", error);
    return [];
  }
}

module.exports = { pushRepo, getCommittedFiles };