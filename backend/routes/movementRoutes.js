const express = require('express');
const router = express.Router();
const { scanSample, getHistory, getMovements } = require('../controllers/movementController');
const { protect } = require('../middleware/authMiddleware');

router.post('/scan', protect, scanSample);
router.get('/', protect, getMovements);
router.get('/history/:sampleId', protect, getHistory);

module.exports = router;
