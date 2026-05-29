import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Loan } from '../models/Loan';
import { Payment } from '../models/Payment';
import { isValidTransition } from '../services/loan.service';

export async function getDisbursedLoans(req: AuthRequest, res: Response): Promise<void> {
  const loans = await Loan.find({ status: 'DISBURSED' })
    .populate('borrowerId', 'name email')
    .sort({ disbursedAt: -1 })
    .lean();
  res.json({ success: true, data: loans });
}

export async function getCompletedLoans(req: AuthRequest, res: Response): Promise<void> {
  const loans = await Loan.find({ status: 'CLOSED' })
    .populate('borrowerId', 'name email')
    .sort({ closedAt: -1 })
    .lean();
  res.json({ success: true, data: loans });
}

export async function recordPayment(req: AuthRequest, res: Response): Promise<void> {
  const { utrNumber, amount, paymentDate } = req.body;

  if (!utrNumber || !amount || !paymentDate) {
    res.status(400).json({ success: false, message: 'UTR number, amount, and payment date are required' });
    return;
  }

  const parsedAmount = Number(amount);
  if (parsedAmount <= 0) {
    res.status(400).json({ success: false, message: 'Payment amount must be greater than 0' });
    return;
  }

  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    res.status(404).json({ success: false, message: 'Loan not found' });
    return;
  }

  if (loan.status !== 'DISBURSED') {
    res.status(400).json({ success: false, message: 'Payments can only be recorded for disbursed loans' });
    return;
  }

  if (parsedAmount > loan.outstandingBalance) {
    res.status(400).json({
      success: false,
      message: `Payment amount (₹${parsedAmount}) exceeds outstanding balance (₹${loan.outstandingBalance})`,
    });
    return;
  }

  // Check UTR uniqueness
  const existingPayment = await Payment.findOne({ utrNumber });
  if (existingPayment) {
    res.status(409).json({ success: false, message: 'UTR number already exists' });
    return;
  }

  const payment = await Payment.create({
    loanId: loan._id,
    utrNumber,
    amount: parsedAmount,
    paymentDate: new Date(paymentDate),
  });

  // Decrement outstanding balance
  loan.outstandingBalance = parseFloat((loan.outstandingBalance - parsedAmount).toFixed(2));

  // Auto-close loan when fully repaid
  if (loan.outstandingBalance <= 0) {
    loan.outstandingBalance = 0;
    loan.status = 'CLOSED';
    loan.closedAt = new Date();
  }

  await loan.save();

  res.status(201).json({
    success: true,
    message: loan.status === 'CLOSED' ? 'Payment recorded. Loan closed.' : 'Payment recorded',
    data: { payment, loan },
  });
}
