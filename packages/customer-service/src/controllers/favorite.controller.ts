import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getFavorites = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: favorites
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch favorites'
    });
  }
};

export const addFavorite = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { restaurantId } = req.params;

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        restaurantId
      }
    }).catch((err) => {
      // Unique constraint violation - already favorited
      if (err.code === 'P2002') {
        return null;
      }
      throw err;
    });

    if (!favorite) {
      return res.status(409).json({
        success: false,
        error: 'Restaurant already in favorites'
      });
    }

    res.status(201).json({
      success: true,
      data: favorite
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add favorite'
    });
  }
};

export const removeFavorite = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { restaurantId } = req.params;

    await prisma.favorite.deleteMany({
      where: { userId, restaurantId }
    });

    res.json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove favorite'
    });
  }
};
