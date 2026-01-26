const express = require('express');
const router = express.Router();
const { getRequests, handleRequest } = require('../controllers/approvalController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getRequests);
router.route('/:id').put(protect, admin, handleRequest);

module.exports = router;
