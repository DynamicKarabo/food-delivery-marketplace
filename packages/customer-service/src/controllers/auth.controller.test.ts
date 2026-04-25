import request from 'supertest';
import { app } from '../index';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should return 409 if email already registered', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1', email: 'test@test.com' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com', password: 'password', firstName: 'John', lastName: 'Doe' });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        success: false,
        error: 'Email already registered'
      });
    });

    it('should register a new user successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        role: 'CUSTOMER',
        createdAt: new Date().toISOString(),
        customerProfile: {}
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com', password: 'password', firstName: 'John', lastName: 'Doe', phone: '1234567890' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@test.com');
      expect(response.body.data.tokens).toBeDefined();
    });

    it('should return 500 on database error', async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com', password: 'password', firstName: 'John', lastName: 'Doe' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Registration failed');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 401 for invalid email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@test.com', password: 'password' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      const hashedPassword = await bcrypt.hash('correct-password', 10);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: hashedPassword,
        isActive: true
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'wrong-password' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should login successfully with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash('password', 10);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'CUSTOMER',
        isActive: true
      });
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({ id: '1' });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'password' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@test.com');
      expect(response.body.data.tokens).toBeDefined();
    });

    it('should return 500 on database error', async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'password' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Login failed');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should return 400 if no refresh token is provided', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Refresh token is required');
    });

    it('should return 401 if refresh token is invalid or expired', async () => {
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid or expired refresh token');
    });

    it('should return 401 if refresh token is expired', async () => {
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 1000), // Expired
        user: { id: '1', email: 'test@test.com', role: 'CUSTOMER' }
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'expired-token' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid or expired refresh token');
    });

    it('should refresh token successfully', async () => {
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 10000), // Valid
        user: { id: '1', email: 'test@test.com', role: 'CUSTOMER' }
      });
      (prisma.$transaction as jest.Mock).mockResolvedValue([{ id: '1' }, { id: '2' }]);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'valid-token' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens).toBeDefined();
    });

    it('should return 500 on database error', async () => {
      (prisma.refreshToken.findUnique as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'valid-token' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Token refresh failed');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      (prisma.refreshToken.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const response = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken: 'valid-token' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logged out successfully');
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { token: 'valid-token' } });
    });

    it('should return 500 on database error', async () => {
      (prisma.refreshToken.deleteMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken: 'valid-token' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Logout failed');
    });
  });
});
