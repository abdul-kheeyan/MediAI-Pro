# 🔧 MediAI — Backend API Documentation

> Node.js + Express + MongoDB + Socket.io backend powering the MediAI healthcare platform.

---

## Quick Start

```bash
cd server
npm install
npm run dev
```

Server runs at: `http://localhost:5000`

---

## Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB via Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Real-Time:** Socket.io (Notifications + WebRTC Signaling)
- **AI:** OpenAI GPT-3.5 Turbo
- **File Storage:** Multer (local `uploads/` folder)
- **Payments:** Razorpay

---

## Folder Structure

```
server/
├── app.js                  # Express app configuration + route mounting
├── server.js               # Entry point — HTTP server + Socket.io setup
├── controllers/            # Business logic for each resource
├── routes/                 # Express routers
├── models/                 # Mongoose schemas
├── middleware/
│   ├── authMiddleware.js   # JWT protect() + role authorize()
│   └── uploadMiddleware.js # Multer configuration
├── services/
│   └── aiService.js        # OpenAI API wrapper
└── .env
```

---

## Database Models

| Model | Key Fields |
|-------|-----------|
| `User` | name, email, password (hashed), role (patient/doctor/pharmacy/admin), shopName, specialization |
| `Appointment` | patient, doctor, date, reason, status (pending/confirmed/cancelled) |
| `MedicalRecord` | patient, doctor, diagnosis, prescription, notes, attachments, aiAnalysis |
| `Prescription` | patient, doctor, medicines[], diagnosis, instructions |
| `Medication` | user, name, dosage, frequency, time[], notes |
| `Notification` | user, title, message, type, isRead |
| `Product` | name, price, category, stock, shopOwner, isActive, prescriptionRequired |
| `Order` | user, items[], totalAmount, paymentStatus, razorpayOrderId |

---

## Authentication

All protected routes use the `protect` middleware:

```
Authorization: Bearer <jwt_token>
```

Role-restricted routes additionally use:
```javascript
router.post('/route', protect, authorize('doctor', 'admin'), handler);
```

---

## Real-Time Events (Socket.io)

| Event | Direction | Description |
|-------|-----------|-------------|
| `join` | Client → Server | User joins their personal notification room |
| `notification` | Server → Client | Push new notification to user |
| `join-call` | Client → Server | Join a WebRTC call room by appointmentId |
| `user-joined` | Server → Client | Notifies first peer that second peer joined |
| `offer` | Client → Server → Client | WebRTC SDP offer relay |
| `answer` | Client → Server → Client | WebRTC SDP answer relay |
| `ice-candidate` | Client → Server → Client | ICE candidate relay |

---

## Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mediai
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=sk-your-key
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

---

## Scripts

```bash
npm run dev    # Start with nodemon (hot reload)
npm start       # Production start
```
