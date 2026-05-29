import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { getSanctionedLoans, disburse } from '../controllers/disbursement.controller';

const router = Router();

router.use(authenticate, requireRole('DISBURSEMENT', 'ADMIN'));

router.get('/loans', getSanctionedLoans);
router.put('/loans/:id/disburse', disburse);

export default router;
