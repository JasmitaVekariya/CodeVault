const express = require("express");
const repoController = require("../controllers/repoController.js");
const { addRepo } = require("../controllers/add.js");
const { commitRepo } = require("../controllers/commit.js");
const { pushRepo, getCommittedFiles } = require("../controllers/push.js");
const { checkRepositoryOwnership } = require("../middleware/repoOwnershipMiddleware.js");
const { downloadLatestCommitAsZip } = require("../controllers/downloadController.js");
const { revertRepo } = require("../controllers/revert.js");
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // temp storage

const repoRouter = express.Router();
repoRouter.use(express.json());

repoRouter.post("/repo/create", repoController.createRepository);
repoRouter.get("/repo/all", repoController.getAllRepository);
repoRouter.get("/repo/:id", repoController.fetchRepositoryByID);
repoRouter.get("/repo/name/:name", repoController.fetchRepositoryByName);
repoRouter.get("/repo/user/:userID", repoController.fetchRepositoriesForCurrentUser);
repoRouter.get("/repo/user/:userID/public", repoController.fetchPublicRepositoriesForUser);
repoRouter.put("/repo/update/:id", repoController.updateRepositoryByID);
repoRouter.delete("/repo/delete/:id", repoController.deleteRepositoryByID);
repoRouter.patch("/repo/toggle/:id", repoController.toggleVisibilityByID);

// Add file(s) to staging
repoRouter.post("/repo/:user/:repo/add", checkRepositoryOwnership, upload.array("files"), async (req, res) => {
  try {
    const { user, repo } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    for (const file of files) {
      await addRepo(user, repo, file.path, file.originalname);
    }

    res.json({ success: true, message: `${files.length} file(s) added to ${repo}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Commit staged files
repoRouter.post("/repo/:user/:repo/commit", checkRepositoryOwnership, async (req, res) => {
  try {
    const { user, repo } = req.params;
    const { message } = req.body;
    await commitRepo(user, repo, message);
    res.json({ success: true, message: `Commit created: ${message}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Push commits to S3
repoRouter.post("/repo/:user/:repo/push", checkRepositoryOwnership, async (req, res) => {
  try {
    const { user, repo } = req.params;
    await pushRepo(user, repo);
    res.json({ success: true, message: `Repo ${repo} pushed successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get committed files for a repository
repoRouter.get("/repo/:user/:repo/commits", async (req, res) => {
  try {
    const { user, repo } = req.params;
    const commits = await getCommittedFiles(user, repo);
    res.json({ success: true, commits });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});


repoRouter.post(
  "/repo/:user/:repo/revert/:commitId",
  checkRepositoryOwnership,
  async (req, res) => {
    try {
      const { user, repo, commitId } = req.params;
      await revertRepo(user, repo, commitId);
      res.json({
        success: true,
        message: `✅ Repository "${repo}" reverted to Commit ${commitId}`,
      });
    } catch (err) {
      console.error("❌ Error reverting repository:", err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);



// Download latest commit as ZIP
repoRouter.get("/repo/:user/:repo/download/latest", downloadLatestCommitAsZip);


module.exports = repoRouter;