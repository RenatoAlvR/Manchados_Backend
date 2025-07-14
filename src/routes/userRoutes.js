
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/profile', protect, userController.getProfile);
router.get('/users', protect, authorize(['admin']), userController.getAllUsers);

module.exports = router;
