import { Router } from 'express';
import { getDrivers, getDriver, updateAvailability, updateLocation, registerDriver, getDriverStats } from '../controllers/driver.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getDrivers);
router.post('/', authenticate, authorize('ADMIN'), registerDriver);
router.get('/:id', getDriver);
router.get('/:id/stats', authenticate, authorize('DRIVER', 'ADMIN'), getDriverStats);
router.patch('/:id/availability', authenticate, authorize('DRIVER', 'ADMIN'), updateAvailability);
router.patch('/:id/location', authenticate, authorize('DRIVER', 'ADMIN'), updateLocation);

export { router as driverRouter };