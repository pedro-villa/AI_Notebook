# Requirement Traceability Matrix

This matrix maps the explicitly selected Functional Requirements (FRs) and Non-Functional Requirements (NFRs) to their corresponding system components, backend endpoints, and automated tests. This forms a complete validation loop ensuring each requirement is verified.

| Requirement ID | Description Summary | Primary Component(s) | Backend File/Endpoint | Automated Test(s) |
| :--- | :--- | :--- | :--- | :--- |
| **FR4** | Manually create AI usage logs. | `LogUsage.jsx` | `POST /api/logs` (stores `userId` from JWT) | `api.test.js` (logging flow test) |
| **FR5** | Logs include specific tools, tasks, output, time spent. | `LogUsage.jsx` | `UsageEntry.js` (Schema validation) | `api.test.js` (payload validation) |
| **FR8** | Personalized dashboard with configurable sections. | `Dashboard.jsx`, Settings Modal | `GET /api/dashboard/config`, `PATCH /api/dashboard/config` | `api.test.js` (Dashboard config tests) |
| **FR9** | View AI usage data as a graph. | `Dashboard.jsx` (Recharts integration) | `GET /api/usage` (JWT-scoped `userId` filter) | `api.test.js` (Usage fetch), `dashboard.test.js` (data pivot utilities) |
| **FR10** | Filter graph data by date or tool. | `Dashboard.jsx`, Filter Bar | `GET /api/usage?tool=&from=&to=` | `api.test.js` (query parameter tests) |
| **FR11** | Access ethical guidelines on the dashboard. | `Dashboard.jsx`, Guidelines Widget | `GET /api/guidelines` | `api.test.js` (Guidelines fetch) |
| **FR12** | Educational resources and quiz (80% pass). | `Dashboard.jsx`, ProgressiveQuiz component | `GET /api/resources`, `POST /api/quiz/submit` | `api.test.js` (Quiz passing logic) |
| **FR13** | Receive feedback via dashboard. | `Dashboard.jsx`, Weekly Insight | `GET /api/feedback` | `api.test.js` (Feedback generation logic) |
| **FR25** | Explicit consent requested before data collection. | `Dashboard.jsx` (Consent Modal), localStorage | Dashboard API calls are gated client-side until consent | Verified manually via UI flow. |
| **FR38** | Register account using university email. | `Register.jsx` | `POST /api/auth/register` (NTNU email validation + user creation) | `auth.test.js` (registration + email policy tests) |
| **FR40** | Log in to access the application. | `Login.jsx`, `AuthContext.jsx`, `ProtectedRoute.jsx` | `POST /api/auth/login` | `auth.test.js` (login token issuance) |
| **FR41** | Multi-factor authentication support. | `Register.jsx` (MFA-style step) | No production MFA backend verification layer | *Future implementation scope/MFA stub trace* |
| **FR42** | Automatic logout after 15 mins inactivity. | `AuthContext.jsx`, `AppLayout.jsx` (shared inactivity warning) | Backend JWT `expiresIn` | Tested manually via browser idle simulation. |
| **FR43** | Categorized users (base vs. authorized personnel). | `User.js` (role schema), `ProtectedRoute.jsx`, `AppLayout.jsx` | `authMiddleware` + `requireRole` middleware (`/api/admin/system-status`) | `api.test.js` (RBAC allow/deny route tests); current role model is `student`/`admin` (partial vs full role taxonomy) |
| **NFR6** | 95% UI Consistency Score. | `index.css`, `AppLayout.jsx`, shared panel/grid classes | N/A | Verified via explicit checklist and manual scoring rubric (below). |
| **NFR7** | Visual hierarchy (size, colour, spacing). | Custom CSS variables (`var(--accent-color)`, etc.) | N/A | Verified via design review. |
| **NFR8** | Predictable placement across pages. | `AppLayout.jsx` (Sidebar navigation) | N/A | Verified via component routing structure. |
| **NFR18** | Data in transit encrypted via TLS. | Deployment config (reverse proxy / hosting TLS termination) | Production HTTPS enforcement (environment-dependent) | Deployment-dependent; local development uses HTTP. |

## Validation Implementation

The validation loop is enforced through automated testing suites:
1. **Frontend Tests**: (`client/src/utils/dashboard.test.js`) Verifies that the client-side data transformations correctly pivot data for graphical representation (FR9).
2. **Backend API Tests**: (`server/tests/api.test.js`) Validates endpoints fetching usage statistics (FR9, FR10), returning guidelines and resources (FR11, FR12), evaluating quiz responses (FR12), and generating feedback insights (FR13).
3. **Backend Auth Tests**: (`server/tests/auth.test.js`) Validates FR38 registration success, NTNU email policy rejection, and FR40 login token issuance.

## NFR6 Manual Scoring Rubric (95% target)

Use this checklist across key pages (`/dashboard`, `/log`, `/declarations`, `/help`, `/admin`, `/system`) on desktop and mobile widths.

Scoring formula: **UI Consistency Score = (Passed Checks / Total Checks) × 100**

Checklist criteria:
1. Shared sidebar/header placement remains consistent.
2. Primary/secondary button styles match global tokens.
3. Panel card borders, radius, and spacing use the same primitives.
4. Typography hierarchy (H1/H2/body/meta) is consistent.
5. Form inputs and labels follow shared structure.
6. Icon size and alignment are visually consistent.
7. Color tokens are reused (no page-specific hard-coded palette).
8. Grid/flex spacing follows shared spacing scale.
9. Feedback banners/toasts use consistent pattern and placement.
10. Mobile layout preserves element order and intent.

Acceptance threshold: **≥ 95%** (at most one failed check in a 20-check run).
