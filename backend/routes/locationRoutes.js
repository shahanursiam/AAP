const express = require('express');
const router = express.Router();
const { createLocation, getLocations, updateLocation, deleteLocation } = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createLocation) // Typically Admin only, but protect for now
    .get(protect, getLocations);

router.route('/:id')
    .put(protect, updateLocation)
    .delete(protect, deleteLocation);

module.exports = router;
