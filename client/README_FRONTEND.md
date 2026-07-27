# 🎨 MediAI — Frontend Application Guide

> React 18 + Vite + Tailwind CSS frontend for the MediAI healthcare platform.

---

## Quick Start

```bash
cd client
npm install
npm run dev
```

Client runs at: `http://localhost:5173`

---

## Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router DOM v6
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **HTTP Client:** Axios (with JWT interceptor)
- **Real-Time:** Socket.io Client
- **Video Calls:** Native WebRTC API

---

## Pages & Routes

| Route | Component | Role Access |
|-------|-----------|-------------|
| `/login` | `Login.jsx` | Public |
| `/signup` | `Signup.jsx` | Public |
| `/dashboard` | Auto-selects by role | All |
| `/dashboard` | `Dashboard.jsx` | Patient |
| `/dashboard` | `DoctorDashboard.jsx` | Doctor / Admin |
| `/dashboard` | `PharmacyDashboard.jsx` | Pharmacy |
| `/chat` | `SymptomChat.jsx` | Patient |
| `/appointments` | `Appointments.jsx` | Patient |
| `/records` | `Records.jsx` | Patient / Doctor |
| `/medications` | `Medications.jsx` | Patient |
| `/ai-dashboard` | `AIDashboard.jsx` | Patient |
| `/pharmacy` | `Pharmacy.jsx` | Patient |
| `/pharmacy-dashboard` | `PharmacyDashboard.jsx` | Pharmacy |
| `/video-call/:appointmentId` | `VideoCall.jsx` | Doctor / Patient |
| `/profile` | `Profile.jsx` | All |
| `/emergency` | `EmergencyGuidance.jsx` | All |

---

## Global Auth State

`AuthContext.jsx` manages:
- `user` — current logged in user object (stored in `localStorage`)
- `login(email, password)` — logs in and persists JWT
- `register(name, email, password, role, shopName)` — registers new user
- `logout()` — clears user and token

---

## API Configuration

All requests go through `/src/api/api.js`:
- Base URL from `VITE_API_URL` env variable
- Token automatically attached via Axios request interceptor

---

## Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Role-Based Dashboard Routing

The `DashboardSelector` component in `App.jsx` automatically routes users:

```javascript
if (user.role === 'doctor' || user.role === 'admin') → DoctorDashboard
if (user.role === 'pharmacy')                          → PharmacyDashboard
else                                                   → Dashboard (Patient)
```

---

## Custom WebRTC Video Call Flow

```
Caller (Doctor)                    Signaling Server              Callee (Patient)
      |                                   |                             |
      |──── join-call(appointmentId) ────►|                             |
      |                                   |◄── join-call(appointmentId)─|
      |                                   |──── user-joined(peerId) ───►|
      |                                   |                             |
      |◄── user-joined(peerId) ───────────|                             |
      |── createOffer() ──────────────────────────► offer ────────────►|
      |                                   |                             |── createAnswer()
      |◄──────────────────────── answer ──────────────────────────────|
      |── setRemoteDescription ──────────────────────────────────────►|
      |                                                                 |
      |◄═══════════════ ICE Candidates Exchange ════════════════════►  |
      |                                                                 |
      |◄═══════════════════  P2P Video Stream  ═══════════════════════►|
```

---

## Scripts

```bash
npm run dev      # Start dev server (hot reload)
npm run build    # Build for production
npm run preview  # Preview production build
```
