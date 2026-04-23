import { Router } from 'express';
import { getProfile, updateAvailability, createProfile } from '../controllers/driverController';
import { getAssignedDeliveries, updateLocation, completeDelivery } from '../controllers/deliveryController';
import { authenticate, isDriver } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Allow creating profile before strict DRIVER check
router.post('/profile', createProfile);

// Strictly DRIVER routes
router.use(isDriver);

router.get('/profile', getProfile);
router.put('/availability', updateAvailability);

router.get('/deliveries', getAssignedDeliveries);
router.patch('/deliveries/:id/update-location', updateLocation);
router.patch('/deliveries/:id/complete', completeDelivery);

// Dummy earnings endpoint
router.get('/earnings', (req, res) => res.json({ success: true, data: { today: 45.5, week: 320.0 } }));

export default router;
