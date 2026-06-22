const fs = require("fs").promises;
const path = require("path");
const mongoose = require("mongoose");
const { s3, S3_BUCKET } = require("../config/aws-config.js");
const { createRepositoryDirect } = require("../controllers/repoDirect.js");
const User = require("../models/userModel.js");
require("dotenv").config();


async function ensureDBConnection() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected for CLI operation.");
  }
}

async function initRepo(user, repoName) {
  try {
    // Ensure DB connection before any query
    await ensureDBConnection();

    // Step 1: Create repository in the database
    const userDoc = await User.findOne({ username: user });
    if (!userDoc) {
      throw new Error(`User '${user}' not found in database.`);
    }

    await createRepositoryDirect(userDoc._id, repoName, "", true);
    console.log(`✅ Repository '${repoName}' created in database for user '${user}'.`);
  } catch (err) {
    console.error("❌ Error creating repository in database:", err);
    return;
  }

  // Step 2: Prepare paths based on backend directory
  const localRoot = path.resolve(__dirname, "..", ".github_clone");
  const localUserFolder = path.join(localRoot, user);
  const localRepoFolder = path.join(localUserFolder, repoName);
  const commitsFolder = path.join(localRepoFolder, "commits");

  try {
    // Create local directories
    await fs.mkdir(commitsFolder, { recursive: true });
    await fs.writeFile(
      path.join(localRepoFolder, "config.json"),
      JSON.stringify({ bucket: S3_BUCKET }, null, 2)
    );
    console.log(`✅ Repository '${repoName}' initialized locally at ${localRepoFolder}`);

    // Step 3: Create empty repo folder in S3
    const s3Key = `${user}/${repoName}/`;
    await s3.putObject({ Bucket: S3_BUCKET, Key: s3Key }).promise();
    console.log(`✅ Repository '${repoName}' initialized in S3 at ${s3Key}`);
  } catch (err) {
    console.error("❌ Error initializing repository folders:", err);
  }
}

module.exports = { initRepo };