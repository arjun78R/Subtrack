import { Router } from 'express';
import {
  getCategorySpending,
  getMonthlyBreakdown,
  getSpendingTrend,
  getCostDistribution,
} from '../controllers/analytics.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/category', getCategorySpending);
router.get('/monthly', getMonthlyBreakdown);
router.get('/trend', getSpendingTrend);
router.get('/distribution', getCostDistribution);

export default router;
