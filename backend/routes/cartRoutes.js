import express from 'express';
const router = express.Router();
import { authorizeUser } from '../utils/authFunctions.js';
import { getCart, addToCart, updateQuantity, removeFromCart, clearCart } from '../controllers/cartController.js';

router.get('/:userId', authorizeUser(['consumer']), getCart);
router.post('/:userId/add', authorizeUser(['consumer']), addToCart);
router.put('/:userId/update', authorizeUser(['consumer']), updateQuantity);
router.delete('/:userId/delete/:cartItemId', authorizeUser(['consumer']), removeFromCart);
router.delete('/:userId/clear', authorizeUser(['consumer']), clearCart);

export default router;