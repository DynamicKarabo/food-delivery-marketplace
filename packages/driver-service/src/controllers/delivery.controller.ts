import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDeliveries = async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;
    const { status } = req.query;

    const deliveries = await prisma.delivery.findMany({
      where: {
        driverId,
        ...(status && { status: status as any })
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: deliveries });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch deliveries' });
  }
};

export const acceptDelivery = async (req: Request, res: Response) => {
  try {
    const { deliveryId } = req.params;
    const delivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: { status: 'ACCEPTED' }
    });

    // Also update driver availability
    await prisma.driver.update({
      where: { id: delivery.driverId },
      data: { isAvailable: false }
    });

    res.json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to accept delivery' });
  }
};

export const updateDeliveryStatus = async (req: Request, res: Response) => {
  try {
    const { deliveryId } = req.params;
    const { status, location } = req.body;

    const updateData: any = { status };
    if (location) {
      updateData.currentLat = location.latitude;
      updateData.currentLng = location.longitude;
    }

    const delivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: updateData
    });

    // If delivered, update driver stats and availability
    if (status === 'DELIVERED') {
      await prisma.$transaction([
        prisma.driver.update({
          where: { id: delivery.driverId },
          data: {
            isAvailable: true,
            totalDeliveries: { increment: 1 }
          }
        }),
        prisma.delivery.update({
          where: { id: deliveryId },
          data: { actualTime: Math.round((Date.now() - delivery.createdAt.getTime()) / 60000) }
        })
      ]);
    }

    res.json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update delivery status' });
  }
};
