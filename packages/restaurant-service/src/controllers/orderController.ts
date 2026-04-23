import { Request, Response } from 'express';
import axios from 'axios';
import { prisma } from '../lib/prisma';

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3004';

export const getOrders = async (req: Request, res: Response) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({ where: { ownerId: req.user.id } });
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    const response = await axios.get(`${ORDER_SERVICE_URL}/api/orders`, {
      params: { restaurantId: restaurant.id },
      headers: { Authorization: req.headers.authorization }
    });

    res.status(200).json(response.data);
  } catch (err: any) {
    res.status(err.response?.status || 500).json({ success: false, error: 'Failed to fetch orders' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const restaurant = await prisma.restaurant.findUnique({ where: { ownerId: req.user.id } });
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    // Verify order belongs to this restaurant
    const getResponse = await axios.get(`${ORDER_SERVICE_URL}/api/orders/${id}`, {
      headers: { Authorization: req.headers.authorization }
    });

    if (getResponse.data?.data?.restaurantId !== restaurant.id) {
       return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const response = await axios.patch(`${ORDER_SERVICE_URL}/api/orders/${id}/status`, { status }, {
      headers: { Authorization: req.headers.authorization }
    });

    res.status(200).json(response.data);
  } catch (err: any) {
    res.status(err.response?.status || 500).json({ success: false, error: 'Failed to update order status' });
  }
};
