import { prisma } from '../lib/prisma';
import { emitEvent } from '../events/kafka';
import { sendNotification } from './notificationService';
import { createClient, GeoReplyWith } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redisClient.connect().catch(console.error);

export class OrderService {
  async createOrder(data: any, customerId: string) {
    const { restaurantId, items, deliveryAddress, deliveryInstructions } = data;

    // Validate restaurant
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) throw new Error('Restaurant not found');

    // Simple calculation
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.price * item.quantity;
    }

    const deliveryFee = restaurant.deliveryFee;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + deliveryFee + tax;

    const order = await prisma.order.create({
      data: {
        customerId,
        restaurantId,
        items,
        deliveryAddress,
        deliveryInstructions,
        subtotal,
        deliveryFee,
        tax,
        total,
        status: 'PENDING'
      }
    });

    await emitEvent('orders', 'order.created', { orderId: order.id });

    // Notify customer
    const user = await prisma.user.findUnique({ where: { id: customerId } });
    if (user) {
      await sendNotification(user.email, 'Order Received', `Your order ${order.id} has been received.`);
    }

    return order;
  }

  async updateStatus(orderId: string, status: any, user: any) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');

    // Only allow updates if owner or driver or admin
    // For simplicity, we assume the controller checked auth

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    await emitEvent('orders', `order.${status.toLowerCase()}`, { orderId: updated.id });

    if (status === 'READY_FOR_PICKUP') {
      await this.assignDriver(updated);
    } else if (status === 'DELIVERED') {
      await prisma.order.update({
        where: { id: orderId },
        data: { actualDeliveryTime: new Date() }
      });
    }

    // Notify customer
    const customer = await prisma.user.findUnique({ where: { id: order.customerId } });
    if (customer) {
      await sendNotification(customer.email, 'Order Status Update', `Your order status is now ${status}.`);
    }

    return updated;
  }

  async assignDriver(order: any) {
    // Attempt to find nearest driver using Redis GEO
    try {
      const restaurant = await prisma.restaurant.findUnique({ where: { id: order.restaurantId } });
      if (!restaurant) return;

      const loc: any = restaurant.address;
      if (loc && loc.longitude && loc.latitude) {
        // geoSearchWith replaced appropriately as we did in driver-service
        const drivers = await redisClient.geoSearchWith('driver_locations',
          { longitude: loc.longitude, latitude: loc.latitude },
          { radius: 10, unit: 'km' },
          [GeoReplyWith.DISTANCE],
          { SORT: 'ASC' }
        );

        if (drivers.length > 0) {
          const nearestDriverIdStr = drivers[0].member as string;
          // Find driver record
          const driver = await prisma.driver.findFirst({ where: { id: nearestDriverIdStr, isAvailable: true } });
          
          if (driver) {
            await prisma.order.update({
              where: { id: order.id },
              data: { driverId: driver.id, status: 'DRIVER_ASSIGNED' }
            });

            await emitEvent('orders', 'driver.assigned', { orderId: order.id, driverId: driver.id });
          }
        }
      }
    } catch (err) {
      console.error('Error assigning driver:', err);
    }
  }
}

export const orderService = new OrderService();
