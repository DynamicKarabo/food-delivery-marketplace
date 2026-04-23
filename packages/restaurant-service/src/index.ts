import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { restaurantRouter } from './routes/restaurant.routes';
import { menuRouter } from './routes/menu.routes';
import { orderRouter } from './routes/order.routes';
import { healthRouter } from './routes/health.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.use('/api/restaurants', restaurantRouter);
app.use('/api/menu', menuRouter);
app.use('/api/restaurant-orders', orderRouter);
app.use('/health', healthRouter);

app.listen(PORT, () => {
  console.log(`Restaurant Service running on port ${PORT}`);
});

export { app };