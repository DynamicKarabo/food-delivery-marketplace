import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { driverRouter } from './routes/driver.routes';
import { deliveryRouter } from './routes/delivery.routes';
import { healthRouter } from './routes/health.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.use('/api/drivers', driverRouter);
app.use('/api/deliveries', deliveryRouter);
app.use('/health', healthRouter);

app.listen(PORT, () => {
  console.log(`Driver Service running on port ${PORT}`);
});

export { app };