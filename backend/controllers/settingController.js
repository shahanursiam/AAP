const SystemSetting = require('../models/SystemSetting');
const asyncHandler = require('express-async-handler');

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private (Admin)
const getSettings = asyncHandler(async (req, res) => {
    const settings = await SystemSetting.find({});
    // Convert array to object for easier frontend use
    const settingsObj = {};
    settings.forEach(s => {
        settingsObj[s.key] = s.value;
    });
    
    // Ensure default exists if not in DB
    if (settingsObj.editWindowMinutes === undefined) {
        settingsObj.editWindowMinutes = 120;
    }

    res.json(settingsObj);
});

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private (Admin)
const updateSettings = asyncHandler(async (req, res) => {
    const { editWindowMinutes } = req.body;

    if (editWindowMinutes !== undefined) {
        await SystemSetting.findOneAndUpdate(
            { key: 'editWindowMinutes' },
            { value: Number(editWindowMinutes), description: 'Time window (minutes) for merchandisers to edit/delete freely' },
            { upsert: true, new: true }
        );
    }

    res.json({ message: 'Settings updated' });
});

module.exports = { getSettings, updateSettings };
