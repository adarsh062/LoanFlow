import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { upload } from '../middleware/upload';
import {
  getProfile,
  saveProfile,
  runBRECheck,
  uploadSalarySlip,
  applyLoan,
  getMyLoan,
} from '../controllers/borrower.controller';

const router = Router();

router.use(authenticate, requireRole('BORROWER'));

router.get('/profile', getProfile);
router.post('/profile', saveProfile);
router.post('/bre', runBRECheck);
router.post('/upload', upload.single('salarySlip'), uploadSalarySlip);
router.post('/apply', applyLoan);
router.get('/loan', getMyLoan);

export default router;
