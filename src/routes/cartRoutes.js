
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.post('/add', protect, cartController.addToCart);
router.delete('/remove', protect, cartController.removeFromCart);
router.patch('/update', protect,  cartController.updateCartItem);
router.delete('/empty/:userId', protect, cartController.emptyCart);
router.get('/:userId', protect,  cartController.getCartByUser);

module.exports = router;
