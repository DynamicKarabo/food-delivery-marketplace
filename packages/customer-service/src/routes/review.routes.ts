import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getReviews, createReview, updateReview, deleteReview } from '../controllers/review.controller';

const router = Router();

router.get('/', authenticate, getReviews);
router.post('/', authenticate, createReview);
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

export { router as reviewRouter };
