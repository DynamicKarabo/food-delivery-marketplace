import request from 'supertest';
import express, { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability
} from './menu.controller';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    menuItem: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prismaMock = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('Menu Controller', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    app.get('/restaurants/:restaurantId/menu', getMenuItems);
    app.post('/restaurants/:restaurantId/menu', createMenuItem);
    app.put('/menu/:itemId', updateMenuItem);
    app.delete('/menu/:itemId', deleteMenuItem);
    app.patch('/menu/:itemId/toggle-availability', toggleAvailability);

    jest.clearAllMocks();
  });

  describe('GET /restaurants/:restaurantId/menu', () => {
    it('should return menu items successfully', async () => {
      const mockItems = [{ id: '1', name: 'Burger', restaurantId: 'r1' }];
      (prismaMock.menuItem.findMany as jest.Mock).mockResolvedValue(mockItems);

      const response = await request(app).get('/restaurants/r1/menu');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockItems);
      expect(prismaMock.menuItem.findMany).toHaveBeenCalledWith({
        where: { restaurantId: 'r1' },
        include: { options: { include: { choices: true } } }
      });
    });

    it('should return 500 when database query fails', async () => {
      (prismaMock.menuItem.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/restaurants/r1/menu');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to fetch menu items');
    });
  });

  describe('POST /restaurants/:restaurantId/menu', () => {
    it('should create a menu item successfully', async () => {
      const mockData = { name: 'Burger', price: 10 };
      const createdItem = { id: '1', restaurantId: 'r1', ...mockData };
      (prismaMock.menuItem.create as jest.Mock).mockResolvedValue(createdItem);

      const response = await request(app).post('/restaurants/r1/menu').send(mockData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(createdItem);
    });

    it('should return 500 when creation fails', async () => {
      (prismaMock.menuItem.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).post('/restaurants/r1/menu').send({ name: 'Burger' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to create menu item');
    });
  });

  describe('PUT /menu/:itemId', () => {
    it('should update a menu item successfully', async () => {
      const mockUpdate = { name: 'Updated Burger' };
      const updatedItem = { id: '1', name: 'Updated Burger' };
      (prismaMock.menuItem.update as jest.Mock).mockResolvedValue(updatedItem);

      const response = await request(app).put('/menu/1').send(mockUpdate);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedItem);
    });

    it('should return 500 when update fails', async () => {
      (prismaMock.menuItem.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).put('/menu/1').send({ name: 'Updated Burger' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to update menu item');
    });
  });

  describe('DELETE /menu/:itemId', () => {
    it('should delete a menu item successfully', async () => {
      (prismaMock.menuItem.delete as jest.Mock).mockResolvedValue({ id: '1' });

      const response = await request(app).delete('/menu/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Menu item deleted');
    });

    it('should return 500 when delete fails', async () => {
      (prismaMock.menuItem.delete as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).delete('/menu/1');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to delete menu item');
    });
  });

  describe('PATCH /menu/:itemId/toggle-availability', () => {
    it('should toggle availability successfully', async () => {
      const mockItem = { id: '1', isAvailable: true };
      const updatedItem = { id: '1', isAvailable: false };
      
      (prismaMock.menuItem.findUnique as jest.Mock).mockResolvedValue(mockItem);
      (prismaMock.menuItem.update as jest.Mock).mockResolvedValue(updatedItem);

      const response = await request(app).patch('/menu/1/toggle-availability');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedItem);
      expect(prismaMock.menuItem.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isAvailable: false }
      });
    });

    it('should return 404 when item to toggle is not found', async () => {
      (prismaMock.menuItem.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app).patch('/menu/invalid-id/toggle-availability');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Not found');
    });

    it('should return 500 when toggle fails', async () => {
      (prismaMock.menuItem.findUnique as jest.Mock).mockResolvedValue({ id: '1', isAvailable: true });
      (prismaMock.menuItem.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).patch('/menu/1/toggle-availability');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to toggle availability');
    });
  });
});
