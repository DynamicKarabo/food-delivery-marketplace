import { Request, Response } from 'express';
import axios from 'axios';
import { prisma } from '../lib/prisma';
import { updateLocation as updateRedisLocation } from '../services/locationTracking';

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3004';

export const getAssignedDeliveries = async (req: Request, res: Response) => {
  try {
    const driver = await prisma.driver.findUnique({ where: { userId: req.user.id } });
    if (!driver) {
      return res.status(404).json({ success: false, error: 'Driver not found' });
    }

    const response = await axios.get(`${ORDER_SERVICE_URL}/api/orders`, {
      params: { driverId: driver.id },
      headers: { Authorization: req.headers.authorization }
    });

    res.status(200).json(response.data);
  } catch (err: any) {
    res.status(err.response?.status || 500).json({ success: false, error: 'Failed to fetch deliveries' });
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Delivery/Order ID
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, error: 'Latitude and longitude are required' });
    }

    const driver = await prisma.driver.findUnique({ where: { userId: req.user.id } });
    if (!driver) {
      return res.status(404).json({ success: false, error: 'Driver not found' });
    }

    // Update in DB (optional, Redis is better for real-time)
    await prisma.driver.update({
      where: { id: driver.id },
      data: { currentLocation: { latitude, longitude } }
    });

    // Update in Redis
    await updateRedisLocation(driver.id, latitude, longitude);

    res.status(200).json({ success: true, message: 'Location updated' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const completeDelivery = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Order ID
    
    const driver = await prisma.driver.findUnique({ where: { userId: req.user.id } });
    if (!driver) {
      return res.status(404).json({ success: false, error: 'Driver not found' });
    }

    const response = await axios.patch(`${ORDER_SERVICE_URL}/api/orders/${id}/status`, { status: 'DELIVERED' }, {
      headers: { Authorization: req.headers.authorization }
    });

    // Increment driver total deliveries
    if (response.data.success) {
      await prisma.driver.update({
        where: { id: driver.id },
        data: { totalDeliveries: { increment: 1 } }
      });
    }

    res.status(200).json(response.data);
  } catch (err: any) {
    res.status(err.response?.status || 500).json({ success: false, error: 'Failed to complete delivery' });
  }
};
