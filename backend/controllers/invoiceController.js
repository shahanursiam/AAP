const Invoice = require('../models/Invoice');
const Sample = require('../models/Sample');
const MovementLog = require('../models/MovementLog');
const asyncHandler = require('express-async-handler');

// @desc    Create new invoice (Request)
// @route   POST /api/invoices
// @access  Private
const createInvoice = asyncHandler(async (req, res) => {
    try {
        const { toLocationId, recipientName, sourceLocationId, items, remarks, invoiceType } = req.body;

        if (!items || items.length === 0) {
            res.status(400);
            throw new Error('No items in invoice');
        }

        // Calculate total quantity
        const totalQuantity = items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);

        // Validation: Check stock
        for (const item of items) {
             const sample = await Sample.findById(item.sampleId);
             if (!sample) {
                 res.status(404);
                 throw new Error(`Sample not found: ${item.sampleId}`);
             }
             if (sample.quantity < item.quantity) {
                 res.status(400);
                 throw new Error(`Insufficient stock for sample: ${sample.name} (Available: ${sample.quantity}, Requested: ${item.quantity})`);
             }
             // Ensure sample is at source location
             if (sourceLocationId && sample.currentLocation_id && sample.currentLocation_id.toString() !== sourceLocationId) {
                 res.status(400);
                 throw new Error(`Sample ${sample.name} is not at the selected source location`);
             }
        }

        // Create Invoice (Pending)
        const invoice = new Invoice({
            toLocation: toLocationId || null,
            recipientName,
            sourceLocation: sourceLocationId,
            items: items.map(i => ({ sample: i.sampleId, quantity: i.quantity, notes: i.notes })),
            totalQuantity,
            status: 'Pending',
            createdBy: req.user._id,
            remarks,
            invoiceType: invoiceType || 'Non-returnable'
        });

        const createdInvoice = await invoice.save();
        res.status(201).json(createdInvoice);

    } catch (error) {
        console.error('Invoice Creation Failed:', error);
        res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message, stack: error.stack });
    }
});

// @desc    Approve Invoice (Deduct Stock)
// @route   PUT /api/invoices/:id/approve
// @access  Private (Admin)
const approveInvoice = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
        res.status(404);
        throw new Error('Invoice not found');
    }

    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized. Admin only.');
    }

    if (invoice.status === 'Approved') {
        res.status(400);
        throw new Error('Invoice already approved');
    }

    // Deduct Stock Now
    for (const item of invoice.items) {
        const sample = await Sample.findById(item.sample);
        if (sample) {
            if (sample.quantity < item.quantity) {
                 res.status(400);
                 throw new Error(`Insufficient stock for ${sample.name}. Cannot approve.`);
            }

            sample.quantity = sample.quantity - item.quantity;
            await sample.save();

            // Log Movement
            await MovementLog.create({
                sample_id: sample._id,
                action: 'INVOICE_SENT', 
                toLocation_id: invoice.toLocation || null, 
                fromLocation_id: sample.currentLocation_id,
                performedBy: req.user._id,
                quantity: item.quantity,
                comments: `Invoice #${invoice.invoiceNo} Approved. Sent to: ${invoice.recipientName || 'External'}`
            });
        }
    }

    invoice.status = 'Approved';
    const updatedInvoice = await invoice.save();

    res.json(updatedInvoice);
});

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = asyncHandler(async (req, res) => {
    const pageSize = 20;
    const page = Number(req.query.pageNumber) || 1;

    let keyword = {};
    if (req.user.role !== 'admin') {
        keyword.createdBy = req.user._id;
    }

    const count = await Invoice.countDocuments(keyword);
    const invoices = await Invoice.find(keyword)
        .populate('toLocation', 'name')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ invoices, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Get invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id)
        .populate('toLocation', 'name address')
        .populate('createdBy', 'name email')
        .populate('items.sample', 'name sku styleNo size color');

    if (invoice) {
        // Access Check
        if (req.user.role !== 'admin' && invoice.createdBy._id.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to view this invoice');
        }
        res.json(invoice);
    } else {
        res.status(404);
        throw new Error('Invoice not found');
    }
});

module.exports = { createInvoice, getInvoices, getInvoiceById, approveInvoice };
