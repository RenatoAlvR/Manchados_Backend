
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.post('/add', cartController.addToCart);
router.delete('/remove', cartController.removeFromCart);
router.patch('/update', cartController.updateCartItem);
router.delete('/empty/:userId', cartController.emptyCart);
router.get('/:userId', cartController.getCartByUser);

module.exports = router;
