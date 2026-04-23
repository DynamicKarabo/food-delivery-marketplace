import { Router } from 'express';
import { getRestaurants, getRestaurant, createRestaurant, updateRestaurant, toggleActive } from '../controllers/restaurant.controller';

const router = Router();

router.get('/', getRestaurants);
router.get('/:id', getRestaurant);
router.post('/', createRestaurant);
router.put('/:id', updateRestaurant);
router.patch('/:id/toggle-active', toggleActive);

export { router as restaurantRouter };