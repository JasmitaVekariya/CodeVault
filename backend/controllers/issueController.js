const mongoose = require("mongoose");
const Issue = require("../models/issuesModel.js");

async function createIssue(req, res) {
    try {
        const { title, description, id } = req.body;

        if (!title || !description || !id) {
            return res.status(400).send("All fields are required");
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send("Invalid repository ID");
        }

        const issue = new Issue({
            title,
            description,
            repository: id,
        });

        const result = await issue.save();

        res.status(201).json({
            message: "Issue created successfully",
            issueID: result._id,
        });
    } catch (error) {
        console.error("Error creating issue:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function updateIssueByID(req, res) {
    const { id } = req.params;
    const { title, description, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid issue ID format");
    }

    if (!title || !description) {
        return res.status(400).send("All fields are required");
    }

    try {
        const issue = await Issue.findById(id);

        if (!issue) {
            return res.status(404).send("Issue not found");
        }

        issue.title = title;
        issue.description = description;
        issue.status = status;

        await issue.save();

        res.status(200).json({
            message: "Issue updated successfully",
            issueID: issue._id,
        });
    } catch (error) {
        console.error("Error updating issue:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function deleteIssueByID(req, res) {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid issue ID format");
    }

    try {
        const issue = await Issue.findByIdAndDelete(id);

        if (!issue) {
            return res.status(404).send("Issue not found");
        }

        res.status(200).json({
            message: "Issue deleted successfully",
            issueID: id,
        });
    } catch (error) {
        console.error("Error deleting issue:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function getAllIssues(req, res) {
    const { repoID } = req.params;

    if (!mongoose.Types.ObjectId.isValid(repoID)) {
        return res.status(400).send("Invalid repository ID format");
    }

    try {
        const issues = await Issue.find({ repository: repoID });

        if (!issues || issues.length === 0) {
            return res.status(404).send("No issues found");
        }

        res.status(200).json({
            message: "Issues fetched successfully",
            issues,
        });
    } catch (error) {
        console.error("Error fetching issues:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function getIssueByID(req, res) {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid issue ID format");
    }

    try {
        const issue = await Issue.findById(id);

        if (!issue) {
            return res.status(404).send("Issue not found");
        }

        res.status(200).json({
            message: "Issue fetched successfully",
            issue,
        });
    } catch (error) {
        console.error("Error fetching issue by ID:", error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = {
    createIssue,
    updateIssueByID,
    deleteIssueByID,
    getAllIssues,
    getIssueByID,
};