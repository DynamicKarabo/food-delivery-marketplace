import { Router } from 'express';
import { createOrder, getOrderById, getOrders, updateOrderStatus, cancelOrder, createPaymentIntent } from '../controllers/orderController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/orders', createOrder);
router.get('/orders/:id', getOrderById);
router.get('/orders', getOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.post('/orders/:id/cancel', cancelOrder);

router.post('/payments/intent', createPaymentIntent);

// Webhook typically unauthenticated or uses signature validation
// router.post('/webhooks/stripe', express.raw({type: 'application/json'}), handleStripeWebhook);

export default router;
