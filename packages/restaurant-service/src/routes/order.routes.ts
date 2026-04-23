import { Router } from 'express';
import { getRestaurantOrders, updateOrderStatus } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/:restaurantId', authenticate, authorize('RESTAURANT_OWNER', 'ADMIN'), getRestaurantOrders);
router.patch('/:orderId/status', authenticate, authorize('RESTAURANT_OWNER', 'ADMIN', 'DRIVER'), updateOrderStatus);

export { router as orderRouter };