import express from 'express';
import request from 'supertest';
import { getDrivers, getDriver, registerDriver, updateAvailability, updateLocation, getDriverStats } from './driver.controller';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    driver: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    delivery: {
      aggregate: jest.fn()
    }
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
app.get('/drivers', getDrivers);
app.get('/drivers/:id', getDriver);
app.post('/drivers', registerDriver);
app.patch('/drivers/:id/availability', updateAvailability);
app.patch('/drivers/:id/location', updateLocation);
app.get('/drivers/:id/stats', getDriverStats);

describe('Driver Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /drivers (getDrivers)', () => {
    it('should return a list of drivers (happy path)', async () => {
      const mockDrivers = [{ id: '1', name: 'John Doe' }];
      prisma.driver.findMany.mockResolvedValue(mockDrivers);

      const res = await request(app).get('/drivers');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: mockDrivers });
      expect(prisma.driver.findMany).toHaveBeenCalledWith({ where: {}, orderBy: { createdAt: 'desc' } });
    });

    it('should handle filters and return drivers', async () => {
      const mockDrivers = [{ id: '1', name: 'John Doe' }];
      prisma.driver.findMany.mockResolvedValue(mockDrivers);

      const res = await request(app).get('/drivers?isAvailable=true&isVerified=false');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: mockDrivers });
      expect(prisma.driver.findMany).toHaveBeenCalledWith({
        where: { isAvailable: true, isVerified: false },
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should return 500 on database error', async () => {
      prisma.driver.findMany.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).get('/drivers');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ success: false, error: 'Failed to fetch drivers' });
    });
  });

  describe('GET /drivers/:id (getDriver)', () => {
    it('should return a driver if found (happy path)', async () => {
      const mockDriver = { id: '1', name: 'John Doe' };
      prisma.driver.findUnique.mockResolvedValue(mockDriver);

      const res = await request(app).get('/drivers/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: mockDriver });
      expect(prisma.driver.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { deliveries: { take: 10, orderBy: { createdAt: 'desc' } } }
      });
    });

    it('should return 404 if driver not found', async () => {
      prisma.driver.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/drivers/999');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ success: false, error: 'Driver not found' });
    });

    it('should return 500 on database error', async () => {
      prisma.driver.findUnique.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).get('/drivers/1');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ success: false, error: 'Failed to fetch driver' });
    });
  });

  describe('POST /drivers (registerDriver)', () => {
    it('should register a new driver (happy path)', async () => {
      const mockDriver = { id: '1', name: 'Jane Doe' };
      const reqBody = { name: 'Jane Doe' };
      prisma.driver.create.mockResolvedValue(mockDriver);

      const res = await request(app).post('/drivers').send(reqBody);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ success: true, data: mockDriver });
      expect(prisma.driver.create).toHaveBeenCalledWith({ data: reqBody });
    });

    it('should return 500 on database error', async () => {
      prisma.driver.create.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).post('/drivers').send({ name: 'Jane Doe' });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ success: false, error: 'Failed to register driver' });
    });
  });

  describe('PATCH /drivers/:id/availability (updateAvailability)', () => {
    it('should update availability (happy path)', async () => {
      const mockDriver = { id: '1', isAvailable: true };
      const reqBody = { isAvailable: true };
      prisma.driver.update.mockResolvedValue(mockDriver);

      const res = await request(app).patch('/drivers/1/availability').send(reqBody);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: mockDriver });
      expect(prisma.driver.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isAvailable: true }
      });
    });

    it('should return 500 on database error', async () => {
      prisma.driver.update.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).patch('/drivers/1/availability').send({ isAvailable: true });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ success: false, error: 'Failed to update availability' });
    });
  });

  describe('PATCH /drivers/:id/location (updateLocation)', () => {
    it('should update location (happy path)', async () => {
      const mockDriver = { id: '1', currentLat: 10, currentLng: 20 };
      const reqBody = { latitude: 10, longitude: 20 };
      prisma.driver.update.mockResolvedValue(mockDriver);

      // We need to use fake timers because updateLocation calls new Date()
      jest.useFakeTimers().setSystemTime(new Date('2023-01-01T00:00:00Z'));

      const res = await request(app).patch('/drivers/1/location').send(reqBody);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: mockDriver });
      expect(prisma.driver.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { currentLat: 10, currentLng: 20, lastLocationAt: new Date('2023-01-01T00:00:00Z') }
      });
      
      jest.useRealTimers();
    });

    it('should return 500 on database error', async () => {
      prisma.driver.update.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).patch('/drivers/1/location').send({ latitude: 10, longitude: 20 });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ success: false, error: 'Failed to update location' });
    });
  });

  describe('GET /drivers/:id/stats (getDriverStats)', () => {
    it('should return driver stats (happy path)', async () => {
      const mockStats = { _count: 10, _sum: { earnings: 500 }, _avg: { actualTime: 30 } };
      prisma.delivery.aggregate.mockResolvedValue(mockStats);

      const res = await request(app).get('/drivers/1/stats');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: { totalDeliveries: 10, totalEarnings: 500, averageDeliveryTime: 30 }
      });
      expect(prisma.delivery.aggregate).toHaveBeenCalledWith({
        where: { driverId: '1', status: 'DELIVERED' },
        _count: true,
        _sum: { earnings: true },
        _avg: { actualTime: true }
      });
    });

    it('should handle missing aggregates properly', async () => {
      const mockStats = { _count: 0, _sum: { earnings: null }, _avg: { actualTime: null } };
      prisma.delivery.aggregate.mockResolvedValue(mockStats);

      const res = await request(app).get('/drivers/1/stats');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: { totalDeliveries: 0, totalEarnings: 0, averageDeliveryTime: 0 }
      });
    });

    it('should return 500 on database error', async () => {
      prisma.delivery.aggregate.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).get('/drivers/1/stats');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ success: false, error: 'Failed to fetch stats' });
    });
  });
});
