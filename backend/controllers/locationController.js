const Location = require('../models/Location');
const asyncHandler = require('express-async-handler');

// @desc    Create location
// @route   POST /api/locations
// @access  Private (Admin/Manager)
const createLocation = asyncHandler(async (req, res) => {
    const { name, type, address } = req.body;
    const location = await Location.create({ name, type, address });
    res.status(201).json(location);
});

// @desc    Get all locations
// @route   GET /api/locations
// @access  Private
const getLocations = asyncHandler(async (req, res) => {
    const locations = await Location.find({});
    res.json(locations);
});

// @desc    Update location
// @route   PUT /api/locations/:id
// @access  Private (Admin/Manager)
const updateLocation = asyncHandler(async (req, res) => {
    const { name, type, address } = req.body;
    const location = await Location.findById(req.params.id);

    if (location) {
        location.name = name || location.name;
        location.type = type || location.type;
        location.address = address || location.address;
        
        const updatedLocation = await location.save();
        res.json(updatedLocation);
    } else {
        res.status(404);
        throw new Error('Location not found');
    }
});

// @desc    Delete location
// @route   DELETE /api/locations/:id
// @access  Private (Admin)
const deleteLocation = asyncHandler(async (req, res) => {
    const location = await Location.findById(req.params.id);

    if (location) {
        await Location.deleteOne({ _id: req.params.id });
        res.json({ message: 'Location removed' });
    } else {
        res.status(404);
        throw new Error('Location not found');
    }
});

module.exports = { createLocation, getLocations, updateLocation, deleteLocation };
