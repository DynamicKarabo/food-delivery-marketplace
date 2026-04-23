import { Router } from 'express';
import { getDeliveries, acceptDelivery, updateDeliveryStatus } from '../controllers/delivery.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/:driverId', authenticate, authorize('DRIVER', 'ADMIN'), getDeliveries);
router.post('/:deliveryId/accept', authenticate, authorize('DRIVER', 'ADMIN'), acceptDelivery);
router.patch('/:deliveryId/status', authenticate, authorize('DRIVER', 'ADMIN'), updateDeliveryStatus);

export { router as deliveryRouter };