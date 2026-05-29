export type UserRole = 'ADMIN' | 'SALES' | 'SANCTION' | 'DISBURSEMENT' | 'COLLECTION' | 'BORROWER';
export type LoanStatus = 'PENDING' | 'SANCTIONED' | 'REJECTED' | 'DISBURSED' | 'CLOSED';
export type EmploymentMode = 'SALARIED' | 'SELF_EMPLOYED' | 'UNEMPLOYED';

export interface User {
  id?: string;
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface BorrowerProfile {
  _id: string;
  userId: string;
  fullName: string;
  pan: string;
  dob: string;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  breApproved: boolean;
}

export interface Loan {
  _id: string;
  borrowerId: string | User;
  principalAmount: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
  outstandingBalance: number;
  salarySlipUrl: string;
  status: LoanStatus;
  rejectionReason?: string;
  sanctionedAt?: string;
  disbursedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  loanId: string;
  utrNumber: string;
  amount: number;
  paymentDate: string;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
