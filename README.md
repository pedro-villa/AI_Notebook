# AI_Notebook
A mockup of a full-stack web app built to track safe and ethical use of AI, built as a project for TDT4242: Advanced Software Engineering

## System Dependencies Addressed

In order to support the isolated implementation of the required features (Personalised Dashboard, AI Usage Graphs, Ethical Filtering, Educational Quizzes, and Weekly Feedback), this system explicitly implements and depends on the following foundational elements:
- **Authentication & User Identity**: Required to guarantee the dashboard personalisations (FR8), historical usage data tracking (FR18/FR19), session timeouts (FR42, FR37), and role-based access control (FR43).
- **Data Collection/Logging**: Required to power the dashboard metrics, AI usage graphs (FR9), and filter functionality (FR10).

> **Note on the Authentication System**: The login/auth boundary is not a mock-up. The project uses JWT-based authentication for protected routes (FR40), token-driven backend authorization, 15-minute inactivity handling (FR42), and end-to-end manual registration (FR38) via `POST /api/auth/register` with NTNU email validation.

## Quick start

1. Follow the setup guide in `AI_Guidebook_Setup.md` (includes Docker/local/Atlas MongoDB setup).
2. Start backend from `server`: `npm install` then `npm run dev`
3. Start frontend from `client`: `npm install` then `npm run dev`
