const express = require("express");
const issueController = require("../controllers/issueController");

const issueRouter = express.Router();

issueRouter.post("/issue/create", issueController.createIssue);
issueRouter.put("/issue/update/:id", issueController.updateIssueByID);   
issueRouter.delete("/issue/delete/:id", issueController.deleteIssueByID); 
issueRouter.get("/issue/all/:repoID", issueController.getAllIssues);
issueRouter.get("/issue/:id", issueController.getIssueByID);

module.exports = issueRouter;