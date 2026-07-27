# MediAI Pro — Frontend (Client)

The React + Vite single-page application that serves the patient, doctor, and pharmacy owner interfaces for MediAI Pro.

*→ Root documentation: [../README.md](../README.md)*  
*→ Backend documentation: [../server/README.md](../server/README.md)*

---

## Overview

This package is a client-side SPA that communicates with the Express backend via REST API (Axios) and Socket.io. It handles:

- Role-based routing and dashboard selection (patient / doctor / pharmacy)
- JWT-based authentication persisted to `sessionStorage`
- Real-time notification delivery via Socket.io
- Peer-to-peer video calls via WebRTC (signaled through Socket.io)
- AI-assisted features rendered with `react-markdown`
- PDF export of medical content via `jsPDF` + `html2canvas`

---

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| react | ^19.2.0 | UI library |
| react-dom | ^19.2.0 | DOM renderer |
| react-router-dom | ^7.13.0 | Client-side routing |
| axios | ^1.13.5 | HTTP client with request interceptors |
| socket.io-client | ^4.8.3 | Real-time WebSocket client |
| tailwindcss | ^4.2.0 | Utility-first CSS framework |
| framer-motion | ^12.34.2 | Animation library |
| lucide-react | ^0.574.0 | Icon library |
| react-markdown | ^10.1.0 | Renders Gemini AI markdown responses |
| jspdf | ^4.2.1 | PDF generation |
| html2canvas | ^1.4.1 | DOM-to-canvas snapshot for PDF export |
| @tanstack/react-query | ^5.90.21 | Installed; **currently unused** |
| vite | ^7.3.1 | Build tool and dev server |
| @vitejs/plugin-react | ^5.1.1 | React Fast Refresh plugin |
| eslint | ^9.39.1 | Linter |

---

## Folder Structure

```
client/
├── .env                      # Local environment variables (gitignored)
├── .env.example              # ← Template; copy this and fill in values
├── .gitignore                # Vite default (extended by root .gitignore)
├── index.html                # HTML entry point (Vite)
├── vite.config.js            # Vite config: React plugin + Tailwind CSS v4 plugin
├── eslint.config.js          # ESLint flat config
├── package.json
└── src/
    ├── main.jsx              # React DOM root — mounts <App /> into #root
    ├── App.jsx               # Router, PrivateRoute guard, DashboardSelector
    ├── App.css               # Component-level CSS
    ├── index.css             # Global CSS / Tailwind base imports
    ├── api/
    │   └── api.js            # Axios instance: baseURL from VITE_API_URL, Bearer token interceptor
    ├── context/
    │   └── AuthContext.jsx   # Global auth state: user, loading, login, register, logout
    ├── assets/               # Static assets (images, SVGs)
    ├── components/           # Shared components — currently empty; use for reusable UI
    ├── utils/                # Utility functions — currently empty
    └── pages/                # 15 page-level components (see Pages section below)
        ├── Login.jsx
        ├── Signup.jsx
        ├── Dashboard.jsx
        ├── DoctorDashboard.jsx
        ├── PharmacyDashboard.jsx
        ├── DoctorProfile.jsx
        ├── Appointments.jsx
        ├── SymptomChat.jsx
        ├── Records.jsx
        ├── Medications.jsx
        ├── AIDashboard.jsx
        ├── Pharmacy.jsx
        ├── Profile.jsx
        ├── VideoCall.jsx
        └── EmergencyGuidance.jsx
```

---

## Prerequisites

- Node.js ≥ 18.0.0 and npm ≥ 9
- The MediAI Pro backend running at the URL configured in `VITE_API_URL` (see [server/README.md](../server/README.md))

---

## Installation

```bash
# From the monorepo root (recommended — installs all packages at once)
npm run install-all

# Or from this directory only
npm install
```

---

## Environment Variables

Create `client/.env` by copying the example:

```bash
cp client/.env.example client/.env
```

| Variable | Required | Description | Example Value |
|---|---|---|---|
| `VITE_API_URL` | ✅ | Full URL to the backend REST API base path | `http://localhost:5000/api` |
| `VITE_RAZORPAY_KEY_ID` | For payments | Razorpay **public** key ID (safe to expose client-side) | `rzp_test_XXXXXXXXXXXXXXXX` |

> All Vite environment variables must be prefixed with `VITE_` to be accessible in the browser bundle.  
> **Never** put secrets (JWT_SECRET, private API keys, database passwords) in `client/.env`.

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `vite` | Start dev server with HMR on **http://localhost:5173** |
| `build` | `vite build` | Build production bundle to `client/dist/` |
| `preview` | `vite preview` | Serve the production build locally for testing |
| `lint` | `eslint .` | Run ESLint with the flat config |

---

## Running the App

### Development

```bash
# From monorepo root (starts backend + frontend together):
npm start

# Frontend only:
npm run client

# Or from client/ directly:
npm run dev
```

App available at **http://localhost:5173**

The Axios instance points to `VITE_API_URL` (default: `http://localhost:5000/api`). Ensure the backend is running first.

### Production Build

```bash
npm run build
# Output written to client/dist/
```

---

## Routing Overview

All routes except `/login` and `/signup` are wrapped in `PrivateRoute`, which redirects unauthenticated users to `/login`. The `/dashboard` route uses `DashboardSelector` to render the correct dashboard component based on `user.role`.

| Route | Component | Auth Required | Intended Role(s) |
|---|---|---|---|
| `/login` | Login | ❌ | All |
| `/signup` | Signup | ❌ | All |
| `/dashboard` | DashboardSelector → Dashboard / DoctorDashboard / PharmacyDashboard | ✅ | Role-specific |
| `/profile` | Profile | ✅ | All |
| `/appointments` | Appointments | ✅ | Patient, Doctor |
| `/chat` | SymptomChat | ✅ | Patient |
| `/records` | Records | ✅ | Patient, Doctor |
| `/medications` | Medications | ✅ | Patient |
| `/ai-dashboard` | AIDashboard | ✅ | Patient |
| `/pharmacy` | Pharmacy | ✅ | Patient |
| `/emergency` | EmergencyGuidance | ✅ | All |
| `/pharmacy-dashboard` | PharmacyDashboard | ✅ | Pharmacy |
| `/video-call/:appointmentId` | VideoCall | ✅ | Patient, Doctor |
| `/doctor/:id` | DoctorProfile | ✅ | Patient |
| `/` | redirect → `/dashboard` | — | — |

---

## State Management

### AuthContext (`src/context/AuthContext.jsx`)

The only global state store in this application. All pages and the router consume it via the `useAuth()` hook.

| Exported Value | Type | Description |
|---|---|---|
| `user` | `object \| null` | Logged-in user: `_id`, `name`, `email`, `role`, `shopName`, `token` |
| `loading` | `boolean` | `true` during initial `sessionStorage` read on mount — prevents premature redirects |
| `login(email, password)` | `async function` | POSTs to `/auth/login`, sets user in state and `sessionStorage` |
| `register(name, email, password, role, shopName, specialization)` | `async function` | POSTs to `/auth/register`, sets user in state and `sessionStorage` |
| `logout()` | `function` | Clears user from state and `sessionStorage` |
| `setUser` | `function` | Direct state setter — used by Profile page after a profile update to sync the token |

**Persistence:** `sessionStorage` — state survives page reloads within the same tab, but is cleared when the tab or browser is closed. There is no refresh token mechanism.

**Note:** `@tanstack/react-query` is installed but not used. All data fetching is performed with `useEffect` + `useState` + direct `api.get()` / `api.post()` calls in each page component.

---

## Key Pages / Components

| File | Role | Key API Endpoints Called |
|---|---|---|
| `Login.jsx` | Login form | `POST /auth/login` (via AuthContext) |
| `Signup.jsx` | Registration with role selector (patient / doctor / pharmacy) | `POST /auth/register` (via AuthContext) |
| `Dashboard.jsx` | Patient dashboard; Socket.io notification listener | `GET /auth/profile`, `GET /appointments`, `GET /notifications`, `GET /ai-features/health-tip` |
| `DoctorDashboard.jsx` | Doctor dashboard with appointment and patient lists | `GET /auth/profile`, `GET /appointments`, `GET /records` |
| `PharmacyDashboard.jsx` | Pharmacy product management (add / edit / delete) | `GET /pharmacy/my-products`, `POST /pharmacy/products`, `PUT /pharmacy/products/:id`, `DELETE /pharmacy/products/:id` |
| `Appointments.jsx` | Book appointments; view and update status | `GET /auth/doctors`, `GET /appointments`, `POST /appointments`, `PUT /appointments/:id` |
| `SymptomChat.jsx` | Multi-turn AI chat with markdown rendering | `POST /chat` |
| `AIDashboard.jsx` | Report analysis, diet plan, health tip | `POST /ai-features/analyze-report`, `POST /ai-features/diet-plan`, `GET /ai-features/health-tip` |
| `Records.jsx` | View medical records | `GET /records` |
| `Medications.jsx` | Medication reminder CRUD | `GET /medications`, `POST /medications`, `PUT /medications/:id`, `DELETE /medications/:id` |
| `Pharmacy.jsx` | Patient-facing shop with cart + Razorpay checkout | `GET /pharmacy/products`, `POST /payments/create-order`, `POST /payments/verify` |
| `Profile.jsx` | View/edit profile, upload photo | `GET /auth/profile`, `PUT /auth/profile`, `POST /auth/profile/image` |
| `VideoCall.jsx` | WebRTC video call — Socket.io signaling only | (no REST calls; Socket.io events only) |
| `DoctorProfile.jsx` | View doctor public profile + book appointment | `GET /auth/doctors/:id`, `POST /appointments` |
| `EmergencyGuidance.jsx` | Static emergency protocols | (no API calls) |

---

## API Integration Pattern

All HTTP calls go through the shared Axios instance at `src/api/api.js`:

```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Automatically attaches Bearer token from sessionStorage on every request
api.interceptors.request.use((config) => {
  const userInfo = sessionStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

Usage in page components:

```js
import api from '../api/api';

// GET
const { data } = await api.get('/appointments');

// POST
const { data } = await api.post('/appointments', { doctorId, date, reason });

// PUT
await api.put(`/appointments/${id}`, { status: 'confirmed' });

// DELETE
await api.delete(`/medications/${id}`);
```

**Error handling:** Each page handles errors locally with `try/catch` and a local `error` state variable. There is no global error boundary or centralized toast notification system.

---

## Real-Time Features

### Socket.io — Notifications (`Dashboard.jsx`)

```js
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
socket.emit('join', user._id);          // join personal notification room
socket.on('notification', (notif) => {  // receive pushed notification
  setNotifications(prev => [notif, ...prev]);
});
// Cleanup on unmount:
return () => socket.disconnect();
```

### Socket.io + WebRTC — Video Calls (`VideoCall.jsx`)

Full signaling flow via Socket.io; peer-to-peer media via browser WebRTC API:

| Step | Socket Event | Direction |
|---|---|---|
| Join call room | `join-call` (appointmentId) | client → server |
| Peer joined | `user-joined` (peerId) | server → client |
| Send SDP offer | `offer` ({to, offer}) | client → server → peer |
| Send SDP answer | `answer` ({to, answer}) | client → server → peer |
| Exchange ICE candidates | `ice-candidate` ({to, candidate}) | client → server → peer |
| Peer disconnected | `user-left` | server → client |

---

## Known Frontend Gaps

| Gap | Notes |
|---|---|
| `GET /api/records/:id` not consumed | Single-record detail view endpoint exists on the backend but no page navigates to it |
| `PUT /api/notifications/:id` not consumed | Individual mark-as-read works on the backend; only "mark all read" is called from the frontend |
| `analyzeRecord` controller not reachable | Not mounted as a route on the backend either — no route exists yet |
| `@tanstack/react-query` unused | Installed; consider migrating `useEffect`-based fetching to `useQuery` / `useMutation` |
| No global notification indicator | Notifications are fetched inline in the dashboard; no persistent unread badge or bell icon |
| No 404 fallback route | `App.jsx` has no `<Route path="*">` — undefined paths fail silently |

---

## Build & Deployment

```bash
npm run build
# Output: client/dist/ — serve as a static site
```

Configure your host (Vercel, Nginx, etc.) to serve `index.html` for all routes (SPA history fallback).

Set `VITE_API_URL` to the production backend URL at build time:

```bash
VITE_API_URL=https://your-api.example.com/api npm run build
```

---

## Contributing (Frontend)

- All new pages go in `src/pages/`
- Reusable UI components go in `src/components/` (currently empty — please use it)
- Utility/helper functions go in `src/utils/` (currently empty)
- Use the shared `api` instance for all HTTP calls — do not create separate Axios instances
- Follow the existing ESLint rules defined in `eslint.config.js`
- Do not commit lint artifact files (`dashboard_lint.json`, `lint_output.txt`, `lint_results.txt`)
- Do not commit the `dist/` build output
