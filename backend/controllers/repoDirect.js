// controllers/repoDirect.js
const mongoose = require("mongoose");
const Repository = require("../models/repoModel.js");
const User = require("../models/userModel.js");

// Create repository directly (for CLI usage)
async function createRepositoryDirect(ownerId, repoName, description = "", visibility = true) {
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
        throw new Error("Invalid owner ID");
    }

    if (!repoName) {
        throw new Error("Repository name is required");
    }

    try {
        const user = await User.findById(ownerId);
        if (!user) {
            throw new Error("User not found");
        }

        // Check if repo with same name exists
        const existingRepo = await Repository.findOne({ owner: user._id, name: repoName });
        if (existingRepo) {
            throw new Error("A repository with this name already exists");
        }

        const repository = new Repository({
            owner: user._id,
            name: repoName,
            content: [],
            description,
            visibility,
        });

        const result = await repository.save();

        user.repositories.push(result._id);
        await user.save();

        console.log(`✅ Repository '${repoName}' added to database for user '${user.username}'`);
        return result;
    } catch (error) {
        console.error("Error creating repository in DB:", error.message);
        throw error;
    }
}

module.exports = { createRepositoryDirect };