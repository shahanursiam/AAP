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

    // Helper for summing quantity
    const sumQuantity = async (matchQuery) => {
        const result = await Sample.aggregate([
            { $match: matchQuery },
            { $group: { _id: null, total: { $sum: '$quantity' } } }
        ]);
        return result.length > 0 ? result[0].total : 0;
    };

    const totalSamplesCount = await Sample.countDocuments(filter); // Total Records
    const totalQuantity = await sumQuantity(filter); // Total Pieces
    
    const inTransit = await sumQuantity({ ...filter, status: 'In Transit' });
    const delivered = await sumQuantity({ ...filter, status: 'Delivered' });
    
    // Example: Delayed if Created > 7 days ago and not completed
    const paramDate = new Date();
    paramDate.setDate(paramDate.getDate() - 7);
    const delayed = await sumQuantity({ 
        ...filter,
        createdAt: { $lt: paramDate },
        status: { $nin: ['Delivered', 'Closed', 'Approved', 'Rejected'] }
    });

    // Group by status (Summing Quantity)
    const statusCounts = await Sample.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: '$quantity' } } } // Changed to sum quantity
    ]);

    // Group by Buyer (Customer)
    const buyerCounts = await Sample.aggregate([
        { $match: filter },
        { $group: { _id: '$buyer', count: { $sum: '$quantity' } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);

    // Group by Supplier (Factory)
    const factoryCounts = await Sample.aggregate([
        { $match: filter },
        { $group: { _id: '$supplier', count: { $sum: '$quantity' } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);

    res.json({
        totalSamplesCount,
        totalQuantity,
        inTransit,
        delivered,
        delayed,
        statusCounts,
        buyerCounts,
        factoryCounts
    });
});

module.exports = { getStats };
