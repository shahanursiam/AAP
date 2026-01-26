const express = require('express');
const router = express.Router();
const { authUser, registerUser, getUserProfile } = require('../controllers/authController');
const { getMerchandisers, createMerchandiser, updateMerchandiser, deleteMerchandiser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const asyncHandler = require('express-async-handler');

router.post('/register', asyncHandler(registerUser));
router.post('/login', asyncHandler(authUser));
router.get('/me', protect, asyncHandler(getUserProfile));

// User Management Routes
router.route('/users/merchandisers')
    .get(protect, getMerchandisers);

router.route('/users')
    .post(protect, createMerchandiser);

router.route('/users/:id')
    .put(protect, updateMerchandiser)
    .delete(protect, deleteMerchandiser);

module.exports = router;
