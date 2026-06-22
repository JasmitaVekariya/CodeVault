const fs = require("fs").promises;
const path = require("path");

async function addRepo(user, repoName, uploadedFilePath, originalName) {
  if (!user || !repoName) {
    throw new Error("User or repoName is missing in addRepo");
  }

  // Root path for .github_clone
  const rootPath = path.resolve(process.cwd(), ".github_clone");

  // User-specific folder
  const userFolder = path.join(rootPath, user);

  // Repo folder for this user
  const repoFolder = path.join(userFolder, repoName);

  // Staging area inside repo
  const stagingPath = path.join(repoFolder, "staging");

  try {
    // Ensure the staging directory exists
    await fs.mkdir(stagingPath, { recursive: true });

    // Use original filename if provided
    const fileName = originalName || path.basename(uploadedFilePath);

    // Destination path in staging
    const destPath = path.join(stagingPath, fileName);

    // Copy file into staging area
    await fs.copyFile(uploadedFilePath, destPath);

    // Remove temp uploaded file
    await fs.unlink(uploadedFilePath).catch(() => {});

    console.log(
      `File ${fileName} added to staging area of repo '${repoName}' for user '${user}'.`
    );
  } catch (error) {
    console.error("Error adding file:", error);
    throw error;
  }
}

module.exports = { addRepo };