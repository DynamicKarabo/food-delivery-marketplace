import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { orderService } from '../services/orderService';
import { createPaymentIntent as stripeCreateIntent } from '../services/paymentService';
import Joi from 'joi';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const order = await orderService.createOrder(req.body, req.user.id);
    res.status(201).json({ success: true, data: order });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { customerId, restaurantId, driverId } = req.query;
    
    let whereClause: any = {};
    if (customerId) whereClause.customerId = customerId;
    if (restaurantId) whereClause.restaurantId = restaurantId;
    if (driverId) whereClause.driverId = driverId;

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: orders });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'DRIVER_ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const updated = await orderService.updateStatus(id, status, req.user);
    res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    
    // Only cancel if pending or accepted ideally, simplified here
    const updated = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED', cancellationReason: reason }
    });

    res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    const intent = await stripeCreateIntent(order.total, order.id);
    
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentIntentId: intent.id }
    });

    res.status(200).json({ success: true, data: { clientSecret: intent.client_secret } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
