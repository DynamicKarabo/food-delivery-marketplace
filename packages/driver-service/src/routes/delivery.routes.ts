import { Router } from 'express';
import { getDeliveries, acceptDelivery, updateDeliveryStatus } from '../controllers/delivery.controller';

const router = Router();

router.get('/:driverId', getDeliveries);
router.post('/:deliveryId/accept', acceptDelivery);
router.patch('/:deliveryId/status', updateDeliveryStatus);

export { router as deliveryRouter };