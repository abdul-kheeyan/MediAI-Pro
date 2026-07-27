# MediAI Pro

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-19.x-61DAFB)

A full-stack healthcare platform connecting patients, doctors, and pharmacy owners on a single AI-powered interface. MediAI Pro enables appointment booking, real-time video consultations (WebRTC), AI-assisted symptom triage (Google Gemini), medication reminders, medical record management, and an integrated online pharmacy with Razorpay payments.

---

## Key Features

### 🧑‍⚕️ Patient
- Register, log in, and manage a personal health profile (blood group, DOB, gender, address)
- Browse doctors by name or specialization and view their profiles
- Book, view, and cancel appointments; receive real-time appointment status notifications
- Join video consultations with doctors (WebRTC, in-browser, no plugin required)
- Chat with the AI medical assistant for symptom guidance (emergency escalation included)
- Upload and view medical records with AI-generated plain-language explanations
- Track active medications with dosage, frequency, and schedule reminders
- View prescriptions issued by doctors
- Shop for OTC medicines, supplements, and medical equipment; pay via Razorpay
- Access the AI Dashboard: medical report analysis, personalized diet plan, daily health tip
- Emergency guidance page for immediate safety protocols

### 👨‍⚕️ Doctor
- Role-specific dashboard with today's appointments and patient list
- Confirm, cancel, or complete appointment requests; notifications pushed to patient in real time
- Create and issue prescriptions to patients (notification emitted via Socket.io)
- Create medical records with diagnosis, prescription notes, file attachment, and AI analysis
- View patient medical records
- Join video consultations via appointment link

### 🏪 Pharmacy Owner
- Role-specific dashboard with product catalogue management
- Add, edit, and delete own products (name, description, price, stock, category, prescription requirement)
- View all products in the catalogue

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Browser (Patient / Doctor / Pharmacy)         │
│  React 19 + Vite · Tailwind CSS · Framer Motion · Lucide Icons  │
│  react-router-dom v7 · Axios (JWT interceptor) · socket.io-client│
│  html2canvas + jsPDF (PDF export) · react-markdown              │
└────────────────┬─────────────────────────┬───────────────────────┘
                 │  REST API (HTTP/JSON)    │  WebSocket (Socket.io)
                 ▼                         ▼
┌────────────────────────────────────────────────────────────────┐
│                   Express 4 + Node.js (server.js)              │
│  /api/auth  /api/appointments  /api/pharmacy  /api/ai-features │
│  /api/chat  /api/records  /api/medications  /api/prescriptions │
│  /api/notifications  /api/payments                             │
│                                                                │
│  JWT (jsonwebtoken) · bcryptjs · Multer (file uploads)         │
│                                                                │
│  ┌────────────────────────────┐  ┌──────────────────────────┐  │
│  │  aiService.js (Gemini SDK) │  │  reminderService.js       │  │
│  │  6-model fallback chain    │  │  (setInterval, 5 min)     │  │
│  └────────────────────────────┘  └──────────────────────────┘  │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Socket.io — personal rooms (notifications) +          │   │
│  │  call rooms (WebRTC signaling: offer / answer / ICE)   │   │
│  └────────────────────────────────────────────────────────┘   │
└──────────────────────────┬─────────────────────────────────────┘
                           │  Mongoose ODM
                           ▼
              ┌────────────────────────────┐
              │       MongoDB Atlas         │
              │  Users · Appointments       │
              │  MedicalRecords · Medications│
              │  Notifications · Prescriptions│
              │  Products · Orders          │
              └────────────┬───────────────┘
                           │
              ┌────────────┴───────────────┐
              │       Razorpay API          │
              │  (Payment gateway)          │
              └────────────────────────────┘
```

---

## Monorepo Structure

```
MEDI/
├── .env.example            # Template — copy to .env and fill values
├── .gitignore              # Monorepo-wide ignore rules
├── package.json            # Root scripts: start, server, client, install-all
├── README.md               # This file
│
├── ai/                     # Empty — reserved for future standalone AI scripts
├── docs/                   # Empty — reserved for documentation assets
├── uploads/                # Runtime: user-uploaded profile images (gitignored)
│
├── client/                 # React + Vite frontend
│   └── README.md           # → See client/README.md
│
└── server/                 # Express + MongoDB backend
    └── README.md           # → See server/README.md
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | React | ^19.2.0 |
| Build Tool | Vite | ^7.3.1 |
| CSS | Tailwind CSS | ^4.2.0 |
| Routing | react-router-dom | ^7.13.0 |
| HTTP Client | Axios | ^1.13.5 |
| Real-Time Client | socket.io-client | ^4.8.3 |
| Animations | Framer Motion | ^12.34.2 |
| Icons | Lucide React | ^0.574.0 |
| PDF Export | jsPDF + html2canvas | ^4.2.1 / ^1.4.1 |
| Backend Framework | Express | ^4.19.2 |
| Database | MongoDB (Mongoose) | ^8.4.1 |
| Real-Time Server | Socket.io | ^4.8.3 |
| AI Provider | Google Gemini (`@google/generative-ai`) | ^0.24.1 |
| Authentication | jsonwebtoken + bcryptjs | ^9.0.2 / ^2.4.3 |
| File Uploads | Multer | ^1.4.5-lts.1 |
| Payments | Razorpay | ^2.9.6 |
| Dev Runner | Concurrently + Nodemon | ^9.2.1 / ^3.1.11 |

---

## Prerequisites

- **Node.js** ≥ 18.0.0 and **npm** ≥ 9
- **MongoDB Atlas** account (or a local MongoDB instance)
- **Google Gemini API key** (from [Google AI Studio](https://aistudio.google.com/))
- **Razorpay account** with a test/live key pair (for payment features)

---

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd MEDI
npm run install-all
```

This installs dependencies at root, `/server`, and `/client` in one command.

### 2. Configure Environment Variables

Create `.env` files from the provided examples:

```bash
# Server configuration
cp server/.env.example server/.env
# Edit server/.env — see server/README.md for full variable list

# Client configuration
cp client/.env.example client/.env
# Edit client/.env — see client/README.md for full variable list
```

> **Security:** Never commit real secrets. All `.env` files are gitignored.

### 3. Run in Development

```bash
# Start both backend (port 5000) and frontend (port 5173) concurrently
npm start

# Or run them separately:
npm run server   # backend only
npm run client   # frontend only
```

### 4. Access the App

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| Health Check | http://localhost:5000/health |

---

## Environment Variables Overview

This monorepo uses two separate `.env` files:

| Location | Used by | Documentation |
|---|---|---|
| `server/.env` | Express server, MongoDB, Gemini, Razorpay | → [server/README.md](./server/README.md#environment-variables) |
| `client/.env` | Vite build, frontend API URL, Razorpay public key | → [client/README.md](./client/README.md#environment-variables) |

---

## Core User Flows

### Authentication
1. User registers at `/signup` selecting a role (patient / doctor / pharmacy) and providing role-specific fields
2. A JWT is returned on register/login and stored in `sessionStorage`
3. All subsequent API calls include `Authorization: Bearer <token>` via the Axios interceptor
4. Session is cleared on logout or tab close (no refresh token mechanism)

### Appointment Booking (Patient → Doctor)
1. Patient browses to `/appointments`, selects a doctor and date
2. `POST /api/appointments` creates the appointment (status: `pending`); the doctor receives a Socket.io `notification` event in real time
3. Doctor confirms or cancels from their dashboard; the patient receives a status-update notification
4. Both parties navigate to `/video-call/:appointmentId` for the consultation

### AI Symptom Chat
1. Patient navigates to `/chat`
2. Messages are sent to `POST /api/chat` → `aiService.analyzeSymptoms()` via Gemini
3. Responses are rendered as markdown; emergency keywords trigger an explicit call-to-action

### Video Consultation (WebRTC)
1. Both users join `/video-call/:appointmentId`
2. Each emits `join-call` to the server; Socket.io relays `user-joined` to the peer
3. WebRTC SDP `offer`/`answer` and ICE candidates are exchanged via the server relay
4. Peer-to-peer video/audio stream is established entirely in-browser

### Pharmacy Checkout (Patient)
1. Patient browses `/pharmacy`, adds products to cart
2. Checkout triggers `POST /api/payments/create-order` → a Razorpay order is created server-side
3. The Razorpay checkout widget opens client-side with the public key
4. On payment success, `POST /api/payments/verify` validates the HMAC signature and marks the order as `captured`

---

## Known Limitations / Incomplete Features

- **`analyzeRecord` endpoint** — implemented in `recordController.js` but not mounted on any route; currently unreachable via HTTP.
- **Post-payment appointment confirmation** — commented out in `paymentController.js`; orders of type `appointment` do not auto-confirm the appointment after payment.
- **Pharmacy seed route** (`POST /api/pharmacy/seed`) — no role guard; any authenticated user can trigger it.
- **`@tanstack/react-query`** — installed in both root and client `package.json` but not used anywhere in the frontend.
- **`openai` npm package** — installed in `server/package.json` but never imported or called in application code.
- **Medication delete** — soft-delete only (sets `active = false`); no hard-delete route.
- **No input validation middleware** — no Joi, Zod, or express-validator on any route.
- **No test suite** — the server `test` script exits with code 1.
- **No deployment configuration** — no Procfile, Dockerfile, or CI/CD pipeline.
- **Session storage only** — auth state is lost on tab close; no refresh token or "remember me" option.
- **No 404 fallback route** — undefined routes in the SPA produce a silent failure.

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: describe your change'`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request with a clear description.

**Please do not commit `.env` files or any real credentials.**

---

## License

This project is licensed under the **MIT License**.
A `LICENSE` file has not yet been added to the repository — create one at the root level.

---

## Contact / Support

For questions or issues, open a GitHub Issue in this repository.

---

*→ Backend documentation: [server/README.md](./server/README.md)*  
*→ Frontend documentation: [client/README.md](./client/README.md)*
