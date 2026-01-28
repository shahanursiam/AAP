const ApprovalRequest = require('../models/ApprovalRequest');
const Sample = require('../models/Sample');
const MovementLog = require('../models/MovementLog');
const asyncHandler = require('express-async-handler');

const Invoice = require('../models/Invoice');

// @desc    Get all pending requests
// @route   GET /api/approvals
// @access  Private (Admin)
const getRequests = asyncHandler(async (req, res) => {
    // 1. Fetch Sample Approval Requests
    const approvalRequests = await ApprovalRequest.find({ status: 'PENDING' })
        .populate('merchandiser', 'name email')
        .populate('sample', 'name sku')
        .sort({ createdAt: -1 });

    // 2. Fetch Pending Invoices
    const pendingInvoices = await Invoice.find({ status: 'Pending' })
        .populate('createdBy', 'name email')
        .populate('toLocation', 'name')
        .sort({ createdAt: -1 });

    // 3. Format & Combine
    const formattedApprovals = approvalRequests.map(req => ({
        ...req.toObject(),
        type: 'SAMPLE_APPROVAL'
    }));

    const formattedInvoices = pendingInvoices.map(inv => ({
        ...inv.toObject(),
        type: 'INVOICE_APPROVAL',
        // Map invoice fields to match generic structure purely for sorting if needed, 
        // or just keep them distinct and handle in frontend.
        // Let's keep distinct but ensure we can sort.
        createdAt: inv.createdAt
    }));

    const allRequests = [...formattedApprovals, ...formattedInvoices].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json(allRequests);
});

// @desc    Handle request (Approve/Reject)
// @route   PUT /api/approvals/:id
// @access  Private (Admin)
const handleRequest = asyncHandler(async (req, res) => {
    const { status, adminResponse } = req.body; // status: APPROVED or REJECTED
    const request = await ApprovalRequest.findById(req.params.id);

    if (!request) {
        res.status(404);
        throw new Error('Request not found');
    }

    if (request.status !== 'PENDING') {
        res.status(400);
        throw new Error('Request already handled');
    }

    request.status = status;
    request.adminResponse = adminResponse;
    await request.save();

    if (status === 'APPROVED') {
        const sample = await Sample.findById(request.sample);
        if (!sample && request.action === 'UPDATE') {
             // Sample might have been deleted in mean time?
             res.status(404);
             throw new Error('Sample not found');
        }

        if (request.action === 'DELETE') {
            if (sample) {
                await Sample.deleteOne({ _id: sample._id });
                // Log
                await MovementLog.create({
                    sample_id: request.sample, // ID might linger in logs even if sample is gone
                    action: 'DELETED_VIA_APPROVAL',
                    performedBy: req.user._id, // Admin
                    comments: `Approved deletion requested by merchandiser`
                });
            }
        } else if (request.action === 'UPDATE') {
            // Apply changes
            const updates = request.data;
            Object.keys(updates).forEach(key => {
                // Security check: Only update allowed fields
                if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'createdBy') {
                    sample[key] = updates[key];
                }
            });
            await sample.save();

             // Log
             await MovementLog.create({
                sample_id: sample._id,
                action: 'UPDATED_VIA_APPROVAL',
                performedBy: req.user._id,
                comments: `Approved updates requested by merchandiser`
            });
        }
    }

    res.json(request);
});

module.exports = { getRequests, handleRequest };
