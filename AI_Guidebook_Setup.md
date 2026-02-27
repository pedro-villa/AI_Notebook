# AI Guidebook for Students

This repository contains the setup for the AI Guidebook web application. It includes a `/server` (Node.js/Express) and `/client` (React + Vite) directory.

## Getting Started

**Prerequisite:** You must have [Node.js](https://nodejs.org/) installed to run this application.

### 1) Configure MongoDB (required)

The backend uses MongoDB through the `MONGO_URI` variable in `server/.env`.

#### Option A — Docker MongoDB (recommended for development)

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and make sure Docker is running.
2. From the project root (`AI_Notebook`), start MongoDB:
	- `docker compose up -d`
3. Verify container is running:
	- `docker ps`
	- Look for container name `ai_notebook_mongodb`.
4. In this project, go to `server` and create your env file from the template:
	- `Copy-Item .env.example .env`
5. Ensure `server/.env` contains:
	- `MONGO_URI=mongodb://127.0.0.1:27017/ai_guidebook`
6. Optional maintenance commands:
	- Stop DB: `docker compose stop`
	- Restart DB: `docker compose start`
	- Reset DB data (destroys local DB volume): `docker compose down -v`

#### Option B — Local MongoDB Community Server

1. Install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community).
2. Keep the default settings during installation (including running MongoDB as a Windows service).
3. Confirm MongoDB is running:
	- Open PowerShell and run: `Get-Service -Name MongoDB`
	- If status is not `Running`, start it with: `Start-Service -Name MongoDB`
4. In this project, go to `server` and create your env file from the template:
	- `Copy-Item .env.example .env`
5. Ensure `server/.env` contains:
	- `MONGO_URI=mongodb://127.0.0.1:27017/ai_guidebook`

#### Option C — MongoDB Atlas (cloud)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create a database user (username/password).
3. Add your current IP address in **Network Access**.
4. Open **Connect → Drivers** and copy your connection string.
5. In `server/.env`, set `MONGO_URI` to the Atlas URI (replace `<username>`, `<password>`, and db name).
	- Example format: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ai_guidebook?retryWrites=true&w=majority`

### 2) Configure backend environment variables

In `server/.env`, set at least:

- `PORT=5000`
- `MONGO_URI=...`
- `JWT_SECRET=...` (any long random string for local development)

### Running the Backend

1. Navigate to the `/server` directory: `cd server`
2. Install dependencies: `npm install`
3. Start the server: `npm run dev`
4. You should see: `✅ Connected to MongoDB`

### Optional: Seed test data

From `/server`, run:

- `npm run seed`

This creates mock users (`alice`, `bob`) and sample usage/guideline/resource data.

### Running the Frontend

1. Navigate to the `/client` directory: `cd client`
2. Install dependencies: `npm install`
3. Start the Vite dev server: `npm run dev`

### Quick verification checklist

1. Backend logs show `✅ Connected to MongoDB`.
2. `http://localhost:5000/health` returns `{ "status": "ok" }`.
3. Frontend loads from Vite and login works with seeded users (if you ran seed).

---

## Architectural & Design Explanations

### Backend Setup (`/server`)
**Why Node.js/Express and MongoDB?**
Express is lightweight, scalable, and highly unopinionated, making it extremely easy to set up our exact mock route structure (`/usage`, `/guidelines`, `/resources`) rapidly. MongoDB was chosen for the database because it excels at storing unstructured or schema-flexible data like "Usage Data" and varying "Educational Resources". Our mock implementation uses an in-memory fallback since an actual MongoDB connection URI isn't provided yet.

### Frontend Setup (`/client`)
**Why React and Vite?**
React's component-based architecture is perfect for building configuring dashboards (FR8). We used Vite as our build tool because it provides an incredibly fast local development server and optimized build process compared to traditional tools like Create React App.

**Why Vanilla CSS and a Dark "Glassmorphism" UI? (NFR7, NFR8)**
To achieve a visual hierarchy with size, color, and spacing, we created our own design primitives (`client/src/index.css`) rather than relying on bloated frameworks. We chose a modern dark aesthetic using "glassmorphism" panels (`var(--panel-bg)` with backdrop-filter) to give the application a premium, trustworthy look. This strictly controls layout placement across pages (NFR8).

**Data Visualization (FR9, FR10)**
We utilized `recharts` because it is built natively for React components. It easily takes our fetched data, renders a responsive graph, and immediately re-renders upon state changes when the student filters the data by tool type.

**Dashboard Modules (FR11, FR12, FR13)**
The dashboard uses CSS Grid to separate concerns logically without clutter. The Usage Graph holds center stage, while the Ethical Guidelines, Training Modules (with an integrated quiz state), and Feedback Insights are housed in identifiable side-panels.
