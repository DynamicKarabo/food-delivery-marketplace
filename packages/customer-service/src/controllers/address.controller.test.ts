import request from 'supertest';
import { app } from '../index';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    user: {
      findUnique: jest.fn(),
    },
    address: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
      update: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('Address Controller', () => {
  let authToken: string;

  beforeAll(() => {
    authToken = jwt.sign(
      { userId: 'user-id', email: 'test@test.com', role: 'CUSTOMER' },
      process.env.JWT_SECRET || 'fallback-secret'
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: 'test@test.com',
        isActive: true,
        role: 'CUSTOMER'
    });
  });

  describe('GET /api/addresses', () => {
    it('should return addresses successfully', async () => {
      const mockAddresses = [{ id: '1', street: '123 Main St', isDefault: true }];
      (prisma.address.findMany as jest.Mock).mockResolvedValue(mockAddresses);

      const response = await request(app)
        .get('/api/addresses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockAddresses);
    });

    it('should return 500 on database error', async () => {
      (prisma.address.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .get('/api/addresses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to fetch addresses');
    });
  });

  describe('POST /api/addresses', () => {
    it('should create a new address successfully', async () => {
      (prisma.address.count as jest.Mock).mockResolvedValue(0);
      const mockAddress = { id: '1', street: '123 Main St', isDefault: true };
      (prisma.address.create as jest.Mock).mockResolvedValue(mockAddress);

      const response = await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ street: '123 Main St', city: 'Anytown', zipCode: '12345' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockAddress);
    });

    it('should return 500 on database error', async () => {
      (prisma.address.count as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ street: '123 Main St' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to create address');
    });
  });

  describe('PUT /api/addresses/:id', () => {
    it('should return 404 if address not found or not owned by user', async () => {
      (prisma.address.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

      const response = await request(app)
        .put('/api/addresses/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ street: '456 New St' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Address not found');
    });

    it('should update address successfully', async () => {
      (prisma.address.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      const mockAddress = { id: '1', street: '456 New St' };
      (prisma.address.findUnique as jest.Mock).mockResolvedValue(mockAddress);

      const response = await request(app)
        .put('/api/addresses/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ street: '456 New St' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockAddress);
    });

    it('should return 500 on database error', async () => {
      (prisma.address.updateMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .put('/api/addresses/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ street: '456 New St' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to update address');
    });
  });

  describe('DELETE /api/addresses/:id', () => {
    it('should return 404 if address not found or not owned by user', async () => {
      (prisma.address.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      const response = await request(app)
        .delete('/api/addresses/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Address not found');
    });

    it('should delete address successfully', async () => {
      (prisma.address.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const response = await request(app)
        .delete('/api/addresses/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Address deleted successfully');
    });

    it('should return 500 on database error', async () => {
      (prisma.address.deleteMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .delete('/api/addresses/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to delete address');
    });
  });

  describe('PUT /api/addresses/:id/default', () => {
    it('should set default address successfully', async () => {
      (prisma.address.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (prisma.address.update as jest.Mock).mockResolvedValue({ id: '1', isDefault: true });

      const response = await request(app)
        .put('/api/addresses/1/default')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Default address updated');
    });

    it('should return 500 on database error', async () => {
      (prisma.address.updateMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .put('/api/addresses/1/default')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to set default address');
    });
  });
});
