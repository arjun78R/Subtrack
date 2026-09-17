import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  triggerScan,
} from '../controllers/notification.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.post('/trigger-scan', triggerScan);

export default router;
