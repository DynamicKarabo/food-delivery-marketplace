import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import axios from 'axios';

// Ideally this URL comes from env
const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3002';

export const getFavorites = async (req: Request, res: Response) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id }
    });

    const restaurantIds = favorites.map((f: any) => f.restaurantId);

    // Fetch from Restaurant Service
    let restaurants = [];
    if (restaurantIds.length > 0) {
      try {
        const response = await axios.get(`${RESTAURANT_SERVICE_URL}/api/restaurants`, {
          params: { ids: restaurantIds.join(',') }
        });
        if (response.data && response.data.success) {
          restaurants = response.data.data;
        }
      } catch (err: any) {
        console.error('Failed to fetch restaurants from Restaurant Service', err.message);
        // Fallback or leave empty
      }
    }

    res.status(200).json({ success: true, data: { favorites: restaurantIds, restaurants } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const addFavorite = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;

    // Check if exists
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_restaurantId: {
          userId: req.user.id,
          restaurantId
        }
      }
    });

    if (!existing) {
      await prisma.favorite.create({
        data: {
          userId: req.user.id,
          restaurantId
        }
      });
    }

    res.status(201).json({ success: true, data: { restaurantId } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;

    await prisma.favorite.deleteMany({
      where: {
        userId: req.user.id,
        restaurantId
      }
    });

    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
