const archiver = require("archiver");
const { s3, S3_BUCKET } = require("../config/aws-config.js");

// Download latest commit files as ZIP
async function downloadLatestCommitAsZip(req, res) {
  const { user, repo } = req.params;

  console.log(`Download request for user: ${user}, repo: ${repo}`);

  try {
    const commitsPrefix = `${user}/${repo}/commits/`;

    // List all commit files (no delimiter)
    const allObjects = await s3.listObjectsV2({
      Bucket: S3_BUCKET,
      Prefix: commitsPrefix,
    }).promise();

    if (!allObjects.Contents || allObjects.Contents.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No commits found for this repository",
      });
    }

    // Group by commitId
    const commitMap = new Map();
    for (const obj of allObjects.Contents) {
      if (obj.Key.endsWith("/")) continue;

      const key = obj.Key.replace(commitsPrefix, "");
      const [commitId] = key.split("/");
      const existing = commitMap.get(commitId);

      if (!existing || obj.LastModified > existing.LastModified) {
        commitMap.set(commitId, { LastModified: obj.LastModified });
      }
    }

    if (commitMap.size === 0) {
      return res.status(404).json({
        success: false,
        message: "No valid commits found",
      });
    }

    // Find the most recent commit by LastModified
    let latestCommitId = null;
    let latestDate = new Date(0);
    for (const [id, { LastModified }] of commitMap) {
      if (LastModified > latestDate) {
        latestDate = LastModified;
        latestCommitId = id;
      }
    }

    console.log(`Latest commit determined: ${latestCommitId}`);

    const latestCommitKey = `${commitsPrefix}${latestCommitId}/`;

    const listResponse = await s3.listObjectsV2({
      Bucket: S3_BUCKET,
      Prefix: latestCommitKey,
    }).promise();

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No files found in latest commit",
      });
    }

    // Prepare ZIP stream
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${repo}-latest-commit-${latestCommitId}.zip"`
    );

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (err) => {
      console.error("Archive error:", err);
      try {
        res.end();
      } catch (_) {}
    });

    archive.pipe(res);

    // Add files to ZIP
    for (const obj of listResponse.Contents) {
      if (obj.Key.endsWith("/")) continue;
      const relativePath = obj.Key.replace(latestCommitKey, "");
      const stream = s3.getObject({ Bucket: S3_BUCKET, Key: obj.Key }).createReadStream();
      archive.append(stream, { name: relativePath });
    }

    await archive.finalize();
  } catch (error) {
    console.error("Error downloading commit as ZIP:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
    try {
      res.end();
    } catch (_) {}
  }
}

module.exports = {
  downloadLatestCommitAsZip,
};