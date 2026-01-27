const mongoose = require('mongoose');
const Invoice = require('./models/Invoice');
const Sample = require('./models/Sample');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => { 
    try {
        const invoice = await Invoice.findOne({ invoiceNo: 'INV-2601-0019' });
        if (!invoice) {
            console.log('Invoice NOT found');
        } else {
            console.log('Invoice Found. Updating items...');
            for (const item of invoice.items) {
                const sample = await Sample.findById(item.sample);
                if (sample) {
                    console.log(`Updating Sample ${sample.sku} (${sample.name})...`);
                    sample.buyer = 'MO Fishing';
                    await sample.save();
                    console.log('Updated.');
                }
            }
        }
    } catch(e) { console.error(e); }
    process.exit(); 
});
