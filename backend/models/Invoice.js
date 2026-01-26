const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema({
    invoiceNo: { type: String, required: true, unique: true },
    toLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    items: [{
        sample: { type: mongoose.Schema.Types.ObjectId, ref: 'Sample', required: true },
        quantity: { type: Number, required: true },
        notes: String
    }],
    totalQuantity: { type: Number, required: true },
    status: { type: String, default: 'Sent' }, // Sent, Received, Cancelled
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issueDate: { type: Date, default: Date.now },
    remarks: String
}, { timestamps: true });

// Generate Invoice No pre-save if not exists
invoiceSchema.pre('validate', async function() {
    if (!this.invoiceNo) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        
        try {
            const Invoice = mongoose.model('Invoice');
            const count = await Invoice.countDocuments();
            this.invoiceNo = `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
        } catch (e) {
             console.error('Invoice Number Generation Error:', e);
             // Fallback
             this.invoiceNo = `INV-${year}${month}-${Date.now()}`;
        }
    }
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
