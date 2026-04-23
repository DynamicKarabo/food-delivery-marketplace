import { Request, Response } from 'express';
import { createOrder, getOrder } from './order.controller';

describe('Order Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('POST /', () => {
    it('should create order with valid data', async () => {
      mockRequest.body = {
        customerId: 'test-customer',
        restaurantId: 'test-restaurant',
        items: [],
        deliveryAddress: { street: '123 Test St', city: 'Test', state: 'TS', zipCode: '12345' },
        deliveryFee: 2.99,
        tax: 0,
      };
      await createOrder(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe('GET /:id', () => {
    it('should return 404 for non-existent order', async () => {
      mockRequest.params = { id: 'non-existent' };
      await getOrder(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });
});
