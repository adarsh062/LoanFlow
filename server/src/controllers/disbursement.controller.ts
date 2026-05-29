import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Loan } from '../models/Loan';
import { isValidTransition } from '../services/loan.service';

export async function getSanctionedLoans(req: AuthRequest, res: Response): Promise<void> {
  const loans = await Loan.find({ status: 'SANCTIONED' })
    .populate('borrowerId', 'name email')
    .sort({ sanctionedAt: -1 })
    .lean();
  res.json({ success: true, data: loans });
}

export async function disburse(req: AuthRequest, res: Response): Promise<void> {
  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    res.status(404).json({ success: false, message: 'Loan not found' });
    return;
  }

  if (!isValidTransition(loan.status, 'DISBURSED')) {
    res.status(400).json({ success: false, message: `Cannot disburse a loan in ${loan.status} status` });
    return;
  }

  loan.status = 'DISBURSED';
  loan.disbursedAt = new Date();
  await loan.save();

  res.json({ success: true, message: 'Loan disbursed', data: loan });
}
