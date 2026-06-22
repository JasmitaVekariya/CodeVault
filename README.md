## CodeVault

A simple GitHub-like application with a Node.js/Express backend and a React (Vite) frontend. Data is stored in MongoDB, and repository files/commits are managed in AWS S3.

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB (local instance or MongoDB Atlas)
- AWS account with S3 access (optional locally if you skip S3 features)

### 1) Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2) Environment variables
Create `.env` files from the provided templates:
- Backend: copy `backend/.env.example` to `backend/.env` and fill values
- Frontend: copy `frontend/.env.example` to `frontend/.env` and fill values

The `.env.example` files list all required variables (no real secrets included).

### 3) Database setup
You can use either option:
- Restore a dump (if you have one):
  - Place the dump directory locally and run: `mongorestore --db githubclone <path-to-dump>`
- Or start with an empty DB: the app will create collections on demand when you use features.

Mongo connection is configured via `MONGO_URI` in the backend `.env`.

### 4) Run the project
- Backend:
```bash
cd backend && node index.js start
```

- Frontend:
```bash
cd frontend && npm run dev
```

Frontend expects the backend at `VITE_API_URL` (defaults to `http://localhost:3000` if not set).

### Notes
- S3 settings are used for repo storage. In development, you may keep the provided bucket/region placeholders and set AWS credentials via environment variables if you plan to test S3 operations.

