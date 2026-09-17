import { Router } from 'express';
import {
  getEvaluationData,
  saveEvaluationData,
} from '../controllers/evaluation.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getEvaluationData);
router.post('/', saveEvaluationData);

export default router;
