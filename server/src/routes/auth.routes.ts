import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateProfile,
} from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../validators/auth.validator';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 auth requests per windowMs
  message: { message: 'Too many authentication attempts from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.get('/me', authenticateToken, getMe);
router.post('/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validateRequest(resetPasswordSchema), resetPassword);
router.put('/profile', authenticateToken, validateRequest(updateProfileSchema), updateProfile);

export default router;
