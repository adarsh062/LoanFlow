# LoanFlow — Full Stack Loan Management System

A production-ready Loan Management System that manages the complete loan lifecycle, from borrower onboarding and application to approval, disbursement, repayment, and closure.

## Live Demo

Frontend:
https://loan-flow-steel.vercel.app/login

Backend:
https://loanflow-21z9.onrender.com/

> Note: The backend is hosted on Render's free tier. If the service has been idle, the first request may take up to 30–60 seconds while the server wakes up.

---

## Tech Stack

### Frontend
- Next.js 16
- TypeScript
- Tailwind CSS v4
- Zustand
- React Hook Form
- Zod
- Axios

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt
- Multer

---

## Demo Credentials

Password for all accounts:

```text
Password@123
```

| Email | Role |
|---------|---------|
| admin@test.com | ADMIN |
| sales@test.com | SALES |
| sanction@test.com | SANCTION |
| disbursement@test.com | DISBURSEMENT |
| collection@test.com | COLLECTION |
| borrower@test.com | BORROWER |

---

## Project Structure

```text
client/     → Next.js Frontend
server/     → Express Backend
```

---

## Environment Variables

### server/.env

```env
PORT=5000
MONGODB_URI=
JWT_SECRET=
CLIENT_URL=
```

### client/.env.local

```env
NEXT_PUBLIC_API_URL=
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/adarsh062/LoanFlow.git
cd LoanFlow
```

Install backend dependencies:

```bash
cd server
npm install
```

Install frontend dependencies:

```bash
cd ../client
npm install
```

---

## Running the Project

### Terminal 1

Start Backend:

```bash
cd server
npm run dev
```

### Terminal 2

Start Frontend:

```bash
cd client
npm run dev
```

Frontend:
http://localhost:3000

Backend:
http://localhost:5000

---

## Seed Demo Users

```bash
cd server
npm run seed
```

---

## Borrower Flow

```text
Sign Up / Login
      ↓
Personal Details
      ↓
BRE Validation
      ↓
Salary Slip Upload
      ↓
Loan Configuration
      ↓
Apply Loan
      ↓
PENDING
```

---

## Loan Lifecycle

```text
PENDING
   ↓
SANCTIONED
   ↓
DISBURSED
   ↓
CLOSED
```

Rejected loans:

```text
PENDING
   ↓
REJECTED
```

---

## Business Rules (BRE)

Applications are rejected if:

- Age is below 23 years
- Age is above 50 years
- Monthly salary is below ₹25,000
- Employment status is UNEMPLOYED
- PAN format is invalid

Valid PAN format:

```text
AAAAA9999A
```

---

## Loan Calculation

```text
Interest Rate = 12% per annum

SI = (P × R × T) / (365 × 100)

Total Repayment = Principal + Interest
```

---

## Operations Workflow

### Sales
Tracks registered borrowers who have not yet applied for a loan.

### Sanction
Approves or rejects pending loans.

### Disbursement
Marks approved loans as disbursed.

### Collection
Records repayments and automatically closes loans when the outstanding balance reaches zero.

---

## Security

- JWT Authentication
- Password Hashing using bcrypt
- Protected Routes
- Role-Based Access Control (RBAC)
- Backend Authorization Middleware

---

## Notes

- Role-based access is enforced on both frontend and backend.
- UTR numbers must be unique.
- Loan calculations are validated on the server before saving.
- Loans automatically close when fully repaid.

---