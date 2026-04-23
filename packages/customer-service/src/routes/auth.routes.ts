import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refreshToken, logout } from '../controllers/auth.controller';

const router = Router();

// Rate limiter for auth endpoints: 5 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', authLimiter, refreshToken);
router.post('/logout', logout);

export { router as authRouter };
