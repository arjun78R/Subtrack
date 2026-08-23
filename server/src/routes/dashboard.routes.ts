import { Router } from 'express';
import {
  getDashboardSummary,
  getUpcomingRenewals,
  getUnusedSubscriptions,
} from '../controllers/dashboard.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/summary', getDashboardSummary);
router.get('/upcoming-renewals', getUpcomingRenewals);
router.get('/unused', getUnusedSubscriptions);

export default router;
