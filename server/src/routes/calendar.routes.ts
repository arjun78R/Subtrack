import { Router } from 'express';
import { getCalendarEvents } from '../controllers/calendar.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/events', getCalendarEvents);

export default router;
