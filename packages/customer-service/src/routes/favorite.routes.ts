import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favorite.controller';

const router = Router();

router.get('/restaurants', authenticate, getFavorites);
router.post('/restaurants/:restaurantId', authenticate, addFavorite);
router.delete('/restaurants/:restaurantId', authenticate, removeFavorite);

export { router as favoriteRouter };
