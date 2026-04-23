import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import Joi from 'joi';

const menuItemSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  price: Joi.number().required(),
  category: Joi.string().required(),
  imageUrl: Joi.string().optional(),
  isAvailable: Joi.boolean().optional(),
  preparationTime: Joi.number().optional(),
  options: Joi.array().items(Joi.object()).optional()
});

export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const items = await prisma.menuItem.findMany({
      where: { restaurantId }
    });
    res.status(200).json({ success: true, data: items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const { error, value } = menuItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: error.details[0].message });
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant || restaurant.ownerId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Restaurant not found or unauthorized' });
    }

    const item = await prisma.menuItem.create({
      data: {
        ...value,
        restaurantId
      }
    });

    res.status(201).json({ success: true, data: item });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = menuItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: error.details[0].message });
    }

    const item = await prisma.menuItem.findUnique({ where: { id }, include: { restaurant: true } });
    if (!item || item.restaurant.ownerId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Item not found or unauthorized' });
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: value
    });

    res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const toggleAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const item = await prisma.menuItem.findUnique({ where: { id }, include: { restaurant: true } });
    if (!item || item.restaurant.ownerId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Item not found or unauthorized' });
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: { isAvailable: !item.isAvailable }
    });

    res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
