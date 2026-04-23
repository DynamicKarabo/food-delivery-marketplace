import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import Joi from 'joi';

const restaurantSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  address: Joi.object().required(),
  contact: Joi.object().required(),
  cuisineTypes: Joi.array().items(Joi.string()).optional(),
  openingHours: Joi.array().items(Joi.object()).optional(),
  deliveryFee: Joi.number().optional(),
  minOrderAmount: Joi.number().optional(),
  estimatedDeliveryTime: Joi.number().optional()
});

export const getRestaurants = async (req: Request, res: Response) => {
  try {
    const { ids } = req.query;
    let whereClause = {};
    if (ids && typeof ids === 'string') {
      whereClause = { id: { in: ids.split(',') } };
    }

    const restaurants = await prisma.restaurant.findMany({
      where: whereClause
    });
    res.status(200).json({ success: true, data: restaurants });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getRestaurantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: { menuItems: true }
    });

    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    res.status(200).json({ success: true, data: restaurant });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createRestaurant = async (req: Request, res: Response) => {
  try {
    const { error, value } = restaurantSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: error.details[0].message });
    }

    // Ensure user doesn't already have a restaurant
    const existing = await prisma.restaurant.findUnique({ where: { ownerId: req.user.id } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'User already owns a restaurant' });
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        ...value,
        ownerId: req.user.id
      }
    });

    res.status(201).json({ success: true, data: restaurant });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateRestaurant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = restaurantSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: error.details[0].message });
    }

    const existing = await prisma.restaurant.findUnique({ where: { id } });
    if (!existing || existing.ownerId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Restaurant not found or unauthorized' });
    }

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: value
    });

    res.status(200).json({ success: true, data: restaurant });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
