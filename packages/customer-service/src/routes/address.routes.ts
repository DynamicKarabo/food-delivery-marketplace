import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '../controllers/address.controller';

const router = Router();

router.get('/', authenticate, getAddresses);
router.post('/', authenticate, createAddress);
router.put('/:id', authenticate, updateAddress);
router.delete('/:id', authenticate, deleteAddress);
router.put('/:id/default', authenticate, setDefaultAddress);

export { router as addressRouter };
