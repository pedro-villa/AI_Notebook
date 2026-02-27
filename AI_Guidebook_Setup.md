# AI Guidebook for Students

This repository contains the setup for the AI Guidebook web application. It includes a `/server` (Node.js/Express) and `/client` (React + Vite) directory.

## Getting Started

**Prerequisite:** You must have [Node.js](https://nodejs.org/) installed to run this application.

### Running the Backend

1. Navigate to the `/server` directory: `cd server`
2. Install dependencies: `npm install`
3. Start the server: `npm run dev`

### Running the Frontend

1. Navigate to the `/client` directory: `cd client`
2. Install dependencies: `npm install`
3. Start the Vite dev server: `npm run dev`

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
