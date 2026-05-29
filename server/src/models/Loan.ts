import mongoose, { Document, Schema } from 'mongoose';

export type LoanStatus = 'PENDING' | 'SANCTIONED' | 'REJECTED' | 'DISBURSED' | 'CLOSED';

export interface ILoan extends Document {
  borrowerId: mongoose.Types.ObjectId;
  principalAmount: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
  outstandingBalance: number;
  salarySlipUrl: string;
  status: LoanStatus;
  rejectionReason?: string;
  sanctionedAt?: Date;
  disbursedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema = new Schema<ILoan>(
  {
    borrowerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    principalAmount: { type: Number, required: true },
    tenureDays: { type: Number, required: true },
    interestRate: { type: Number, required: true, default: 12 },
    interestAmount: { type: Number, required: true },
    totalRepayment: { type: Number, required: true },
    // Outstanding balance starts at totalRepayment and decrements on each payment
    outstandingBalance: { type: Number, required: true },
    salarySlipUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'SANCTIONED', 'REJECTED', 'DISBURSED', 'CLOSED'],
      default: 'PENDING',
    },
    rejectionReason: { type: String },
    sanctionedAt: { type: Date },
    disbursedAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

export const Loan = mongoose.model<ILoan>('Loan', LoanSchema);
