import { Router } from 'express';
import { getRestaurantOrders, updateOrderStatus } from '../controllers/order.controller';

const router = Router();

router.get('/:restaurantId', getRestaurantOrders);
router.patch('/:orderId/status', updateOrderStatus);

export { router as orderRouter };