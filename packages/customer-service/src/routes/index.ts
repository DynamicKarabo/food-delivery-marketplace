import { Router } from 'express';
import { register, login, refresh, logout } from '../controllers/authController';
import { getMe, updateMe, deleteMe } from '../controllers/customerController';
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '../controllers/addressController';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favoriteController';
import { getOrders, getOrderById, cancelOrder } from '../controllers/orderController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Auth Routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/refresh', refresh);
router.post('/auth/logout', logout);

// Customer Routes
router.use('/customers', authenticate);
router.get('/customers/me', getMe);
router.put('/customers/me', updateMe);
router.delete('/customers/me', deleteMe);

// Address Routes
router.use('/addresses', authenticate);
router.get('/addresses', getAddresses);
router.post('/addresses', createAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);
router.put('/addresses/:id/default', setDefaultAddress);

// Favorite Routes
router.use('/favorites', authenticate);
router.get('/favorites/restaurants', getFavorites);
router.post('/favorites/restaurants/:restaurantId', addFavorite);
router.delete('/favorites/restaurants/:restaurantId', removeFavorite);

// Order Proxy Routes
router.use('/orders', authenticate);
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);
router.post('/orders/:id/cancel', cancelOrder);

export default router;
