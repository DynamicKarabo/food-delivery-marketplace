import { Router } from 'express';
import { getRestaurants, getRestaurantById, createRestaurant, updateRestaurant } from '../controllers/restaurantController';
import { getMenuItems, createMenuItem, updateMenuItem, toggleAvailability } from '../controllers/menuController';
import { getOrders, updateOrderStatus } from '../controllers/orderController';
import { authenticate, isRestaurantOwner } from '../middleware/auth';

const router = Router();

// Publicly accessible for listing restaurants/menus
router.get('/restaurants', getRestaurants);
router.get('/restaurants/:id', getRestaurantById);
router.get('/menu/:restaurantId', getMenuItems);

// Protected Owner Routes
router.use(authenticate);
router.use(isRestaurantOwner);

// Restaurant management
router.post('/restaurants', createRestaurant);
router.put('/restaurants/:id', updateRestaurant);

// Menu management
router.post('/menu/:restaurantId', createMenuItem);
router.put('/menu/:restaurantId/items/:id', updateMenuItem);
router.patch('/menu/:restaurantId/items/:id/availability', toggleAvailability);

// Order management
router.get('/orders', getOrders);
router.patch('/orders/:id/status', updateOrderStatus);

// Analytics proxy could go here, omitting for brevity
router.get('/analytics', (req, res) => res.json({ success: true, data: { revenue: 0, ordersCount: 0 } }));

export default router;
