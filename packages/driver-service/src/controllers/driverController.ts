import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import Joi from 'joi';

const vehicleSchema = Joi.object({
  type: Joi.string().valid('BICYCLE', 'MOTORCYCLE', 'CAR', 'VAN').required(),
  make: Joi.string().optional(),
  model: Joi.string().optional(),
  color: Joi.string().optional(),
  plateNumber: Joi.string().optional()
});

export const getProfile = async (req: Request, res: Response) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { userId: req.user.id },
      include: { user: { select: { firstName: true, lastName: true, phone: true, email: true, avatar: true } } }
    });

    if (!driver) {
      return res.status(404).json({ success: false, error: 'Driver profile not found' });
    }

    res.status(200).json({ success: true, data: driver });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateAvailability = async (req: Request, res: Response) => {
  try {
    const { isAvailable } = req.body;
    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ success: false, error: 'isAvailable must be a boolean' });
    }

    const driver = await prisma.driver.update({
      where: { userId: req.user.id },
      data: { isAvailable }
    });

    res.status(200).json({ success: true, data: driver });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Also an endpoint to create a driver profile if they just signed up
export const createProfile = async (req: Request, res: Response) => {
  try {
    const { error, value } = vehicleSchema.validate(req.body.vehicle);
    if (error) {
      return res.status(400).json({ success: false, error: error.details[0].message });
    }

    const existing = await prisma.driver.findUnique({ where: { userId: req.user.id } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Driver profile already exists' });
    }

    // Must make sure user role is DRIVER
    await prisma.user.update({
      where: { id: req.user.id },
      data: { role: 'DRIVER' }
    });

    const driver = await prisma.driver.create({
      data: {
        userId: req.user.id,
        vehicle: value
      }
    });

    res.status(201).json({ success: true, data: driver });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
