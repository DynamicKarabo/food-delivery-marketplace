import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ success: true, service: 'restaurant-service', status: 'healthy', timestamp: new Date().toISOString() });
});

export { router as healthRouter };
