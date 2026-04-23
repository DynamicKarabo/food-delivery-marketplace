import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import Joi from 'joi';

const addressSchema = Joi.object({
  street: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  country: Joi.string().required(),
  zipCode: Joi.string().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required()
});

export const getAddresses = async (req: Request, res: Response) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: [
        { isDefault: 'desc' },
        { id: 'asc' }
      ]
    });
    res.status(200).json({ success: true, data: addresses });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createAddress = async (req: Request, res: Response) => {
  try {
    const { error, value } = addressSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: error.details[0].message });
    }

    const count = await prisma.address.count({ where: { userId: req.user.id } });
    
    const address = await prisma.address.create({
      data: {
        ...value,
        userId: req.user.id,
        isDefault: count === 0 // Make default if it's the first one
      }
    });

    res.status(201).json({ success: true, data: address });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = addressSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: error.details[0].message });
    }

    // Verify ownership
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    const address = await prisma.address.update({
      where: { id },
      data: value
    });

    res.status(200).json({ success: true, data: address });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    await prisma.address.delete({ where: { id } });

    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const setDefaultAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    // Transaction to unset others and set this
    await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      }),
      prisma.address.update({
        where: { id },
        data: { isDefault: true }
      })
    ]);

    const updated = await prisma.address.findUnique({ where: { id } });
    res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
