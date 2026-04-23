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
    favorite: {
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('Favorite Controller', () => {
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

  describe('GET /api/favorites/restaurants', () => {
    it('should return favorites successfully', async () => {
      const mockFavorites = [{ id: '1', restaurantId: 'rest-1', userId: 'user-id' }];
      (prisma.favorite.findMany as jest.Mock).mockResolvedValue(mockFavorites);

      const response = await request(app)
        .get('/api/favorites/restaurants')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockFavorites);
    });

    it('should return 500 on database error', async () => {
      (prisma.favorite.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .get('/api/favorites/restaurants')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to fetch favorites');
    });
  });

  describe('POST /api/favorites/restaurants/:restaurantId', () => {
    it('should add a favorite successfully', async () => {
      const mockFavorite = { id: '1', restaurantId: 'rest-1', userId: 'user-id' };
      (prisma.favorite.create as jest.Mock).mockResolvedValue(mockFavorite);

      const response = await request(app)
        .post('/api/favorites/restaurants/rest-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockFavorite);
    });

    it('should return 409 if already favorited (unique constraint)', async () => {
      const error: any = new Error('Unique constraint failed');
      error.code = 'P2002';
      (prisma.favorite.create as jest.Mock).mockRejectedValue(error);

      const response = await request(app)
        .post('/api/favorites/restaurants/rest-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Restaurant already in favorites');
    });

    it('should return 500 on other database error', async () => {
      (prisma.favorite.create as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .post('/api/favorites/restaurants/rest-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to add favorite');
    });
  });

  describe('DELETE /api/favorites/restaurants/:restaurantId', () => {
    it('should remove a favorite successfully', async () => {
      (prisma.favorite.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const response = await request(app)
        .delete('/api/favorites/restaurants/rest-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Removed from favorites');
      expect(prisma.favorite.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-id', restaurantId: 'rest-1' }
      });
    });

    it('should return 500 on database error', async () => {
      (prisma.favorite.deleteMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .delete('/api/favorites/restaurants/rest-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to remove favorite');
    });
  });
});
