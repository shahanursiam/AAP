const User = require('../models/User');
const Sample = require('../models/Sample');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

// @desc    Get all merchandisers with sample count
// @route   GET /api/auth/users/merchandisers
// @access  Private (Admin)
const getMerchandisers = asyncHandler(async (req, res) => {
    // 1. Find all users with role 'merchandiser'
    const users = await User.find({ role: 'merchandiser' }).select('-passwordHash');

    // 2. Aggregate sample counts for each user
    const merchandisers = await Promise.all(users.map(async (user) => {
        const count = await Sample.countDocuments({ createdBy: user._id });
        
        const qtyAgg = await Sample.aggregate([
            { $match: { createdBy: user._id } },
            { $group: { _id: null, totalQty: { $sum: "$quantity" } } }
        ]);
        const totalQty = qtyAgg.length > 0 ? qtyAgg[0].totalQty : 0;

        return {
            ...user.toObject(),
            sampleCount: count,
            totalQuantity: totalQty
        };
    }));

    res.json(merchandisers);
});

// @desc    Create new merchandiser (Admin)
// @route   POST /api/auth/users
// @access  Private (Admin)
const createMerchandiser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        passwordHash: password, // Pre-save hook will hash this
        role: 'merchandiser'
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Update merchandiser
// @route   PUT /api/auth/users/:id
// @access  Private (Admin)
const updateMerchandiser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.passwordHash = req.body.password; // Pre-save hook hashes it
        }

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete merchandiser
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin)
const deleteMerchandiser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await User.deleteOne({ _id: user._id });
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = { getMerchandisers, createMerchandiser, updateMerchandiser, deleteMerchandiser };
