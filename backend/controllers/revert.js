const fs = require("fs").promises;
const path = require("path");
const { revertCommitRepo } = require("./commit.js");
const { pushRepo } = require("./push.js");

/**
 * Helper function — deletes all files/folders except internal ones
 */
async function emptyRepoRootExceptInternal(repoPath) {
  const entries = await fs.readdir(repoPath, { withFileTypes: true });
  for (const entry of entries) {
    if (["commits", "staging"].includes(entry.name)) continue;
    const full = path.join(repoPath, entry.name);
    if (entry.isDirectory()) {
      await fs.rm(full, { recursive: true, force: true });
    } else {
      await fs.unlink(full).catch(() => {});
    }
  }
}

/**
 * Helper function — recursively copy files from commit folder
 */
async function copyCommitTree(src, dest) {
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "commit.json" || entry.name === "message.txt") continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await fs.mkdir(destPath, { recursive: true });
      await copyCommitTree(srcPath, destPath);
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * 🧩 MAIN FUNCTION — Revert repo to given commit ID
 * Creates new commit with only reverted files
 */
async function revertRepo(user, repoName, commitId) {
  const rootPath = path.resolve(process.cwd(), ".github_clone");
  const repoPath = path.join(rootPath, user, repoName);
  const commitsRoot = path.join(repoPath, "commits");
  const targetCommitPath = path.join(commitsRoot, commitId);

  try {
    // 🧩 Step 1 — Check commit exists
    const exists = await fs.stat(targetCommitPath).catch(() => null);
    if (!exists) throw new Error(`Commit ${commitId} not found.`);

    // 🧩 Step 2 — Clean up repo root (keep commits, staging)
    await emptyRepoRootExceptInternal(repoPath);

    // 🧩 Step 3 — Copy files from target commit to repo root
    await copyCommitTree(targetCommitPath, repoPath);

    // 🧩 Step 4 — Read original commit message (if any)
    let originalMsg = "";
    try {
      originalMsg = await fs.readFile(path.join(targetCommitPath, "message.txt"), "utf-8");
    } catch {}

    // 🧩 Step 5 — Create new revert commit
    const revertMsg = `Revert: ${originalMsg}`;

    await revertCommitRepo(user, repoName, revertMsg, commitId);
    console.log("🚀 Pushing revert commit to remote...");
    await pushRepo(user, repoName);
    console.log("✅ Revert commit pushed successfully.");
    console.log(
      `✅ Successfully reverted repo "${repoName}" for user "${user}" to commit ${commitId}`
    );
  } catch (error) {
    console.error("❌ Unable to revert:", error.message);
    throw error;
  }
}

module.exports = { revertRepo };