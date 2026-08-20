import { Router } from 'express';
import {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  markAsUsed,
} from '../controllers/subscription.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
} from '../validators/subscription.validator';

const router = Router();

// Protect all subscription routes
router.use(authenticateToken);

router.get('/', getSubscriptions);
router.get('/:id', getSubscriptionById);
router.post('/', validateRequest(createSubscriptionSchema), createSubscription);
router.put('/:id', validateRequest(updateSubscriptionSchema), updateSubscription);
router.delete('/:id', deleteSubscription);
router.patch('/:id/mark-used', markAsUsed);

export default router;
