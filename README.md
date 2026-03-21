# AI Notebook

AI Notebook is a small full-stack app for tracking safe and ethical AI usage in a student setting.

It includes a React frontend and a Node/Express + MongoDB backend.

## Documentation Index

- Setup and environment bootstrapping: `AI_Guidebook_Setup.md`
- Requirement traceability source: `Traceability_Matrix.md`
- Server implementation: `server/`
- Client implementation: `client/`
- Cross-project test runner: `scripts/run-tests.mjs`

## Architecture Overview

- Frontend: React + Vite (`client/`)
- Backend: Node.js + Express (`server/`)
- Database: MongoDB (`MONGO_URI` in `server/.env`)
- Authentication: JWT-based auth (`/api/auth/login`, `/api/auth/register`)

## Quick Start

1. Follow `AI_Guidebook_Setup.md` from start to finish.
2. Start backend from `server/`:
	- `npm install`
	- `npm run dev`
3. Start frontend from `client/`:
	- `npm install`
	- `npm run dev`
4. Open the app at `http://localhost:5173`.

## Quality Gates

Run these from repository root:

- Full automated tests: `npm run test`
- Full automated tests with coverage: `npm run test -- --coverage`
- Client only: `npm run test:client`
- Server only: `npm run test:server`

Current test status:

- Client test suite: passing
- Server test suite: passing

## Test Data and Roles

Optional seed data can be generated from `server/`:

- `npm run seed`

Seeded accounts:

- `alice` / `password123`
- `bob` / `password123`

Both are seeded as `student` role.

For role-based system testing (for example admin-only endpoints), register a dedicated admin test user by sending `role: "admin"` in the registration payload.

## Notes

- Keep environment-specific secrets out of version control (`server/.env`, `client/.env`).
- Use `server/.env.example` and `client/.env.example` as templates.
