import { Router } from 'express';
import { getRestaurants, getRestaurant, createRestaurant, updateRestaurant, toggleActive } from '../controllers/restaurant.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getRestaurants);
router.get('/:id', getRestaurant);
router.post('/', authenticate, authorize('RESTAURANT_OWNER', 'ADMIN'), createRestaurant);
router.put('/:id', authenticate, authorize('RESTAURANT_OWNER', 'ADMIN'), updateRestaurant);
router.patch('/:id/toggle-active', authenticate, authorize('RESTAURANT_OWNER', 'ADMIN'), toggleActive);

export { router as restaurantRouter };