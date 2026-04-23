import { Router } from 'express';
import { createPaymentIntent, confirmPayment, refundPayment } from '../controllers/payment.controller';

const router = Router();

router.post('/intent', createPaymentIntent);
router.post('/confirm', confirmPayment);
router.post('/refund', refundPayment);

export { router as paymentRouter };
