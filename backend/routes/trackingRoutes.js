const express = require('express');
const router = express.Router();
const {
    createContainer,
    addToContainer,
    getContainerByBarcode
} = require('../controllers/trackingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/containers', protect, createContainer);
router.post('/add-item', protect, addToContainer);
router.get('/containers/:id', protect, getContainerByBarcode);

module.exports = router;
