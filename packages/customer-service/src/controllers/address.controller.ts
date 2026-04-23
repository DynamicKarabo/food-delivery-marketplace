import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getAddresses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' }
    });

    res.json({
      success: true,
      data: addresses
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch addresses'
    });
  }
};

export const createAddress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { street, city, state, country, zipCode, latitude, longitude, label, deliveryInstructions } = req.body;

    // If this is the first address, make it default
    const addressCount = await prisma.address.count({
      where: { userId }
    });

    const address = await prisma.address.create({
      data: {
        userId,
        street,
        city,
        state,
        country: country || 'US',
        zipCode,
        latitude,
        longitude,
        label: label || 'Home',
        isDefault: addressCount === 0,
        deliveryInstructions
      }
    });

    res.status(201).json({
      success: true,
      data: address
    });
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create address'
    });
  }
};

export const updateAddress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { street, city, state, country, zipCode, latitude, longitude, label, deliveryInstructions } = req.body;

    const address = await prisma.address.updateMany({
      where: { id, userId },
      data: {
        street,
        city,
        state,
        country,
        zipCode,
        latitude,
        longitude,
        label,
        deliveryInstructions
      }
    });

    if (address.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }

    const updatedAddress = await prisma.address.findUnique({
      where: { id }
    });

    res.json({
      success: true,
      data: updatedAddress
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update address'
    });
  }
};

export const deleteAddress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const address = await prisma.address.deleteMany({
      where: { id, userId }
    });

    if (address.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete address'
    });
  }
};

export const setDefaultAddress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Unset current default
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false }
    });

    // Set new default
    await prisma.address.update({
      where: { id },
      data: { isDefault: true }
    });

    res.json({
      success: true,
      message: 'Default address updated'
    });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set default address'
    });
  }
};
