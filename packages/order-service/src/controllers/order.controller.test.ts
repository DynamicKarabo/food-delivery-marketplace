import request from 'supertest';
import express, { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import { createOrder, getOrders, getOrder, updateStatus, cancelOrder } from './order.controller';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prisma = new PrismaClient() as jest.Mocked<PrismaClient>;

const app: Express = express();
app.use(express.json());

// Routes for testing
app.post('/orders', createOrder);
app.get('/orders', getOrders);
app.get('/orders/:id', getOrder);
app.patch('/orders/:id/status', updateStatus);
app.patch('/orders/:id/cancel', cancelOrder);

describe('Order Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /orders', () => {
    const validPayload = {
      customerId: 'cust-1',
      restaurantId: 'rest-1',
      items: [
        { menuItemId: 'item-1', menuItemName: 'Burger', quantity: 2, unitPrice: 10, totalPrice: 20 },
      ],
      deliveryAddress: { street: '123 Test St', city: 'Test City' },
      deliveryInstructions: 'Leave at door',
      deliveryFee: 5,
      tax: 2,
    };

    it('should create an order successfully', async () => {
      const mockCreatedOrder = { id: 'order-1', ...validPayload, subtotal: 20, total: 27 };
      (prisma.order.create as jest.Mock).mockResolvedValue(mockCreatedOrder);

      const response = await request(app).post('/orders').send(validPayload);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ success: true, data: mockCreatedOrder });
      expect(prisma.order.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          customerId: 'cust-1',
          restaurantId: 'rest-1',
          subtotal: 20,
          total: 27,
        }),
        include: { items: true },
      });
    });

    it('should return 500 when creating an order fails', async () => {
      (prisma.order.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).post('/orders').send(validPayload);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ success: false, error: 'Failed to create order' });
    });
  });

  describe('GET /orders', () => {
    it('should fetch orders successfully', async () => {
      const mockOrders = [{ id: 'order-1' }, { id: 'order-2' }];
      (prisma.order.findMany as jest.Mock).mockResolvedValue(mockOrders);

      const response = await request(app).get('/orders?customerId=cust-1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: mockOrders });
      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: { customerId: 'cust-1' },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return 500 when fetching orders fails', async () => {
      (prisma.order.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/orders');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ success: false, error: 'Failed to fetch orders' });
    });
  });

  describe('GET /orders/:id', () => {
    it('should fetch a single order successfully', async () => {
      const mockOrder = { id: 'order-1' };
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      const response = await request(app).get('/orders/order-1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: mockOrder });
      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        include: { items: true },
      });
    });

    it('should return 404 if order not found', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/orders/non-existent');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ success: false, error: 'Order not found' });
    });

    it('should return 500 when fetching order fails', async () => {
      (prisma.order.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/orders/order-1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ success: false, error: 'Failed to fetch order' });
    });
  });

  describe('PATCH /orders/:id/status', () => {
    it('should update order status successfully', async () => {
      const mockUpdatedOrder = { id: 'order-1', status: 'PREPARING' };
      (prisma.order.update as jest.Mock).mockResolvedValue(mockUpdatedOrder);

      const response = await request(app)
        .patch('/orders/order-1/status')
        .send({ status: 'PREPARING', driverId: 'driver-1' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: mockUpdatedOrder });
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: expect.objectContaining({ status: 'PREPARING', driverId: 'driver-1' }),
      });
    });

    it('should record actualDeliveryTime when status is DELIVERED', async () => {
      const mockUpdatedOrder = { id: 'order-1', status: 'DELIVERED' };
      (prisma.order.update as jest.Mock).mockResolvedValue(mockUpdatedOrder);

      const response = await request(app)
        .patch('/orders/order-1/status')
        .send({ status: 'DELIVERED' });

      expect(response.status).toBe(200);
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: expect.objectContaining({
          status: 'DELIVERED',
          actualDeliveryTime: expect.any(Date),
        }),
      });
    });

    it('should return 500 when updating status fails', async () => {
      (prisma.order.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .patch('/orders/order-1/status')
        .send({ status: 'PREPARING' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ success: false, error: 'Failed to update order status' });
    });
  });

  describe('PATCH /orders/:id/cancel', () => {
    it('should cancel order successfully', async () => {
      const mockCancelledOrder = { id: 'order-1', status: 'CANCELLED' };
      (prisma.order.update as jest.Mock).mockResolvedValue(mockCancelledOrder);

      const response = await request(app)
        .patch('/orders/order-1/cancel')
        .send({ reason: 'Changed mind' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: mockCancelledOrder });
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1', status: { in: ['PENDING', 'CONFIRMED'] } },
        data: { status: 'CANCELLED', cancellationReason: 'Changed mind' },
      });
    });

    it('should return 500 when cancelling order fails', async () => {
      (prisma.order.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .patch('/orders/order-1/cancel')
        .send({ reason: 'Changed mind' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ success: false, error: 'Failed to cancel order' });
    });
  });
});
