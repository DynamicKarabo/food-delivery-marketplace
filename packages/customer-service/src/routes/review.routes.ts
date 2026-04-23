import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getReviews, createReview } from '../controllers/review.controller';

const router = Router();

router.get('/', authenticate, getReviews);
router.post('/', authenticate, createReview);

export { router as reviewRouter };
