const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema({
    invoiceNo: { type: String, required: true, unique: true },
    toLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' }, // Optional if external
    recipientName: { type: String }, // For external person
    sourceLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    items: [{
        sample: { type: mongoose.Schema.Types.ObjectId, ref: 'Sample', required: true },
        quantity: { type: Number, required: true },
        notes: String
    }],
    totalQuantity: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Sent', 'Cancelled'], default: 'Pending' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issueDate: { type: Date, default: Date.now },
    remarks: String,
    invoiceType: { type: String, enum: ['Returnable', 'Non-returnable'], default: 'Non-returnable' }
}, { timestamps: true });

// Generate Invoice No pre-save if not exists
invoiceSchema.pre('validate', async function() {
    if (!this.invoiceNo) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const prefix = `INV-${year}${month}-`;
        
        try {
            const Invoice = mongoose.model('Invoice');
            // Find last invoice created this month/year pattern
            const lastInvoice = await Invoice.findOne({ invoiceNo: { $regex: `^${prefix}` } })
                .sort({ createdAt: -1 });

            let nextNum = 1;
            if (lastInvoice && lastInvoice.invoiceNo) {
                const parts = lastInvoice.invoiceNo.split('-');
                const lastNum = parseInt(parts[2], 10);
                if (!isNaN(lastNum)) {
                    nextNum = lastNum + 1;
                }
            }
            
            this.invoiceNo = `${prefix}${String(nextNum).padStart(4, '0')}`;
        } catch (e) {
             console.error('Invoice Number Generation Error:', e);
             this.invoiceNo = `${prefix}${Date.now()}`;
        }
    }
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
