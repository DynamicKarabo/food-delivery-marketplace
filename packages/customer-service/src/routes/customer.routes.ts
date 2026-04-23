import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getProfile, updateProfile, deleteAccount } from '../controllers/customer.controller';

const router = Router();

router.get('/me', authenticate, getProfile);
router.put('/me', authenticate, updateProfile);
router.delete('/me', authenticate, deleteAccount);

export { router as customerRouter };
