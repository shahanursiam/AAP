const express = require('express');
const router = express.Router();
console.log('Sample Routes Loaded');
const { createSample, getSamples, getSampleById, getSampleByBarcode, updateSample, deleteSample, getSampleHistory, distributeSample, returnSample } = require('../controllers/sampleController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createSample)
    .get(protect, getSamples);

router.route('/lookup/:barcode')
    .get(protect, getSampleByBarcode);

router.route('/:id/history')
    .get(protect, getSampleHistory);

router.route('/:id/return')
    .put(protect, returnSample);

router.route('/:id/distribute')
    .put(protect, distributeSample);

router.route('/:id')
    .get(protect, getSampleById)
    .put(protect, updateSample)
    .delete(protect, deleteSample);

module.exports = router;
