const mongoose = require("mongoose");
const Repository = require("../models/repoModel.js");

// Middleware to check if the current user owns the repository
const checkRepositoryOwnership = async (req, res, next) => {
  try {
    const { user, repo } = req.params;
    const currentUserId = req.headers['user-id']; // We'll send this from frontend
    
    if (!currentUserId) {
      return res.status(401).json({ 
        success: false, 
        message: "User ID required" 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid user ID format" 
      });
    }

    // Find the repository by owner username and repo name
    const repository = await Repository.findOne({ 
      name: repo 
    }).populate('owner');

    if (!repository) {
      return res.status(404).json({ 
        success: false, 
        message: "Repository not found" 
      });
    }

    // Check if the repository owner's username matches the user parameter
    if (repository.owner.username !== user) {
      return res.status(404).json({ 
        success: false, 
        message: "Repository not found" 
      });
    }

    // Check if the current user is the repository owner
    if (repository.owner._id.toString() !== currentUserId) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Only repository owners can perform this action." 
      });
    }

    // Add repository info to request for use in route handlers
    req.repository = repository;
    next();
  } catch (error) {
    console.error("Error checking repository ownership:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

module.exports = { checkRepositoryOwnership };
