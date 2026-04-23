import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2023-10-16' as any // Use string correctly for typings if necessary, standard is '2023-10-16'
});

export const createPaymentIntent = async (amount: number, orderId: string) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe expects amount in cents
    currency: 'usd',
    metadata: { orderId }
  });

  return paymentIntent;
};

// handleWebhook would usually decode sig and return verified event
export const handleWebhook = (payload: Buffer, signature: string) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy';
  return stripe.webhooks.constructEvent(payload, signature, endpointSecret);
};
