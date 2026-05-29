import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Loan } from '../models/Loan';

// Returns borrowers who have registered but have no loan application
export async function getLeads(req: AuthRequest, res: Response): Promise<void> {
  const borrowers = await User.find({ role: 'BORROWER' }).select('-password').lean();
  const loansExist = await Loan.find({ borrowerId: { $in: borrowers.map((b) => b._id) } })
    .distinct('borrowerId');

  const loanBorrowerIds = new Set(loansExist.map((id) => id.toString()));
  const leads = borrowers.filter((b) => !loanBorrowerIds.has((b._id as { toString(): string }).toString()));

  res.json({ success: true, data: leads });
}
