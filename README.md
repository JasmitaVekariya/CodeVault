# CodeVault (GitHub_Clone)

A lightweight Git-like self-hosted code storage and collaboration prototype built with Node.js, Express, MongoDB and a React (Vite) frontend. This project provides a CLI for repository operations (init, add, commit, push, pull, revert) and a REST API + UI to manage users, repositories and issues.

Repository: https://github.com/JasmitaVekariya/GitHub_Clone

---

## Table of contents

- [Features](#features)
- [Repository structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Setup & installation](#setup--installation)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Running](#running)
  - [Start server (API + web UI)](#start-server-api--web-ui)
  - [Using the CLI](#using-the-cli)
- [CLI commands & flow](#cli-commands--flow)
- [HTTP API endpoints](#http-api-endpoints)
- [How the local repo storage works](#how-the-local-repo-storage-works)
- [Examples (common workflows)](#examples-common-workflows)
- [Development notes & troubleshooting](#development-notes--troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- CLI commands for repository lifecycle:
  - init, add, commit, push, pull, revert, userInit, start
- Local repository storage under a .github_clone folder:
  - per-user folders, per-repo staging area, commits stored as folders with metadata
- HTTP REST API for managing users, repositories and issues
- React frontend (Vite) for browsing repositories and working with the UI
- Push/pull integration to remote storage (S3 or similar — see push/pull controller)
- Basic commit metadata (id, message, timestamp) and revert via creating a new commit that copies a target commit tree

---

## Repository structure (high level)

- backend/
  - controllers/ — controller logic: init.js, add.js, commit.js, push.js, pull.js, revert.js, userInit.js, repoController.js, repoDirect.js, ...
  - routes/ — Express routers (main.router.js, repo.router.js, user.router.js, issue.router.js)
  - index.js — CLI wiring (yargs), server bootstrap, command handlers
  - models/ — Mongoose models
- frontend/
  - src/ — React app (Vite)
  - index.html
- .github_clone/ (created at runtime) — local storage for users and repos (staging, commits, etc.)

---

## Prerequisites

- Node.js (>= 16 recommended)
- npm (or Yarn)
- MongoDB instance (local or hosted); connection URI
- (Optional) AWS S3 bucket and credentials if you want to use push/pull with S3
- git (for cloning this repo)

---

## Environment variables

Create a `.env` file in `backend/` with at minimum:

- MONGO_URI - MongoDB connection URI

If you plan to use S3 push/pull (check push.js / pull.js in backend/controllers), add the usual AWS variables (examples):

- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
- AWS_BUCKET_NAME

Note: The exact variable names used by the S3 code may vary — search push.js / pull.js for the exact env var names used.

---

## Setup & installation

Clone the repository:

```bash
git clone https://github.com/JasmitaVekariya/GitHub_Clone.git
cd GitHub_Clone
```

### Backend

1. Install dependencies and configure env:

```bash
cd backend
npm install
# create a .env with MONGO_URI (and AWS vars if needed)
```

2. (Optional) Seed or create a user for tests:
- The project exposes a `userInit` CLI command to initialize a user in the local `.github_clone` and DB.

### Frontend

1. Install dependencies:

```bash
cd ../frontend
npm install
```

---

## Running

You can run backend server, frontend dev server, and use CLI commands (the CLI is implemented in backend/index.js via yargs).

### Start server (API + web UI)

From the repository root:

```bash
# start backend API (from backend folder)
cd backend
node index.js start
# or if there's an npm script:
# npm run start
```

This boots the Express server, connects to MongoDB and serves the API. The server also starts a Socket.IO instance used by the UI.

Start the frontend (dev):

```bash
cd frontend
npm run dev
# The React app (Vite) typically runs on http://localhost:5173
```

### Using the CLI

The CLI is the same Node script (backend/index.js). From the `backend/` folder you can run commands like:

```bash
# Initialize a user (creates .github_clone/<user> and registers user in DB)
node index.js userInit <username> <password> <email>

# Initialize a repository locally + in DB
node index.js init <username> <repo>

# Add a file to staging (expects a local path to the file)
node index.js add <username> <repo> <path/to/file>

# Commit staged files with a message
node index.js commit <username> <repo> "Commit message here"

# Push commits to remote storage (S3)
node index.js push <username> <repo>

# Pull latest commits from remote storage
node index.js pull <username> <repo>

# Revert to a commit id by creating a new commit with that tree
node index.js revert <username> <repo> <commit_id>

# Start the server via CLI
node index.js start
```

Notes:
- The files are staged into `.github_clone/<user>/<repo>/staging` by `add`.
- Commits are created as new folders under `.github_clone/<user>/<repo>/commits/<commit-id>/`.
- `commit` copies files from the latest commit and overwrites/merges with staged files, then clears staging.
- `revert` creates a new commit by copying the target commit tree and adding a revert message.

---

## CLI commands & flow (detailed)

- start
  - Starts the Express server, connects to MongoDB, launches Socket.IO.
- userInit <user> <pass> <email>
  - Initializes a user on S3 and in the DB (creates .github_clone user folder).
- init <user> <repo>
  - Creates a repository record in DB for the given user and creates the local folder structure: `.github_clone/<user>/<repo>/commits` and other necessary folders.
- add <user> <repo> <file>
  - Copies the provided file into `.github_clone/<user>/<repo>/staging/` (uses original name if provided).
- commit <user> <repo> <message>
  - Creates a new commit id (uuid), copies previous commit contents (if any), copies staged files into the new commit folder, writes commit.json and message.txt, and clears staging.
- push <user> <repo>
  - Uploads commits/files to remote storage (S3) — implementation in `backend/controllers/push.js`.
- pull <user> <repo>
  - Downloads commits/files from remote storage into local `.github_clone` — implementation in `backend/controllers/pull.js`.
- revert <user> <repo> <commit_id>
  - Copies the target commit tree into a new commit folder with a revert message (functionality implemented in commit.js as revertCommitRepo).

---

## HTTP API endpoints (examples)

Routes are rooted in `backend/routes/` — key endpoints:

- User & general:
  - GET / — Welcome message

- Repositories (see backend/routes/repo.router.js)
  - POST /repo/create
    - Create repository (body: owner, name, content, description, visibility)
  - GET /repo/all
    - Fetch all repositories
  - GET /repo/:id
    - Fetch a repository by ID
  - GET /repo/name/:name
    - Fetch repository by name
  - GET /repo/user/:userID
    - Fetch all repositories for a user
  - GET /repo/user/:userID/public
    - Fetch public repositories for a user
  - POST /repo/:user/:repo/commit
    - Commit via API (checks repo ownership middleware)
    - Body: { message: "commit message" }
  - POST /repo/:user/:repo/push
    - Push via API (checks repo ownership middleware)

- Issues and Users:
  - Check `backend/routes/user.router.js` and `backend/routes/issue.router.js` for endpoints related to user management and issues.

Use a REST client (Postman / curl) or the frontend to interact with the API.

---

## How the local repo storage works

- Root: .github_clone (created under backend working directory)
- Per user: .github_clone/<username>/
- Per repo:
  - .github_clone/<user>/<repo>/staging/ — staged files (added via CLI/add API)
  - .github_clone/<user>/<repo>/commits/<commit-id>/ — snapshot of repo at commit (each commit folder includes commit.json and message.txt)
- commit flow:
  - New commit folder created with uuid id
  - Files from latest commit copied into new folder
  - Staged files copied into new folder (overwriting as needed)
  - commit.json and message.txt written; staging cleared

---

## Examples (common workflows)

1. Initialize a user and repository

```bash
cd backend
node index.js userInit alice password alice@example.com
node index.js init alice my-repo
```

2. Add and commit a file

```bash
# stage a file
node index.js add alice my-repo /path/to/hello.txt

# commit staged files
node index.js commit alice my-repo "Add hello.txt"

# output will show commit id and message
```

3. Push to remote (S3)

```bash
node index.js push alice my-repo
```

4. Revert to an earlier commit

```bash
node index.js revert alice my-repo <commit-id>
# this will create a new commit that copies the tree from <commit-id>
```

5. Use the API to commit (via HTTP)

```bash
curl -X POST http://localhost:3000/repo/alice/my-repo/commit \
  -H "Content-Type: application/json" \
  -d '{"message":"Commit from API"}'
```

---

## Development notes & troubleshooting

- If you see DB connection errors, ensure MONGO_URI in `.env` is correct and MongoDB is reachable.
- If push/pull fails, check `.env` AWS credentials and the push/pull controller for expected variable names and the bucket configuration.
- The `.github_clone` directory must be writable by the process.
- When debugging CLI commands, run them from the `backend/` directory (the code resolves paths relative to process.cwd()).
- Logs are printed to the console for commit IDs and outcomes — use them to track the flow.

---

## Contributing

Contributions are welcome. Suggested steps:

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Implement your feature and add tests if possible
4. Submit a PR with a clear description

Please open issues for features or bugs so we can discuss design and priorities.

---

## License

This project does not include a license file in the repository by default. If you want to open-source it, add a LICENSE file (MIT, Apache-2.0, etc.) and mention it here.

---

If you'd like, I can:
- Add this README directly to your repository (I can prepare the file content and push or create a PR if you grant write access or provide the repository owner reference).
- Adjust wording to match your preferred tone (short / long), or include exact env var names by scanning push.js/pull.js for AWS variable names and pipeline details.
- Generate a combined flowchart PNG of the CLI workflows and add it to the README.

Which of these would you like next?  
