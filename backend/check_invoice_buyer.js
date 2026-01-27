const mongoose = require('mongoose');
const Invoice = require('./models/Invoice');
const Sample = require('./models/Sample');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => { 
    try {
        const invoice = await Invoice.findOne({ invoiceNo: 'INV-2601-0019' }).populate('items.sample');
        if (!invoice) {
            console.log('Invoice INV-2601-0019 not found');
        } else {
            console.log('Invoice Found:', invoice.invoiceNo);
            console.log('Items:');
            invoice.items.forEach(item => {
                console.log(`- SKU: ${item.sample.sku} | Name: ${item.sample.name} | Buyer: '${item.sample.buyer}' | ID: ${item.sample._id}`);
            });
        }
    } catch(e) { console.error(e); }
    process.exit(); 
});
