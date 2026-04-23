import { Router } from 'express';
import { createOrder, getOrders, getOrder, updateStatus, cancelOrder } from '../controllers/order.controller';

const router = Router();

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrder);
router.patch('/:id/status', updateStatus);
router.post('/:id/cancel', cancelOrder);

export { router as orderRouter };
