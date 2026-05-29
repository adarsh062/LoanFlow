import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { getLeads } from '../controllers/sales.controller';

const router = Router();

router.use(authenticate, requireRole('SALES', 'ADMIN'));

router.get('/leads', getLeads);

export default router;
