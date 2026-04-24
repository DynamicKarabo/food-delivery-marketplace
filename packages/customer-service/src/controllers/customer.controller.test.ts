import request from 'supertest';
import { app } from '../index';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      deleteMany: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('Customer Controller', () => {
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
        firstName: 'John',
        lastName: 'Doe',
        role: 'CUSTOMER',
        isActive: true
    }); // This mock is for auth.middleware.ts to authenticate the token
  });

  describe('GET /api/customers/me', () => {
    it('should return 401 if not authenticated', async () => {
      const response = await request(app).get('/api/customers/me');
      expect(response.status).toBe(401);
    });

    it('should return user profile successfully', async () => {
      // Find user for auth middleware returns successfully from beforeEach

      // We need to provide two mock values for findUnique if it is called twice, but
      // actually auth.middleware finds by id & isActive.
      // So let's refine the mock to return different things if needed, or just return the user profile.
      (prisma.user.findUnique as jest.Mock).mockImplementation((args) => {
          if (args.select) {
              // This is the controller call
              return Promise.resolve({
                  id: 'user-id',
                  email: 'test@test.com',
                  firstName: 'John',
                  lastName: 'Doe',
                  phone: '1234567890',
                  role: 'CUSTOMER',
                  emailVerified: true,
                  createdAt: new Date().toISOString(),
                  customerProfile: {},
                  addresses: [],
                  _count: { favorites: 0, reviews: 0 }
              });
          }
          // This is the middleware call
          return Promise.resolve({ id: 'user-id', email: 'test@test.com', isActive: true, role: 'CUSTOMER' });
      });

      const response = await request(app)
        .get('/api/customers/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('user-id');
      expect(response.body.data.email).toBe('test@test.com');
    });

    it('should return 404 if user not found in controller', async () => {
        (prisma.user.findUnique as jest.Mock).mockImplementation((args) => {
            if (args.select) {
                return Promise.resolve(null); // Controller returns null
            }
            return Promise.resolve({ id: 'user-id', email: 'test@test.com', isActive: true, role: 'CUSTOMER' }); // Middleware passes
        });

      const response = await request(app)
        .get('/api/customers/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User not found');
    });

    it('should return 500 on database error', async () => {
        (prisma.user.findUnique as jest.Mock).mockImplementation((args) => {
            if (args.select) {
                return Promise.reject(new Error('DB Error'));
            }
            return Promise.resolve({ id: 'user-id', email: 'test@test.com', isActive: true, role: 'CUSTOMER' });
        });

      const response = await request(app)
        .get('/api/customers/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to fetch profile');
    });
  });

  describe('PUT /api/customers/me', () => {
    it('should update user profile successfully', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-id',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '0987654321',
        customerProfile: { preferences: '{"theme":"dark"}' }
      });

      const response = await request(app)
        .put('/api/customers/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: 'Jane', lastName: 'Smith', phone: '0987654321', preferences: { theme: 'dark' } });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Jane');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: {
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '0987654321',
          customerProfile: {
            update: { preferences: '{"theme":"dark"}' }
          }
        },
        select: expect.any(Object)
      });
    });

    it('should return 500 on database error', async () => {
      (prisma.user.update as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .put('/api/customers/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: 'Jane' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to update profile');
    });
  });

  describe('DELETE /api/customers/me', () => {
    it('should deactivate account successfully', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue({ id: 'user-id', isActive: false });
      (prisma.refreshToken.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const response = await request(app)
        .delete('/api/customers/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Account deactivated successfully');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { isActive: false }
      });
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' }
      });
    });

    it('should return 500 on database error', async () => {
      (prisma.user.update as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .delete('/api/customers/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to deactivate account');
    });
  });
});
