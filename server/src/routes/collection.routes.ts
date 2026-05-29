import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { getDisbursedLoans, recordPayment, getCompletedLoans } from '../controllers/collection.controller';

const router = Router();

router.use(authenticate, requireRole('COLLECTION', 'ADMIN'));

router.get('/loans', getDisbursedLoans);
router.get('/completed', getCompletedLoans);
router.post('/loans/:id/payment', recordPayment);

export default router;
