import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const items = await prisma.menuItem.findMany({
      where: { restaurantId },
      include: { options: { include: { choices: true } } }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch menu items' });
  }
};

export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const { options, ...itemData } = req.body;

    const item = await prisma.menuItem.create({
      data: {
        ...itemData,
        restaurantId,
        options: {
          create: options?.map((opt: any) => ({
            name: opt.name,
            choices: { create: opt.choices || [] }
          })) || []
        }
      },
      include: { options: { include: { choices: true } } }
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create menu item' });
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const item = await prisma.menuItem.update({
      where: { id: itemId },
      data: req.body
    });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update menu item' });
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    await prisma.menuItem.delete({ where: { id: itemId } });
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete menu item' });
  }
};

export const toggleAvailability = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const item = await prisma.menuItem.findUnique({ where: { id: itemId } });
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });

    const updated = await prisma.menuItem.update({
      where: { id: itemId },
      data: { isAvailable: !item.isAvailable }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to toggle availability' });
  }
};
