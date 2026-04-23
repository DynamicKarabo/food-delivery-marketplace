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
    review: {
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('Review Controller', () => {
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

  describe('GET /api/reviews', () => {
    it('should return reviews successfully', async () => {
      const mockReviews = [{ id: '1', orderId: 'ord-1', rating: 5, comment: 'Great!' }];
      (prisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);

      const response = await request(app)
        .get('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockReviews);
    });

    it('should return 500 on database error', async () => {
      (prisma.review.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .get('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to fetch reviews');
    });
  });

  describe('POST /api/reviews', () => {
    it('should return 400 if rating is less than 1', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ orderId: 'ord-1', restaurantId: 'rest-1', rating: 0, comment: 'Bad' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Rating must be between 1 and 5');
    });

    it('should return 400 if rating is greater than 5', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ orderId: 'ord-1', restaurantId: 'rest-1', rating: 6, comment: 'Bad' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Rating must be between 1 and 5');
    });

    it('should create a review successfully', async () => {
      const mockReview = { id: '1', orderId: 'ord-1', rating: 5, comment: 'Great!' };
      (prisma.review.create as jest.Mock).mockResolvedValue(mockReview);

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ orderId: 'ord-1', restaurantId: 'rest-1', rating: 5, comment: 'Great!' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockReview);
      expect(prisma.review.create).toHaveBeenCalledWith({
        data: {
          orderId: 'ord-1',
          userId: 'user-id',
          restaurantId: 'rest-1',
          rating: 5,
          comment: 'Great!'
        }
      });
    });

    it('should return 500 on database error', async () => {
      (prisma.review.create as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ orderId: 'ord-1', restaurantId: 'rest-1', rating: 4, comment: 'Good' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to create review');
    });
  });

  describe('PUT /api/reviews/:id', () => {
    it('should return 400 if rating is less than 1', async () => {
      const response = await request(app)
        .put('/api/reviews/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 0 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Rating must be between 1 and 5');
    });

    it('should return 400 if rating is greater than 5', async () => {
      const response = await request(app)
        .put('/api/reviews/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 6 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Rating must be between 1 and 5');
    });

    it('should return 404 if review not found or not owned by user', async () => {
      (prisma.review.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

      const response = await request(app)
        .put('/api/reviews/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 4 });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Review not found');
    });

    it('should update review successfully', async () => {
      (prisma.review.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      const mockReview = { id: '1', rating: 4, comment: 'Updated' };
      (prisma.review.findUnique as jest.Mock).mockResolvedValue(mockReview);

      const response = await request(app)
        .put('/api/reviews/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 4, comment: 'Updated' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockReview);
    });

    it('should return 500 on database error', async () => {
      (prisma.review.updateMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .put('/api/reviews/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 4 });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to update review');
    });
  });

  describe('DELETE /api/reviews/:id', () => {
    it('should return 404 if review not found or not owned by user', async () => {
      (prisma.review.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      const response = await request(app)
        .delete('/api/reviews/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Review not found');
    });

    it('should delete review successfully', async () => {
      (prisma.review.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const response = await request(app)
        .delete('/api/reviews/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Review deleted successfully');
    });

    it('should return 500 on database error', async () => {
      (prisma.review.deleteMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .delete('/api/reviews/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to delete review');
    });
  });
});
