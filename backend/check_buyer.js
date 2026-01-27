const mongoose = require('mongoose');
const Sample = require('./models/Sample');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => { 
    try {
        const total = await Sample.countDocuments();
        const withBuyer = await Sample.countDocuments({ buyer: { $exists: true, $ne: null, $ne: '' } });
        console.log('Total Samples:', total); 
        console.log('Samples with Buyer:', withBuyer);
        
        const samples = await Sample.find({});
        const prefixes = new Set();
        samples.forEach(s => {
            if (s.sku) {
                const prefix = s.sku.split('-')[0];
                prefixes.add(prefix);
            }
        });
        console.log('Unique SKU Prefixes:', Array.from(prefixes));
    } catch(e) { console.error(e); }
    process.exit(); 
});
