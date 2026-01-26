const Sample = require('../models/Sample');
const asyncHandler = require('express-async-handler');

// @desc    Get dashboard stats
// @route   GET /api/reports/stats
// @access  Private
const getStats = asyncHandler(async (req, res) => {
    const totalSamples = await Sample.countDocuments({});
    const inTransit = await Sample.countDocuments({ status: 'In Transit' });
    const delivered = await Sample.countDocuments({ status: 'Delivered' });
    
    // Example: Delayed if Created > 7 days ago and not completed
    const paramDate = new Date();
    paramDate.setDate(paramDate.getDate() - 7);
    const delayed = await Sample.countDocuments({ 
        createdAt: { $lt: paramDate },
        status: { $nin: ['Delivered', 'Closed', 'Approved', 'Rejected'] }
    });

    // Group by status
    const statusCounts = await Sample.aggregate([
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
