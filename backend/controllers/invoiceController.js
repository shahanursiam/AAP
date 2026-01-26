const Invoice = require('../models/Invoice');
const Sample = require('../models/Sample');
const MovementLog = require('../models/MovementLog');
const asyncHandler = require('express-async-handler');

// @desc    Create new invoice (Bulk Distribute)
// @route   POST /api/invoices
// @access  Private
const createInvoice = asyncHandler(async (req, res) => {
    try {
        const { toLocationId, items, remarks } = req.body;

        if (!items || items.length === 0) {
            res.status(400);
            throw new Error('No items in invoice');
        }

        // Calculate total quantity
        const totalQuantity = items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);

        // Validation: Check stock for all items BEFORE creating invoice
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
        }

        // Create Invoice
        const invoice = new Invoice({
            toLocation: toLocationId,
            items: items.map(i => ({ sample: i.sampleId, quantity: i.quantity, notes: i.notes })),
            totalQuantity,
            createdBy: req.user._id,
            remarks
        });

        const createdInvoice = await invoice.save();

        // Process each item: Deduct Stock & Create Movement Log
        for (const item of items) {
            const sample = await Sample.findById(item.sampleId);
            if (sample) {
                // Update Sample Quantity (Subtract) - Simple Consumption
                sample.quantity = sample.quantity - item.quantity;
                await sample.save();

                // Log Movement
                await MovementLog.create({
                    sample_id: sample._id,
                    action: 'INVOICE_SENT', 
                    toLocation_id: toLocationId, // Where it was sent (External)
                    fromLocation_id: sample.currentLocation_id,
                    performedBy: req.user._id,
                    quantity: item.quantity,
                    comments: `Invoice #${createdInvoice.invoiceNo} - ${remarks || ''}`
                });
            }
        }

        res.status(201).json(createdInvoice);

    } catch (error) {
        console.error('Invoice Creation Failed:', error);
        res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message, stack: error.stack });
    }
});

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = asyncHandler(async (req, res) => {
    const pageSize = 20;
    const page = Number(req.query.pageNumber) || 1;

    const count = await Invoice.countDocuments({});
    const invoices = await Invoice.find({})
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
        res.json(invoice);
    } else {
        res.status(404);
        throw new Error('Invoice not found');
    }
});

module.exports = { createInvoice, getInvoices, getInvoiceById };
