import { Router } from 'express';
import { createPaymentIntent, confirmPayment, refundPayment } from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/intent', authenticate, authorize('CUSTOMER', 'ADMIN'), createPaymentIntent);
router.post('/confirm', authenticate, authorize('CUSTOMER', 'ADMIN'), confirmPayment);
router.post('/refund', authenticate, authorize('ADMIN'), refundPayment);

export { router as paymentRouter };
