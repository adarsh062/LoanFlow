# 🚀 LoanFlow — Loan Management System

A full-stack Loan Management System built using **Next.js, Express, MongoDB, and TypeScript** to manage the complete loan lifecycle — from borrower onboarding and loan application to approval, disbursement, repayment, and closure.

## 🌐 Live Demo

**Frontend:**  
https://loan-flow-steel.vercel.app/login

**Backend API:**  
https://loanflow-21z9.onrender.com/

> ⚠️ Backend is hosted on Render's free tier. The first request may take 30–60 seconds if the service has been inactive.

---

## ✨ Features

### 👤 Borrower Portal
- User Registration & Login
- Personal Details Submission
- BRE (Business Rule Engine) Validation
- Salary Slip Upload
- Loan Eligibility Check
- Loan Application Submission
- Live Loan Calculation

### 🏢 Operations Dashboard
- Sales Module
- Sanction Module
- Disbursement Module
- Collection Module
- Admin Dashboard

### 🔒 Security
- JWT Authentication
- Password Hashing (bcrypt)
- Protected Routes
- Role-Based Access Control (RBAC)
- Backend Authorization Middleware

---

## 🏗️ Tech Stack

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

## 📂 Project Structure

```text
LoanFlow
├── client/     # Next.js Frontend
├── server/     # Express Backend
└── README.md
```

---

## 🔑 Demo Credentials

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

## 🔄 Borrower Journey

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

## 📈 Loan Lifecycle

```text
PENDING
   ↓
SANCTIONED
   ↓
DISBURSED
   ↓
CLOSED
```

Rejected Flow:

```text
PENDING
   ↓
REJECTED
```

---

## 📋 Business Rules (BRE)

A loan application is rejected if:

- Age is below 23 years
- Age is above 50 years
- Monthly salary is below ₹25,000
- Employment status is UNEMPLOYED
- PAN format is invalid

Valid PAN Format:

```text
AAAAA9999A
```

---

## 💰 Loan Calculation

```text
Interest Rate = 12% per annum

SI = (P × R × T) / (365 × 100)

Total Repayment = Principal + Interest
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)

```env
PORT=5000
MONGODB_URI=
JWT_SECRET=
CLIENT_URL=
```

### Frontend (`client/.env.local`)

```env
NEXT_PUBLIC_API_URL=
```

---

## 🚀 Installation

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

## ▶️ Running the Project

### Terminal 1 — Backend

```bash
cd server
npm run dev
```

### Terminal 2 — Frontend

```bash
cd client
npm run dev
```

Frontend:
http://localhost:3000

Backend:
http://localhost:5000

---

## 🌱 Seed Demo Users

```bash
cd server
npm run seed
```

---

## 🔐 Role-Based Access

| Role | Access |
|--------|--------|
| Admin | All Modules |
| Sales | Sales Module |
| Sanction | Sanction Module |
| Disbursement | Disbursement Module |
| Collection | Collection Module |
| Borrower | Borrower Portal |

---

## 📝 Notes

- RBAC is enforced on both frontend and backend.
- UTR numbers are unique across all payments.
- Loan calculations are verified server-side.
- Loans automatically close when fully repaid.

---