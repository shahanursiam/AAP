const Sample = require('../models/Sample');
const asyncHandler = require('express-async-handler');

// @desc    Get dashboard stats
// @route   GET /api/reports/stats
// @access  Private
const getStats = asyncHandler(async (req, res) => {
    // Basic filter: if merchandiser, only show their samples
    const filter = {};
    if (req.user.role === 'merchandiser') {
        filter.createdBy = req.user._id;
    }

    const totalSamples = await Sample.countDocuments(filter);
    const inTransit = await Sample.countDocuments({ ...filter, status: 'In Transit' });
    const delivered = await Sample.countDocuments({ ...filter, status: 'Delivered' });
    
    // Example: Delayed if Created > 7 days ago and not completed
    const paramDate = new Date();
    paramDate.setDate(paramDate.getDate() - 7);
    const delayed = await Sample.countDocuments({ 
        ...filter,
        createdAt: { $lt: paramDate },
        status: { $nin: ['Delivered', 'Closed', 'Approved', 'Rejected'] }
    });

    // Group by status
    // Need to match first for aggregation
    const statusCounts = await Sample.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
        totalSamples,
        inTransit,
        delivered,
        delayed,
        statusCounts
    });
});

module.exports = { getStats };
