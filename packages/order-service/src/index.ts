import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { orderRouter } from './routes/order.routes';
import { paymentRouter } from './routes/payment.routes';
import { webhookRouter } from './routes/webhook.routes';
import { healthRouter } from './routes/health.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.use('/api/orders', orderRouter);
app.use('/api/payments', paymentRouter);
app.use('/webhooks', webhookRouter);
app.use('/health', healthRouter);

app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});

export { app };
