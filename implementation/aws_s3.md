# AWS S3 Cloud Storage Integration

This document provides a detailed breakdown of how AWS S3 is configured, why it is used, and how push/pull operations function within our Custom Version Control System.

---

## 1. Why We Use AWS S3
Instead of storing the repository files directly on the Express server's database or local file system, we utilize **AWS S3 (Simple Storage Service)** as our remote repository host. 
* **Object Storage vs. File/Block Storage:** Version control systems are naturally snapshot-based. Each commit represents a static tree of files. Storing these objects in S3 matches the flat, prefix-based design of Git remote hosting.
* **Scalability:** Offloads massive file data storage from MongoDB and the backend application server. S3 handles petabyte-scale storage, ensuring that the backend server is only responsible for processing API requests and metadata queries.
* **High Availability & Durability:** Ensures that code repositories are securely stored with $99.999999999\%$ durability.
* **Separation of Concerns:** MongoDB stores schema records (users, stars, repository listings), while S3 stores the heavy file contents and directory structures.

---

## 2. Configuration to Connect to AWS S3

The integration is located in the [aws-config.js](file:///Users/apple/Jasmita_Vekariya/Sem%205/AT/GitHub_Clone/backend/config/aws-config.js) configuration file. It supports two modes: **Real AWS S3** and **Local Mock S3** (for local development without AWS credentials).

### Credentials and Variables
To connect, the application uses the standard environment variables defined in the `.env` file of the backend.

| Environment Variable | Description | Example / Required Value |
| :--- | :--- | :--- |
| `AWS_ACCESS_KEY_ID` | Access key for AWS User | *Your AWS access key* |
| `AWS_SECRET_ACCESS_KEY` | Secret access key for AWS User | *Your AWS secret key* |
| `USE_LOCAL_S3` | Toggle local mock filesystem storage vs. real S3 | `true` (Local Mock) / `false` (Real AWS S3) |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/githubclone` |

### S3 Configuration Code
```javascript
const AWS = require('aws-sdk');
require('dotenv').config();

// Default AWS region configuration
AWS.config.update({ region: "us-east-1" });

const realS3 = new AWS.S3();
const S3_BUCKET = "githubcolnebucket";
```

> [!NOTE]
> When `USE_LOCAL_S3` is set to `true`, the system redirects S3 API calls (`putObject`, `upload`, `getObject`, `listObjectsV2`, `deleteObjects`, `copyObject`) to use a local folder named `local_s3_bucket` under the workspace root, simulating S3 operations via Node's `fs` module.

---

## 3. How Objects Are Stored in S3

S3 is a flat key-value store, but it simulates folders using forward slashes (`/`) in keys. The storage hierarchy for a repository in the bucket is structured as follows:

| S3 Key Pattern | Type | Description |
| :--- | :--- | :--- |
| `<username>/<repoName>/` | Empty Object | Represents the root remote folder of the repository. |
| `<username>/<repoName>/HEAD.json` | JSON File | Pointer to the default branch and the latest commit UUID. Example: `{"branch": "main", "latestCommit": "uuid-v4-hash"}`. |
| `<username>/<repoName>/commits/<commitId>/commit.json` | JSON File | Commit metadata including author, timestamp, commit message, and commit ID. |
| `<username>/<repoName>/commits/<commitId>/<fileName>` | Binary/Text | The actual file content snapshotted during that commit. |

---

## 4. How Push and Pull Operations Work

### Push Operation (`pushRepo`)
When the user executes `push <user> <repo>`:
1. **Read Local Commits:** Reads `.github_clone/<user>/<repo>/commits/` locally.
2. **Retrieve Remote Commits:** Queries S3 with `listObjectsV2` under the prefix `<user>/<repo>/commits/` to find commits that have already been pushed.
3. **Filter and Upload New Commits:** Identifies new local commits not present in S3:
   * Uploads every file within the new commit's folder using `s3.upload()`.
   * Creates and uploads the `commit.json` metadata to S3 containing:
     ```json
     {
       "commitId": "uuid-of-commit",
       "timestamp": "2026-06-22T14:00:00.000Z",
       "message": "Commit message description",
       "author": "username"
     }
     ```
4. **Update HEAD Pointer:** Uploads a fresh `HEAD.json` to S3 containing the ID of the latest commit to update the remote reference pointer.

### Pull Operation (`pullRepo`)
When the user executes `pull <user> <repo>`:
1. **List Objects:** Calls `s3.listObjectsV2()` with the prefix `<user>/<repo>/commits/` to get all commit files stored remotely.
2. **Download Files:** Iterates over all listed objects:
   * Downloads the file content using `s3.getObject()`.
   * Recreates the local directory structure dynamically using `fs.mkdir(..., { recursive: true })`.
   * Writes the file contents to `.github_clone/<user>/<repo>/commits/<commitId>/<fileName>` locally.
3. **Synchronization:** The local repository's history is now fully updated to match S3's remote state.
