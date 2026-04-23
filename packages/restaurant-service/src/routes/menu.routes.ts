import { Router } from 'express';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability } from '../controllers/menu.controller';

const router = Router({ mergeParams: true });

router.get('/:restaurantId/items', getMenuItems);
router.post('/:restaurantId/items', createMenuItem);
router.put('/items/:itemId', updateMenuItem);
router.delete('/items/:itemId', deleteMenuItem);
router.patch('/items/:itemId/toggle-availability', toggleAvailability);

export { router as menuRouter };