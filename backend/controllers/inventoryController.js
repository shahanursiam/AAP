const Sample = require('../models/Sample');
const Location = require('../models/Location');
const asyncHandler = require('express-async-handler');

// @desc    Get inventory summary
// @route   GET /api/inventory/summary
// @access  Private
const getInventorySummary = asyncHandler(async (req, res) => {
    // Aggregate samples by location
    // We want to count samples where status is NOT 'Delivered' or 'Shipped' if we only want "In Stock"
    // For now, let's just count all that have a location
    
    const inventory = await Sample.aggregate([
        {
            $match: {
                currentLocation_id: { $exists: true, $ne: null } 
            }
        },
        {
            $group: {
                _id: '$currentLocation_id',
                count: { $sum: 1 },
                totalQuantity: { $sum: '$quantity' } 
            }
        },
        {
            $lookup: {
                from: 'locations',
                localField: '_id',
                foreignField: '_id',
                as: 'location'
            }
        },
        {
            $unwind: '$location'
        },
        {
            $project: {
                locationName: '$location.name',
                locationType: '$location.type',
                count: 1,
                totalQuantity: 1
            }
        }
    ]);

    // Also get counts by Status
    const statusCounts = await Sample.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    res.json({ inventory, statusCounts });
});

module.exports = { getInventorySummary };
