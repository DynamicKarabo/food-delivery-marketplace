import request from 'supertest';
import express, { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { handleStripeWebhook } from './webhook.controller';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    order: {
      update: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

// Mock Stripe
jest.mock('stripe', () => {
  const mStripe = {
    webhooks: {
      constructEvent: jest.fn(),
    },
  };
  return jest.fn(() => mStripe);
});

const prisma = new PrismaClient() as jest.Mocked<PrismaClient>;
const stripe = new Stripe('fake-secret-key') as jest.Mocked<Stripe>;

const app: Express = express();
// Webhook endpoint needs raw body, but for test we can use json or raw
app.use(express.raw({ type: 'application/json' }));
app.use(express.json()); // Also parse JSON just in case

app.post('/webhook', handleStripeWebhook);

describe('Webhook Controller', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('POST /webhook', () => {
    it('should return 400 if webhook signature verification fails', async () => {
      (stripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const response = await request(app)
        .post('/webhook')
        .set('stripe-signature', 'invalid-sig')
        .send({ id: 'evt_123' });

      expect(response.status).toBe(400);
      expect(response.text).toBe('Webhook Error: Invalid signature');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Webhook signature verification failed: Invalid signature');
    });

    it('should handle payment_intent.succeeded event', async () => {
      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            metadata: { orderId: 'order-1' },
          },
        },
      };

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent);
      (prisma.order.update as jest.Mock).mockResolvedValue({ id: 'order-1' });

      const response = await request(app)
        .post('/webhook')
        .set('stripe-signature', 'valid-sig')
        .send(mockEvent);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ received: true });
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { paymentStatus: 'PAID' },
      });
      expect(consoleLogSpy).toHaveBeenCalledWith('Payment succeeded for order: order-1');
    });

    it('should handle payment_intent.payment_failed event', async () => {
      const mockEvent = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            metadata: { orderId: 'order-1' },
          },
        },
      };

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent);
      (prisma.order.update as jest.Mock).mockResolvedValue({ id: 'order-1' });

      const response = await request(app)
        .post('/webhook')
        .set('stripe-signature', 'valid-sig')
        .send(mockEvent);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ received: true });
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { paymentStatus: 'FAILED' },
      });
      expect(consoleLogSpy).toHaveBeenCalledWith('Payment failed for order: order-1');
    });

    it('should handle unhandled event types gracefully', async () => {
      const mockEvent = {
        type: 'some_other_event',
        data: {
          object: {},
        },
      };

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent);

      const response = await request(app)
        .post('/webhook')
        .set('stripe-signature', 'valid-sig')
        .send(mockEvent);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ received: true });
      expect(consoleLogSpy).toHaveBeenCalledWith('Unhandled event type: some_other_event');
    });
  });
});
