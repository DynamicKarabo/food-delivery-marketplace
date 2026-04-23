import { Router } from 'express';
import { getDrivers, getDriver, updateAvailability, updateLocation, registerDriver, getDriverStats } from '../controllers/driver.controller';

const router = Router();

router.get('/', getDrivers);
router.post('/', registerDriver);
router.get('/:id', getDriver);
router.get('/:id/stats', getDriverStats);
router.patch('/:id/availability', updateAvailability);
router.patch('/:id/location', updateLocation);

export { router as driverRouter };