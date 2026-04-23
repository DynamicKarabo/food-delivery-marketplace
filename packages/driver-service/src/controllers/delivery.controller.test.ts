import express from 'express';
import request from 'supertest';
import { getDeliveries, acceptDelivery, updateDeliveryStatus } from './delivery.controller';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    delivery: {
      findMany: jest.fn(),
      update: jest.fn()
    },
    driver: {
      update: jest.fn()
    },
    $transaction: jest.fn()
  };
  return {
    PrismaClient: jest.fn(() => mPrismaClient)
  };
});

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient() as jest.Mocked<any>;

const app = express();
app.use(express.json());

// Routes to trigger controller functions
app.get('/deliveries/:driverId', getDeliveries);
app.patch('/deliveries/:deliveryId/accept', acceptDelivery);
app.patch('/deliveries/:deliveryId/status', updateDeliveryStatus);

describe('Delivery Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /deliveries/:driverId (getDeliveries)', () => {
    it('should return a list of deliveries for a driver (happy path)', async () => {
      const mockDeliveries = [{ id: '1', driverId: 'driver1', status: 'PENDING' }];
      prisma.delivery.findMany.mockResolvedValue(mockDeliveries);

      const res = await request(app).get('/deliveries/driver1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: mockDeliveries });
      expect(prisma.delivery.findMany).toHaveBeenCalledWith({
        where: { driverId: 'driver1' },
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should handle status query parameter', async () => {
      const mockDeliveries = [{ id: '1', driverId: 'driver1', status: 'COMPLETED' }];
      prisma.delivery.findMany.mockResolvedValue(mockDeliveries);

      const res = await request(app).get('/deliveries/driver1?status=COMPLETED');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: mockDeliveries });
      expect(prisma.delivery.findMany).toHaveBeenCalledWith({
        where: { driverId: 'driver1', status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should return 500 on database error', async () => {
      prisma.delivery.findMany.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).get('/deliveries/driver1');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ success: false, error: 'Failed to fetch deliveries' });
    });
  });

  describe('PATCH /deliveries/:deliveryId/accept (acceptDelivery)', () => {
    it('should accept a delivery and update driver availability (happy path)', async () => {
      const mockDelivery = { id: 'delivery1', driverId: 'driver1', status: 'ACCEPTED' };
      prisma.delivery.update.mockResolvedValue(mockDelivery);
      prisma.driver.update.mockResolvedValue({ id: 'driver1', isAvailable: false });

      const res = await request(app).patch('/deliveries/delivery1/accept');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: mockDelivery });
      expect(prisma.delivery.update).toHaveBeenCalledWith({
        where: { id: 'delivery1' },
        data: { status: 'ACCEPTED' }
      });
      expect(prisma.driver.update).toHaveBeenCalledWith({
        where: { id: 'driver1' },
        data: { isAvailable: false }
      });
    });

    it('should return 500 on database error', async () => {
      prisma.delivery.update.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).patch('/deliveries/delivery1/accept');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ success: false, error: 'Failed to accept delivery' });
    });
  });

  describe('PATCH /deliveries/:deliveryId/status (updateDeliveryStatus)', () => {
    it('should update delivery status without location (happy path)', async () => {
      const mockDelivery = { id: 'delivery1', driverId: 'driver1', status: 'IN_TRANSIT' };
      prisma.delivery.update.mockResolvedValue(mockDelivery);

      const res = await request(app).patch('/deliveries/delivery1/status').send({ status: 'IN_TRANSIT' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: mockDelivery });
      expect(prisma.delivery.update).toHaveBeenCalledWith({
        where: { id: 'delivery1' },
        data: { status: 'IN_TRANSIT' }
      });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should update delivery status with location', async () => {
      const mockDelivery = { id: 'delivery1', driverId: 'driver1', status: 'IN_TRANSIT', currentLat: 10, currentLng: 20 };
      prisma.delivery.update.mockResolvedValue(mockDelivery);

      const res = await request(app).patch('/deliveries/delivery1/status').send({
        status: 'IN_TRANSIT',
        location: { latitude: 10, longitude: 20 }
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: mockDelivery });
      expect(prisma.delivery.update).toHaveBeenCalledWith({
        where: { id: 'delivery1' },
        data: { status: 'IN_TRANSIT', currentLat: 10, currentLng: 20 }
      });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should run transaction when status is DELIVERED', async () => {
      const mockDelivery = { id: 'delivery1', driverId: 'driver1', status: 'DELIVERED', createdAt: new Date('2023-01-01T00:00:00Z') };
      prisma.delivery.update.mockResolvedValue(mockDelivery);
      
      jest.useFakeTimers().setSystemTime(new Date('2023-01-01T00:30:00Z')); // 30 mins later
      
      prisma.$transaction.mockResolvedValue([]);

      const res = await request(app).patch('/deliveries/delivery1/status').send({ status: 'DELIVERED' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: { ...mockDelivery, createdAt: mockDelivery.createdAt.toISOString() } });
      
      // Check the initial update
      expect(prisma.delivery.update).toHaveBeenCalledWith({
        where: { id: 'delivery1' },
        data: { status: 'DELIVERED' }
      });

      // Check that transaction was called
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      
      jest.useRealTimers();
    });

    it('should return 500 on database error', async () => {
      prisma.delivery.update.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).patch('/deliveries/delivery1/status').send({ status: 'IN_TRANSIT' });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ success: false, error: 'Failed to update delivery status' });
    });
  });
});
