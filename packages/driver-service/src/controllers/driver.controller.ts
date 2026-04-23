import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDrivers = async (req: Request, res: Response) => {
  try {
    const { isAvailable, isVerified } = req.query;
    const where: any = {};
    if (isAvailable !== undefined) where.isAvailable = isAvailable === 'true';
    if (isVerified !== undefined) where.isVerified = isVerified === 'true';

    const drivers = await prisma.driver.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: drivers });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch drivers' });
  }
};

export const getDriver = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: { deliveries: { take: 10, orderBy: { createdAt: 'desc' } } }
    });

    if (!driver) return res.status(404).json({ success: false, error: 'Driver not found' });
    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch driver' });
  }
};

export const registerDriver = async (req: Request, res: Response) => {
  try {
    const driver = await prisma.driver.create({ data: req.body });
    res.status(201).json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to register driver' });
  }
};

export const updateAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;
    const driver = await prisma.driver.update({
      where: { id },
      data: { isAvailable }
    });
    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update availability' });
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;
    const driver = await prisma.driver.update({
      where: { id },
      data: { currentLat: latitude, currentLng: longitude, lastLocationAt: new Date() }
    });
    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update location' });
  }
};

export const getDriverStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stats = await prisma.delivery.aggregate({
      where: { driverId: id, status: 'DELIVERED' },
      _count: true,
      _sum: { earnings: true },
      _avg: { actualTime: true }
    });

    res.json({
      success: true,
      data: {
        totalDeliveries: stats._count,
        totalEarnings: stats._sum.earnings || 0,
        averageDeliveryTime: stats._avg.actualTime || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};
