const Sample = require('../models/Sample');
const MovementLog = require('../models/MovementLog');
const Location = require('../models/Location');
const asyncHandler = require('express-async-handler');

// @desc    Scan sample to move or update status
// @route   POST /api/movements/scan
// @access  Private
const scanSample = asyncHandler(async (req, res) => {
    const { barcode, toLocationId, status, comments } = req.body;
    
    // Find sample by barcode or SKU
    const sample = await Sample.findOne({
        $or: [
            { sku: barcode },
            { barcodes: barcode }
        ]
    });

    if (!sample) {
        res.status(404);
        throw new Error('Sample not found');
    }

    const previousLocation = sample.currentLocation_id;
    const previousStatus = sample.status;

    // Update Sample
    let isChanged = false;

    if (toLocationId && (String(toLocationId) !== String(previousLocation))) {
        sample.currentLocation_id = toLocationId;
        isChanged = true;
    }
    if (status && status !== previousStatus) {
        sample.status = status;
        isChanged = true;
    }

    if (isChanged) {
        await sample.save();
    }

    // Log Movement
    let action = 'MOVED';
    if (status && status !== previousStatus) action = 'STATUS_CHANGE';
    
    await MovementLog.create({
        sample_id: sample._id,
        action,
        fromLocation_id: previousLocation,
        toLocation_id: toLocationId || previousLocation,
        performedBy: req.user._id,
        comments
    });

    res.json({ message: 'Success', sample });
});

// @desc    Get movement history for a sample
// @route   GET /api/movements/history/:sampleId
// @access  Private
const getHistory = asyncHandler(async (req, res) => {
    const logs = await MovementLog.find({ sample_id: req.params.sampleId })
        .populate('fromLocation_id', 'name')
        .populate('toLocation_id', 'name')
        .populate('performedBy', 'name')
        .sort({ createdAt: -1 });

    res.json(logs);
});

// @desc    Get all movements
// @route   GET /api/movements
// @access  Private
const getMovements = asyncHandler(async (req, res) => {
    const pageSize = 20;
    const page = Number(req.query.pageNumber) || 1;

    const count = await MovementLog.countDocuments({});

    const logs = await MovementLog.find({})
        .populate('sample_id', 'name sku styleNo')
        .populate('fromLocation_id', 'name')
        .populate('toLocation_id', 'name')
        .populate('performedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ logs, page, pages: Math.ceil(count / pageSize) });
});

module.exports = { scanSample, getHistory, getMovements };
