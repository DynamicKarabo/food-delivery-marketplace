import { Request, Response } from 'express';
import { getRestaurants, getRestaurant } from './restaurant.controller';

describe('Restaurant Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('GET /', () => {
    it('should return list of restaurants', async () => {
      await getRestaurants(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe('GET /:id', () => {
    it('should return 404 for invalid id', async () => {
      mockRequest.params = { id: 'invalid-id' };
      await getRestaurant(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });
});
