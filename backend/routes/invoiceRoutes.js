const express = require('express');
const router = express.Router();
const { createInvoice, getInvoices, getInvoiceById, approveInvoice, rejectInvoice } = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createInvoice)
    .get(protect, getInvoices);

router.route('/:id')
    .get(protect, getInvoiceById);

router.route('/:id/approve')
    .put(protect, approveInvoice);

router.route('/:id/reject')
    .put(protect, rejectInvoice);

module.exports = router;
