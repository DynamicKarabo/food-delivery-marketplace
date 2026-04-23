import request from 'supertest';
import express, { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { createPaymentIntent, confirmPayment, refundPayment } from './payment.controller';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    order: {
      update: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

// Mock Stripe
jest.mock('stripe', () => {
  const mStripe = {
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
    refunds: {
      create: jest.fn(),
    },
  };
  return jest.fn(() => mStripe);
});

const prisma = new PrismaClient() as jest.Mocked<PrismaClient>;
const stripe = new Stripe('fake-secret-key') as jest.Mocked<Stripe>;

const app: Express = express();
app.use(express.json());

app.post('/payments/intent', createPaymentIntent);
app.post('/payments/confirm', confirmPayment);
app.post('/payments/refund', refundPayment);

describe('Payment Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /payments/intent', () => {
    it('should create payment intent successfully', async () => {
      const mockPaymentIntent = { id: 'pi_123', client_secret: 'secret_123' };
      (stripe.paymentIntents.create as jest.Mock).mockResolvedValue(mockPaymentIntent);
      (prisma.order.update as jest.Mock).mockResolvedValue({ id: 'order-1' });

      const response = await request(app)
        .post('/payments/intent')
        .send({ orderId: 'order-1', amount: 10.5 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          clientSecret: 'secret_123',
          paymentIntentId: 'pi_123',
        },
      });
      expect(stripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 1050,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        metadata: { orderId: 'order-1' },
      });
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: {
          paymentIntentId: 'pi_123',
          stripePaymentIntentId: 'pi_123',
        },
      });
    });

    it('should return 500 when creating payment intent fails', async () => {
      (stripe.paymentIntents.create as jest.Mock).mockRejectedValue(new Error('Stripe error'));

      const response = await request(app)
        .post('/payments/intent')
        .send({ orderId: 'order-1', amount: 10.5 });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ success: false, error: 'Failed to create payment intent' });
    });
  });

  describe('POST /payments/confirm', () => {
    it('should confirm payment successfully', async () => {
      const mockPaymentIntent = { id: 'pi_123', status: 'succeeded' };
      (stripe.paymentIntents.retrieve as jest.Mock).mockResolvedValue(mockPaymentIntent);
      (prisma.order.findFirst as jest.Mock).mockResolvedValue({ id: 'order-1' });
      (prisma.order.update as jest.Mock).mockResolvedValue({ id: 'order-1' });

      const response = await request(app)
        .post('/payments/confirm')
        .send({ paymentIntentId: 'pi_123' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, message: 'Payment confirmed' });
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { paymentStatus: 'PAID' },
      });
    });

    it('should return 400 if payment not completed', async () => {
      const mockPaymentIntent = { id: 'pi_123', status: 'requires_payment_method' };
      (stripe.paymentIntents.retrieve as jest.Mock).mockResolvedValue(mockPaymentIntent);

      const response = await request(app)
        .post('/payments/confirm')
        .send({ paymentIntentId: 'pi_123' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ success: false, error: 'Payment not completed' });
      expect(prisma.order.update).not.toHaveBeenCalled();
    });

    it('should return 500 when confirming payment fails', async () => {
      (stripe.paymentIntents.retrieve as jest.Mock).mockRejectedValue(new Error('Stripe error'));

      const response = await request(app)
        .post('/payments/confirm')
        .send({ paymentIntentId: 'pi_123' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ success: false, error: 'Failed to confirm payment' });
    });
  });

  describe('POST /payments/refund', () => {
    it('should refund payment successfully (full)', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        id: 'order-1',
        stripePaymentIntentId: 'pi_123',
      });
      const mockRefund = { id: 're_123' };
      (stripe.refunds.create as jest.Mock).mockResolvedValue(mockRefund);
      (prisma.order.update as jest.Mock).mockResolvedValue({ id: 'order-1' });

      const response = await request(app)
        .post('/payments/refund')
        .send({ orderId: 'order-1' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: mockRefund });
      expect(stripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_123',
      });
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { paymentStatus: 'REFUNDED' },
      });
    });

    it('should refund payment successfully (partial)', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        id: 'order-1',
        stripePaymentIntentId: 'pi_123',
      });
      const mockRefund = { id: 're_123' };
      (stripe.refunds.create as jest.Mock).mockResolvedValue(mockRefund);
      (prisma.order.update as jest.Mock).mockResolvedValue({ id: 'order-1' });

      const response = await request(app)
        .post('/payments/refund')
        .send({ orderId: 'order-1', amount: 5.0 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: mockRefund });
      expect(stripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_123',
        amount: 500,
      });
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { paymentStatus: 'PARTIALLY_REFUNDED' },
      });
    });

    it('should return 404 if payment intent not found', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        id: 'order-1',
        stripePaymentIntentId: null, // missing payment intent
      });

      const response = await request(app)
        .post('/payments/refund')
        .send({ orderId: 'order-1' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ success: false, error: 'Payment not found' });
      expect(stripe.refunds.create).not.toHaveBeenCalled();
    });

    it('should return 500 when refunding payment fails', async () => {
      (prisma.order.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/payments/refund')
        .send({ orderId: 'order-1' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ success: false, error: 'Failed to process refund' });
    });
  });
});
