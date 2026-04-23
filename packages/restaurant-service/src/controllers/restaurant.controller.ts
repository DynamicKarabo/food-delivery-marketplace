import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getRestaurants = async (req: Request, res: Response) => {
  try {
    const { cuisine, city, search, isActive } = req.query;
    const where: any = {};

    if (cuisine) where.cuisineTypes = { has: cuisine as string };
    if (city) where.city = { contains: city as string, mode: 'insensitive' };
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const restaurants = await prisma.restaurant.findMany({
      where,
      include: { openingHours: true, menuItems: { take: 5 } },
      orderBy: { rating: 'desc' }
    });

    res.json({ success: true, data: restaurants });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch restaurants' });
  }
};

export const getRestaurant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: { openingHours: true, menuItems: { where: { isAvailable: true } } }
    });

    if (!restaurant) return res.status(404).json({ success: false, error: 'Restaurant not found' });
    res.json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch restaurant' });
  }
};

export const createRestaurant = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const restaurant = await prisma.restaurant.create({
      data: {
        ...data,
        openingHours: { create: data.openingHours || [] }
      }
    });
    res.status(201).json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create restaurant' });
  }
};

export const updateRestaurant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: req.body
    });
    res.json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update restaurant' });
  }
};

export const toggleActive = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurant = await prisma.restaurant.findUnique({ where: { id } });
    if (!restaurant) return res.status(404).json({ success: false, error: 'Not found' });

    const updated = await prisma.restaurant.update({
      where: { id },
      data: { isActive: !restaurant.isActive }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to toggle status' });
  }
};
