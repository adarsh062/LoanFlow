# LoanFlow — Loan Management System

A production-quality internal fintech platform for managing loan applications end-to-end.

## Tech Stack

**Frontend**: Next.js 16 · TypeScript · Tailwind CSS v4 · Zustand · React Hook Form · Zod · Axios · React Hot Toast  
**Backend**: Node.js · Express · TypeScript · MongoDB · Mongoose · JWT · bcrypt · Multer

---

## Project Structure

```
loan-management/
├── client/          # Next.js 16 frontend
└── server/          # Express backend
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB running locally (or Atlas URI)

---

### Backend Setup

```bash
cd server
cp .env.example .env   # then edit .env with your values
npm install
```

### Frontend Setup

```bash
cd client
cp .env.example .env.local
npm install
```

---

## Environment Variables

### `server/.env`

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/loan-management` |
| `JWT_SECRET` | Secret for signing JWTs | *(required)* |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:3000` |

### `client/.env.local`

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL | `http://localhost:5000` |

---

## Running the Application

### Start Backend (development)

```bash
cd server
npm run dev
```

### Start Frontend (development)

```bash
cd client
npm run dev
```

Frontend: http://localhost:3000  
Backend API: http://localhost:5000

---

## Seed Database

```bash
cd server
npm run seed
```

This creates 6 demo users with password **`Password@123`**:

| Email | Role | Access |
|---|---|---|
| `admin@test.com` | ADMIN | All modules |
| `sales@test.com` | SALES | Sales module |
| `sanction@test.com` | SANCTION | Sanction module |
| `disbursement@test.com` | DISBURSEMENT | Disbursement module |
| `collection@test.com` | COLLECTION | Collection module |
| `borrower@test.com` | BORROWER | Borrower portal |

---

## Borrower Flow

```
Sign Up / Login
      ↓
Personal Details → BRE Validation (auto-runs on save)
      ↓ (passes)
Upload Salary Slip
      ↓
Loan Configuration & Apply
      ↓
PENDING → SANCTIONED → DISBURSED → CLOSED
```

**Step enforcement**: Each step is gated. A borrower cannot access Upload or Apply until BRE passes.

---

## Operations Workflow

1. **Sales**: View leads (borrowers who haven't applied yet)
2. **Sanction**: Approve or reject PENDING loans (rejection requires reason)
3. **Disbursement**: Mark SANCTIONED loans as DISBURSED
4. **Collection**: Record payments (UTR, amount, date). Loan auto-closes when `outstandingBalance = 0`

---

## Business Rules (BRE)

Loan applications are rejected if:
- Age < 23 or > 50
- Monthly salary < ₹25,000
- Employment mode = UNEMPLOYED
- Invalid PAN format (must match `AAAAA9999A`)

---

## Loan Calculation

```
Interest Rate = 12% per annum
SI = (P × R × T) / (365 × 100)
Total Repayment = Principal + Interest
```

Calculated live on the frontend (sliders) and recalculated server-side before saving.

---

## API Reference

| Method | Endpoint | Auth | Roles |
|---|---|---|---|
| POST | `/api/auth/signup` | No | — |
| POST | `/api/auth/login` | No | — |
| GET | `/api/borrower/profile` | Yes | BORROWER |
| POST | `/api/borrower/profile` | Yes | BORROWER |
| POST | `/api/borrower/bre` | Yes | BORROWER |
| POST | `/api/borrower/upload` | Yes | BORROWER |
| POST | `/api/borrower/apply` | Yes | BORROWER |
| GET | `/api/borrower/loan` | Yes | BORROWER |
| GET | `/api/sales/leads` | Yes | SALES, ADMIN |
| GET | `/api/sanction/loans` | Yes | SANCTION, ADMIN |
| PUT | `/api/sanction/loans/:id/approve` | Yes | SANCTION, ADMIN |
| PUT | `/api/sanction/loans/:id/reject` | Yes | SANCTION, ADMIN |
| GET | `/api/disbursement/loans` | Yes | DISBURSEMENT, ADMIN |
| PUT | `/api/disbursement/loans/:id/disburse` | Yes | DISBURSEMENT, ADMIN |
| GET | `/api/collection/loans` | Yes | COLLECTION, ADMIN |
| POST | `/api/collection/loans/:id/payment` | Yes | COLLECTION, ADMIN |
