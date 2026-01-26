const express = require('express');
const router = express.Router();
const { createInvoice, getInvoices, getInvoiceById, approveInvoice } = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createInvoice)
    .get(protect, getInvoices);

router.route('/:id')
    .get(protect, getInvoiceById);

router.route('/:id/approve')
    .put(protect, approveInvoice);

module.exports = router;
