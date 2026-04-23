import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });
const prisma = new PrismaClient();

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { orderId, amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: { orderId }
    });

    // Save payment intent ID to order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentIntentId: paymentIntent.id,
        stripePaymentIntentId: paymentIntent.id
      }
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ success: false, error: 'Failed to create payment intent' });
  }
};

export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      await prisma.order.update({
        where: { paymentIntentId },
        data: { paymentStatus: 'PAID' }
      });

      res.json({ success: true, message: 'Payment confirmed' });
    } else {
      res.status(400).json({ success: false, error: 'Payment not completed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to confirm payment' });
  }
};

export const refundPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, amount } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order?.stripePaymentIntentId) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    const refund = await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
      ...(amount && { amount: Math.round(amount * 100) })
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: amount ? 'PARTIALLY_REFUNDED' : 'REFUNDED' }
    });

    res.json({ success: true, data: refund });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to process refund' });
  }
};
