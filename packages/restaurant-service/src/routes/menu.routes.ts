import { Router } from 'express';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability } from '../controllers/menu.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });

router.get('/:restaurantId/items', getMenuItems);
router.post('/:restaurantId/items', authenticate, authorize('RESTAURANT_OWNER', 'ADMIN'), createMenuItem);
router.put('/items/:itemId', authenticate, authorize('RESTAURANT_OWNER', 'ADMIN'), updateMenuItem);
router.delete('/items/:itemId', authenticate, authorize('RESTAURANT_OWNER', 'ADMIN'), deleteMenuItem);
router.patch('/items/:itemId/toggle-availability', authenticate, authorize('RESTAURANT_OWNER', 'ADMIN'), toggleAvailability);

export { router as menuRouter };