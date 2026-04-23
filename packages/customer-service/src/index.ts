import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { authRouter } from './routes/auth.routes';
import { customerRouter } from './routes/customer.routes';
import { addressRouter } from './routes/address.routes';
import { favoriteRouter } from './routes/favorite.routes';
import { reviewRouter } from './routes/review.routes';
import { healthRouter } from './routes/health.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/customers', customerRouter);
app.use('/api/addresses', addressRouter);
app.use('/api/favorites', favoriteRouter);
app.use('/api/reviews', reviewRouter);
app.use('/health', healthRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Customer Service running on port ${PORT}`);
});

export { app };
