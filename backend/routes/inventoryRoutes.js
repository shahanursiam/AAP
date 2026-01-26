const express = require('express');
const router = express.Router();
const { getInventorySummary } = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

router.route('/summary')
    .get(protect, getInventorySummary);

module.exports = router;
