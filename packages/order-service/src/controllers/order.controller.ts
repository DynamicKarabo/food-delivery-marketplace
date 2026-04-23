import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customerId, restaurantId, items, deliveryAddress, deliveryInstructions, deliveryFee, tax } = req.body;
    
    const subtotal = items.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
    const total = subtotal + deliveryFee + tax;

    const order = await prisma.order.create({
      data: {
        customerId,
        restaurantId,
        deliveryAddress: JSON.stringify(deliveryAddress),
        deliveryInstructions,
        subtotal,
        deliveryFee,
        tax,
        total,
        items: {
          create: items.map((item: any) => ({
            menuItemId: item.menuItemId,
            menuItemName: item.menuItemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            selectedOptions: item.selectedOptions ? JSON.stringify(item.selectedOptions) : null
          }))
        }
      },
      include: { items: true }
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { customerId, restaurantId, status } = req.query;
    const where: any = {};
    if (customerId) where.customerId = customerId as string;
    if (restaurantId) where.restaurantId = restaurantId as string;
    if (status) where.status = status as string;

    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, driverId } = req.body;

    const updateData: any = { status };
    if (driverId) updateData.driverId = driverId;
    if (status === 'DELIVERED') updateData.actualDeliveryTime = new Date();

    const order = await prisma.order.update({
      where: { id },
      data: updateData
    });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.update({
      where: { id, status: { in: ['PENDING', 'CONFIRMED'] } },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason
      }
    });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to cancel order' });
  }
};
