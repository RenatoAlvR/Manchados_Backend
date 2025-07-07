const Product = require('../models/Product');
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.get('/', protect, orderController.getAllOrders);
router.get('/:id', protect, orderController.getOrderById);
router.post('/', protect, orderController.createOrder);
router.delete('/:id', protect, orderController.deleteOrder);

module.exports = router;
