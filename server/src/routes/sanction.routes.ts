import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { getPendingLoans, approveLoan, rejectLoan } from '../controllers/sanction.controller';

const router = Router();

router.use(authenticate, requireRole('SANCTION', 'ADMIN'));

router.get('/loans', getPendingLoans);
router.put('/loans/:id/approve', approveLoan);
router.put('/loans/:id/reject', rejectLoan);

export default router;
