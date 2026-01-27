const mongoose = require('mongoose');
const Sample = require('./models/Sample');
const Container = require('./models/Container');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        console.log("Checking for samples with legacy 'carton' field...");
        
        // Find samples where carton is set (not null, not empty) AND container is not set
        const samples = await Sample.find({ 
            carton: { $exists: true, $ne: '' }
        });
        
        console.log(`Found ${samples.length} samples with 'carton' field data.`);
        
        const cartonMap = {};
        
        samples.forEach(s => {
            if (!s.carton) return;
            if (!cartonMap[s.carton]) cartonMap[s.carton] = 0;
            cartonMap[s.carton]++;
        });
        
        console.log("\nSummary of Legacy Cartons:");
        for (const [cartonId, count] of Object.entries(cartonMap)) {
            console.log(`- Carton ID: "${cartonId}" has ${count} samples`);
        }
        
    } catch(e) { console.error(e); }
    process.exit();
});
