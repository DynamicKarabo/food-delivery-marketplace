import { Router } from 'express';
import { createOrder, getOrders, getOrder, updateStatus, cancelOrder } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, authorize('CUSTOMER', 'ADMIN'), createOrder);
router.get('/', authenticate, authorize('ADMIN'), getOrders);
router.get('/:id', authenticate, authorize('CUSTOMER', 'DRIVER', 'RESTAURANT_OWNER', 'ADMIN'), getOrder);
router.patch('/:id/status', authenticate, authorize('DRIVER', 'RESTAURANT_OWNER', 'ADMIN'), updateStatus);
router.post('/:id/cancel', authenticate, authorize('CUSTOMER', 'ADMIN'), cancelOrder);

export { router as orderRouter };
