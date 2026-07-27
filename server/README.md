# MediAI Pro — Backend (Server)

The Express + MongoDB REST API, Socket.io real-time layer, and Gemini AI service for MediAI Pro.

*→ Root documentation: [../README.md](../README.md)*  
*→ Frontend documentation: [../client/README.md](../client/README.md)*

---

## Overview

This package provides:
- A RESTful JSON API (Express 4) with JWT authentication and role-based authorization
- MongoDB persistence via Mongoose ODM (8 collections)
- Real-time notifications and WebRTC signaling via Socket.io
- AI-powered features (symptom chat, report analysis, diet plans, health tips) via Google Gemini SDK with a 6-model fallback chain
- Payment order creation and verification via Razorpay
- File upload handling via Multer (images, 5 MB limit)
- Automated appointment reminder notifications via a polling background service

---

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| express | ^4.19.2 | Web framework |
| mongoose | ^8.4.1 | MongoDB ODM |
| socket.io | ^4.8.3 | WebSocket server (notifications + WebRTC signaling) |
| @google/generative-ai | ^0.24.1 | Gemini AI SDK |
| jsonwebtoken | ^9.0.2 | JWT signing and verification |
| bcryptjs | ^2.4.3 | Password hashing |
| multer | ^1.4.5-lts.1 | Multipart file upload handling |
| razorpay | ^2.9.6 | Payment gateway SDK |
| cors | ^2.8.5 | Cross-origin resource sharing |
| dotenv | ^16.4.5 | Environment variable loading |
| axios | ^1.7.0 | HTTP client (available, not currently used in app code) |
| openai | ^4.52.0 | **Installed but not used in application code** |
| nodemon | ^3.1.11 | Dev auto-reload |

---

## Folder Structure

```
server/
├── .env                      # Local environment variables (gitignored)
├── .env.example              # ← Template; copy this and fill in values
├── server.js                 # Entry point: HTTP server, Socket.io, MongoDB, product seed
├── app.js                    # Express app factory: CORS, middleware, route mounting, error handler
├── package.json
├── test_gemini.js            # Standalone Gemini connectivity test script
├── controllers/
│   ├── authController.js     # Register, login, profile CRUD, doctor listing
│   ├── appointmentController.js  # Book, list, update appointment status
│   ├── recordController.js   # Create, list, get medical records; analyzeRecord (unmounted)
│   ├── medicationController.js   # CRUD for medication reminders
│   ├── prescriptionController.js # Create, list, get prescriptions
│   ├── aiController.js       # Delegates to aiService: report analysis, diet plan, health tip
│   ├── chatController.js     # Delegates to aiService: symptom chat
│   ├── notificationController.js # List, mark-as-read, mark-all-read
│   ├── pharmacyController.js     # Product CRUD, public listing, seed
│   └── paymentController.js      # Razorpay order creation and signature verification
├── middleware/
│   ├── authMiddleware.js     # protect (JWT verify), authorize(...roles)
│   └── uploadMiddleware.js   # Multer disk storage → /uploads, images only, 5 MB
├── models/
│   ├── User.js
│   ├── Appointment.js
│   ├── MedicalRecord.js
│   ├── Medication.js
│   ├── Notification.js
│   ├── Prescription.js
│   ├── Product.js
│   └── Order.js
├── routes/
│   ├── authRoutes.js
│   ├── appointmentRoutes.js
│   ├── recordRoutes.js
│   ├── medicationRoutes.js
│   ├── prescriptionRoutes.js
│   ├── aiRoutes.js
│   ├── chatRoutes.js
│   ├── notificationRoutes.js
│   ├── pharmacyRoutes.js
│   └── paymentRoutes.js
├── services/
│   └── aiService.js          # Gemini SDK wrapper with 6-model fallback chain
├── utils/
│   └── reminderService.js    # Appointment reminder polling (setInterval, 5 min)
└── uploads/                  # Runtime file upload directory (gitignored)
```

---

## Prerequisites

- Node.js ≥ 18.0.0 and npm ≥ 9
- MongoDB Atlas cluster (or local MongoDB ≥ 6.0)
- Google Gemini API key
- Razorpay account (test mode for development)

---

## Installation

```bash
# From monorepo root (recommended)
npm run install-all

# Or from server/
npm install
```

---

## Environment Variables

Create `server/.env` by copying the example:

```bash
cp server/.env.example server/.env
```

| Variable | Required | Description | Example |
|---|---|---|---|
| `PORT` | No | Port to listen on (default: 5000) | `5000` |
| `MONGODB_URI` | ✅ | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | ✅ | Secret used to sign JWTs (use a long random string) | `openssl rand -hex 64` output |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key | `AIza...` |
| `RAZORPAY_KEY_ID` | For payments | Razorpay public key | `rzp_test_XXXXXXXXXXXXXXXX` |
| `RAZORPAY_KEY_SECRET` | For payments | Razorpay secret key | `XXXXXXXXXXXXXXXXXXXXXXXX` |
| `CLIENT_URL` | No | Frontend origin for CORS (default: `http://localhost:5173`) | `https://your-frontend.example.com` |
| `NODE_ENV` | No | Runtime environment | `development` or `production` |

> **Security:** Generate a strong `JWT_SECRET`: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `start` | `node server.js` | Production start |
| `dev` | `nodemon server.js` | Development with auto-reload |
| `test` | — | No tests configured (exits with code 1) |

---

## Running the Server

### Development

```bash
# From monorepo root:
npm run server

# Or from server/ directly:
npm run dev
```

The server starts on port `5000` (or `PORT` from `.env`).  
On the first start with an empty database, 5 default pharmacy products are automatically seeded.

### Health Check

```
GET http://localhost:5000/health
→ { "status": "OK", "message": "Healthcare API is running" }
```

---

## Database Models

### User
| Field | Type | Notes |
|---|---|---|
| `name` | String | Required |
| `email` | String | Required, unique, indexed |
| `password` | String | bcrypt hashed via pre-save hook |
| `role` | Enum | `patient` (default) / `doctor` / `pharmacy` / `admin` |
| `specialization` | String | Doctors only |
| `qualifications` | String | Doctors only |
| `shopName` | String | Pharmacy owners only |
| `profileImage` | String | URL path to uploaded image |
| `bloodGroup`, `bio`, `phone`, `address`, `gender`, `dateOfBirth` | Mixed | Patient profile fields |

### Appointment
| Field | Type | Notes |
|---|---|---|
| `patient` | ObjectId → User | Required |
| `doctor` | ObjectId → User | Required |
| `date` | Date | Required |
| `status` | Enum | `pending` / `confirmed` / `cancelled` / `completed` |
| `reason` | String | |
| `notes` | String | |
| `isReminded` | Boolean | Set by `reminderService` when 15-min reminder is sent |

### MedicalRecord
| Field | Type | Notes |
|---|---|---|
| `patient` | ObjectId → User | |
| `doctor` | ObjectId → User | |
| `diagnosis` | String | |
| `prescription` | Array | Subdoc: `{medicine, dosage, frequency, duration}` |
| `attachments` | [String] | URLs to uploaded files |
| `notes` | String | |
| `aiAnalysis` | String | Populated by `analyzeRecord` controller (currently unmounted) |

### Medication
| Field | Type | Notes |
|---|---|---|
| `patient` | ObjectId → User | |
| `name`, `dosage`, `frequency` | String | Required |
| `time` | [String] | Array of time strings e.g. `['08:30', '20:30']` |
| `startDate`, `endDate` | Date | |
| `active` | Boolean | Soft-delete flag |

### Notification
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User | Recipient |
| `title`, `message` | String | Required |
| `type` | Enum | `appointment` / `prescription` / `alert` / `info` |
| `read` | Boolean | Default false |

### Prescription
| Field | Type | Notes |
|---|---|---|
| `patient`, `doctor` | ObjectId → User | |
| `medicines` | Array | Subdoc: `{name, dosage, frequency, duration}` |
| `diagnosis`, `instructions` | String | |

### Product
| Field | Type | Notes |
|---|---|---|
| `name`, `description` | String | Required |
| `price` | Number | Required, min 0 |
| `category` | Enum | `Generic` / `Clinical` / `OTC` / `Supplements` / `Equipment` |
| `image` | String | URL (defaults to Unsplash placeholder) |
| `stock` | Number | Required |
| `prescriptionRequired` | Boolean | Default false |
| `shopOwner` | ObjectId → User | Links product to pharmacy owner |
| `isActive` | Boolean | Soft-delete flag for listing filter |

### Order
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User | Buyer |
| `orderType` | Enum | `pharmacy` / `appointment` |
| `appointment` | ObjectId → Appointment | Optional; for appointment-type orders |
| `items` | Array | Subdoc: `{product → ObjectId, quantity, price}` |
| `totalAmount` | Number | Required |
| `currency` | String | Default `INR` |
| `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature` | String | Razorpay fields |
| `paymentStatus` | Enum | `pending` / `captured` / `failed` / `refunded` |
| `shippingAddress` | Object | `{street, city, state, zipCode}` |

---

## Full API Reference

### Auth (`/api/auth`)
| Method | Endpoint | Description | Auth | Role |
|---|---|---|---|---|
| POST | `/register` | Register new user | ❌ | — |
| POST | `/login` | Login, returns JWT + user object | ❌ | — |
| GET | `/doctors` | List doctors; supports `?search=&specialization=` | ✅ | any |
| GET | `/doctors/:id` | Get single doctor by ID | ✅ | any |
| GET | `/profile` | Get authenticated user's profile | ✅ | any |
| PUT | `/profile` | Update profile (fields vary by role) | ✅ | any |
| POST | `/profile/image` | Upload profile image (multipart/form-data, field: `image`) | ✅ | any |

### Appointments (`/api/appointments`)
| Method | Endpoint | Description | Auth | Role |
|---|---|---|---|---|
| POST | `/` | Book appointment `{doctorId, date, reason}` | ✅ | patient |
| GET | `/` | Get own appointments (filtered by role) | ✅ | patient/doctor |
| PUT | `/:id` | Update appointment status `{status}` | ✅ | patient/doctor/admin |

### Medical Records (`/api/records`)
| Method | Endpoint | Description | Auth | Role |
|---|---|---|---|---|
| POST | `/` | Create record (multipart; optional `file` field) | ✅ | doctor/admin |
| GET | `/` | Get own records (filtered by role) | ✅ | patient/doctor |
| GET | `/:id` | Get single record by ID | ✅ | patient/doctor/admin |

> ⚠️ `analyzeRecord` is defined in `recordController.js` but is **not registered on any route**.

### Medications (`/api/medications`)
| Method | Endpoint | Description | Auth | Role |
|---|---|---|---|---|
| POST | `/` | Add medication `{name, dosage, frequency, time[], startDate, endDate, notes}` | ✅ | any |
| GET | `/` | Get active medications for user | ✅ | any |
| PUT | `/:id` | Update medication (owner only) | ✅ | owner |
| DELETE | `/:id` | Soft-delete medication (owner only) | ✅ | owner |

### Prescriptions (`/api/prescriptions`)
| Method | Endpoint | Description | Auth | Role |
|---|---|---|---|---|
| POST | `/` | Create prescription `{patientId, medicines[], diagnosis, instructions}` | ✅ | doctor/admin |
| GET | `/` | Get own prescriptions (filtered by role) | ✅ | patient/doctor |
| GET | `/:id` | Get single prescription (owner/doctor/admin only) | ✅ | patient/doctor/admin |

### AI Features (`/api/ai-features`)
| Method | Endpoint | Description | Auth | Role |
|---|---|---|---|---|
| POST | `/analyze-report` | Analyze report text `{reportText}` → plain-language explanation | ✅ | any |
| POST | `/diet-plan` | Generate diet plan; merges DB profile + body `{weight, height, activityLevel, goal, medicalConditions, allergies, foodPreference}` | ✅ | any |
| GET | `/health-tip` | Get personalized daily health tip based on profile | ✅ | any |

### Chat (`/api/chat`)
| Method | Endpoint | Description | Auth | Role |
|---|---|---|---|---|
| POST | `/` | AI symptom chat `{messages: [{role, content}]}` → `{reply}` | ✅ | any |

### Notifications (`/api/notifications`)
| Method | Endpoint | Description | Auth | Role |
|---|---|---|---|---|
| GET | `/` | Get last 50 notifications for user | ✅ | any |
| PUT | `/read-all` | Mark all as read | ✅ | any |
| PUT | `/:id` | Mark single notification as read (owner only) | ✅ | owner |

### Pharmacy (`/api/pharmacy`)
| Method | Endpoint | Description | Auth | Role |
|---|---|---|---|---|
| GET | `/products` | List active products; supports `?category=&search=` | ❌ | public |
| GET | `/products/:id` | Get single product | ❌ | public |
| GET | `/my-products` | Get own products | ✅ | pharmacy |
| POST | `/products` | Add product `{name, description, price, category, stock, ...}` | ✅ | pharmacy |
| PUT | `/products/:id` | Update own product | ✅ | pharmacy (owner) |
| DELETE | `/products/:id` | Delete own product | ✅ | pharmacy (owner) |
| POST | `/seed` | Seed default products | ✅ | any (no role guard) |

### Payments (`/api/payments`)
| Method | Endpoint | Description | Auth | Role |
|---|---|---|---|---|
| POST | `/create-order` | Create Razorpay order `{amount, orderType, appointmentId?, items?}` | ✅ | any |
| POST | `/verify` | Verify payment `{razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId}` | ✅ | any |

---

## Authentication & Authorization

### `protect` middleware (`middleware/authMiddleware.js`)
1. Reads the `Authorization: Bearer <token>` header
2. Verifies the JWT using `process.env.JWT_SECRET`
3. Fetches the full user document from MongoDB (excluding password)
4. Attaches the user object to `req.user`
5. Returns 401 if token missing, expired, or user not found

### `authorize(...roles)` middleware
1. Checks `req.user.role` against the provided array of allowed roles
2. Returns 403 if the user's role is not permitted

**Token expiry:** 1 day (`expiresIn: '1d'`)

---

## AI Service Layer (`services/aiService.js`)

Wraps the `@google/generative-ai` SDK. All functions use a `runWithFallback()` helper that cycles through a list of model identifiers on 429 (rate limit) or 404 (not found) errors:

```
gemini-3.5-flash → gemini-flash-latest → gemini-3.1-flash-lite →
gemini-2.5-flash → gemini-2.0-flash → gemini-pro-latest
```

> ⚠️ The first three model names are likely non-canonical and will fail; effective fallback begins at `gemini-2.5-flash`.

### Exported Functions

| Function | Route Consumer | Behaviour |
|---|---|---|
| `analyzeSymptoms(messages)` | `POST /api/chat` | Multi-turn chat with system instruction; medical disclaimer appended to every response; emergency escalation on keywords |
| `analyzeMedicalReport(reportText)` | `POST /api/ai-features/analyze-report` | Single prompt; explains medical jargon in plain language |
| `generateDietPlan(userProfile)` | `POST /api/ai-features/diet-plan` | Builds a detailed prompt from user profile fields; returns a structured meal plan |
| `getHealthTip(userProfile)` | `GET /api/ai-features/health-tip` | Short personalized tip; graceful fallback string on any error |

---

## Real-Time & WebRTC Signaling (`server.js`)

### Socket.io Configuration
```js
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST'] }
});
global.io = io; // Controllers access io via global.io
```

### Events

| Event | Direction | Description |
|---|---|---|
| `join(userId)` | C → S | User joins their personal room by MongoDB `_id` |
| `notification(doc)` | S → C | Notification document pushed to user's personal room |
| `join-call(appointmentId)` | C → S | User joins a call room by appointment ID; peers receive `user-joined` |
| `user-joined(socketId)` | S → C | Notifies existing peer that a new user joined the call |
| `offer({to, offer})` | C → S → C | WebRTC SDP offer relay |
| `answer({to, answer})` | C → S → C | WebRTC SDP answer relay |
| `ice-candidate({to, candidate})` | C → S → C | ICE candidate relay |
| `user-left(socketId)` | S → C | Emitted on `disconnecting` to all rooms the socket was in |

### Notification Sources
Notifications are created in the DB and emitted via Socket.io by:
- `appointmentController.js` — on booking (to doctor) and status update (to patient)
- `prescriptionController.js` — on prescription creation (to patient)
- `reminderService.js` — 15-minute pre-appointment reminder (to both patient and doctor); runs every 5 minutes via `setInterval`

---

## Payment Integration (Razorpay)

### Flow
```
Client: POST /api/payments/create-order {amount, orderType, items}
  → Server validates RAZORPAY_KEY_ID (returns 503 if placeholder)
  → Server: razorpay.orders.create({amount * 100, currency: 'INR'})
  → Server: Order.create({..., razorpayOrderId, paymentStatus: 'pending'})
  → Response: {orderId, currency, amount, dbOrderId}

Client: opens Razorpay checkout widget with orderId + public key
  → User completes payment in Razorpay UI

Client: POST /api/payments/verify {razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId}
  → Server: HMAC-SHA256(razorpay_order_id + '|' + razorpay_payment_id, RAZORPAY_KEY_SECRET)
  → If signature matches: Order.paymentStatus = 'captured'
  → Response: {message: 'Payment verified successfully'}
```

> **Known gap:** Post-capture appointment confirmation is commented out in `paymentController.js` and not implemented.

---

## Error Handling

### Global Error Handler (`app.js`)
Catches errors passed via `next(err)` or thrown synchronously in middleware:
```js
app.use((err, req, res, next) => {
  // Logs: URL, Method, Error Name, Message, Stack
  res.status(err.status || 500).json({
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});
```

### Controller-Level Pattern
All controllers use `try/catch` and return:
- `res.status(4xx).json({ message: '...' })` for business logic errors
- `res.status(500).json({ message: error.message })` for unexpected errors

Stack traces are hidden in production (`NODE_ENV=production`).

---

## Known Backend Gaps

| Gap | Notes |
|---|---|
| `analyzeRecord` unmounted | Implemented in `recordController.js` but never registered in `recordRoutes.js` |
| `/api/pharmacy/seed` no role guard | Any authenticated user can trigger product seeding |
| Post-payment linkage incomplete | Appointment confirmation after payment is commented out in `paymentController.js` |
| `CLIENT_URL` missing from `.env` | CORS always falls back to the hardcoded `http://localhost:5173` |
| `openai` package unused | Installed but never imported |
| Gemini model names | First three in the fallback chain are likely non-canonical and will throw |
| No input validation middleware | No Joi, Zod, or express-validator on any route |
| Root `.env` duplicates `server/.env` | The root `.env` has different values for the same variables — this is ambiguous and error-prone |

---

## Testing

**No test suite exists.** Running `npm test` exits with code 1 (the npm default).  
`test_gemini.js` is a standalone connectivity script for the Gemini API, not a test framework file.

---

## Deployment Notes

- **No `Procfile`** (Heroku-style) has been created.
- **No `Dockerfile`** or `docker-compose.yml` has been created.
- **No CI/CD pipeline** configuration exists.
- For production: set `NODE_ENV=production`, provide all required env vars, and ensure your MongoDB Atlas IP allowlist includes your server's IP.
- The `uploads/` directory must be writable by the Node.js process. For production deployments (e.g., Vercel, Heroku), you will need to replace Multer disk storage with a cloud storage provider (e.g., AWS S3, Cloudinary).
