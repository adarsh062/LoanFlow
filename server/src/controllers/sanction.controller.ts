import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Loan } from '../models/Loan';
import { isValidTransition } from '../services/loan.service';

export async function getPendingLoans(req: AuthRequest, res: Response): Promise<void> {
  const loans = await Loan.find({ status: 'PENDING' })
    .populate('borrowerId', 'name email')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: loans });
}

export async function approveLoan(req: AuthRequest, res: Response): Promise<void> {
  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    res.status(404).json({ success: false, message: 'Loan not found' });
    return;
  }

  if (!isValidTransition(loan.status, 'SANCTIONED')) {
    res.status(400).json({ success: false, message: `Cannot approve a loan in ${loan.status} status` });
    return;
  }

  loan.status = 'SANCTIONED';
  loan.sanctionedAt = new Date();
  await loan.save();

  res.json({ success: true, message: 'Loan sanctioned', data: loan });
}

export async function rejectLoan(req: AuthRequest, res: Response): Promise<void> {
  const { reason } = req.body;
  if (!reason || !reason.trim()) {
    res.status(400).json({ success: false, message: 'Rejection reason is required' });
    return;
  }

  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    res.status(404).json({ success: false, message: 'Loan not found' });
    return;
  }

  if (!isValidTransition(loan.status, 'REJECTED')) {
    res.status(400).json({ success: false, message: `Cannot reject a loan in ${loan.status} status` });
    return;
  }

  loan.status = 'REJECTED';
  loan.rejectionReason = reason.trim();
  await loan.save();

  res.json({ success: true, message: 'Loan rejected', data: loan });
}
