# AI Guidebook Setup

This is the easiest way to get the project running locally.

## 1. Prerequisites

Install the following:

- Node.js 20+ and npm
- MongoDB via one of:
  - Docker Desktop (recommended)
  - Local MongoDB Community Server
  - MongoDB Atlas

Optional but recommended:

- Git
- Postman or a similar API client

## 2. Environment Configuration

### 2.1 Server environment file

Create `server/.env` from template:

- Windows PowerShell: `Copy-Item server/.env.example server/.env`
- macOS/Linux shell: `cp server/.env.example server/.env`

Minimum required variables in `server/.env`:

- `PORT=5000`
- `MONGO_URI=<your_mongodb_uri>`
- `JWT_SECRET=<long_random_secret>`

### 2.2 Client environment file

Create `client/.env` from template:

- Windows PowerShell: `Copy-Item client/.env.example client/.env`
- macOS/Linux shell: `cp client/.env.example client/.env`

Default local value:

- `VITE_API_URL=http://localhost:5000`

## 3. MongoDB Setup Options

Choose exactly one option.

### Option A: Docker Compose (recommended)

From repository root:

1. Start services: `docker compose up -d`
2. Verify running: `docker ps`
3. Use this server URI in `server/.env`:
   - `MONGO_URI=mongodb://root:example@localhost:27017/ai_guidebook?authSource=admin`

Notes:

- Docker Compose in this repository enables MongoDB authentication.
- Optional Mongo Express UI is exposed on `http://localhost:8081`.

Maintenance commands:

- Stop containers: `docker compose stop`
- Restart containers: `docker compose start`
- Remove containers and volumes (destructive): `docker compose down -v`

### Option B: Local MongoDB Community Server

1. Install MongoDB Community Server.
2. Ensure local MongoDB service is running.
3. Use this URI in `server/.env`:
   - `MONGO_URI=mongodb://127.0.0.1:27017/ai_guidebook`

### Option C: MongoDB Atlas

1. Create Atlas cluster and DB user.
2. Allow your IP in Atlas network access.
3. Set `MONGO_URI` in `server/.env` to your Atlas connection string.

Example:

- `mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority`

## 4. Install Dependencies

From repository root:

1. Install root scripts: `npm install`
2. Install client dependencies: `npm --prefix client install`
3. Install server dependencies: `npm --prefix server install`

## 5. Run the System

Use two terminals.

Terminal 1 (backend):

1. `cd server`
2. `npm run dev`

Terminal 2 (frontend):

1. `cd client`
2. `npm run dev`

Default URLs:

- Frontend: `http://localhost:5173`
- Backend health endpoint: `http://localhost:5000/health`

## 6. Optional Seed Data

From `server/`:

- `npm run seed`

Seeded users:

- Username: `alice`, Password: `password123`
- Username: `bob`, Password: `password123`

Both users are `student` role. If you want to test admin-only routes, register a user with `role: "admin"`.

## 7. Verification Checklist

Run these checks after setup:

1. Backend startup log contains `Connected to MongoDB`.
2. `GET /health` returns `{ "status": "ok" }`.
3. Frontend loads and can reach backend API.
4. `npm run test` from repository root completes successfully.

## 8. Automated Test Commands

From repository root:

- Run all tests: `npm run test`
- Run all tests with coverage: `npm run test -- --coverage`
- Client tests only: `npm run test:client`
- Server tests only: `npm run test:server`

## 9. Troubleshooting

- Connection refused to MongoDB:
  - Validate `MONGO_URI` format and credentials.
  - Confirm MongoDB service/container is running.
- CORS/API fetch errors in frontend:
  - Confirm backend is running on `http://localhost:5000`.
  - Confirm `VITE_API_URL` in `client/.env`.
- Auth errors after role-based tests:
  - Log out and log in again to refresh JWT claims.
