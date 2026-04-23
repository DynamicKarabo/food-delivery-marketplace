import { Request, Response } from 'express';
import axios from 'axios';

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3004';

export const getOrders = async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${ORDER_SERVICE_URL}/api/orders`, {
      params: { customerId: req.user.id },
      headers: { Authorization: req.headers.authorization }
    });
    res.status(200).json(response.data);
  } catch (err: any) {
    console.error('Failed to fetch orders:', err.message);
    res.status(err.response?.status || 500).json({ success: false, error: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${ORDER_SERVICE_URL}/api/orders/${id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    
    // Ensure order belongs to this customer
    if (response.data?.data?.customerId !== req.user.id) {
       return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    res.status(200).json(response.data);
  } catch (err: any) {
    console.error('Failed to fetch order:', err.message);
    res.status(err.response?.status || 500).json({ success: false, error: 'Failed to fetch order' });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verify ownership first
    const getResponse = await axios.get(`${ORDER_SERVICE_URL}/api/orders/${id}`, {
      headers: { Authorization: req.headers.authorization }
    });

    if (getResponse.data?.data?.customerId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const response = await axios.post(`${ORDER_SERVICE_URL}/api/orders/${id}/cancel`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(200).json(response.data);
  } catch (err: any) {
    console.error('Failed to cancel order:', err.message);
    res.status(err.response?.status || 500).json({ success: false, error: 'Failed to cancel order' });
  }
};
