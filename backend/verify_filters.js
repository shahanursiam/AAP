const mongoose = require('mongoose');
const Sample = require('./models/Sample');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const verifyFilters = async () => {
    let output = 'Starting verification...\n';
    try {
        await mongoose.connect(process.env.MONGO_URI);
        output += 'MongoDB Connected\n';

        // 1. Basic Count
        const count = await Sample.countDocuments({});
        output += `Total Samples: ${count}\n`;

        // 2. Factory Check
        const factories = await Sample.distinct('factory');
        output += `Available Factories (distinct): ${JSON.stringify(factories)}\n`;

        // 3. Buyer Check
        const buyers = await Sample.distinct('buyer');
        output += `Available Buyers (distinct): ${JSON.stringify(buyers)}\n`;

        // 4. Raw Dump (First item)
        const sample = await Sample.findOne({});
        output += '--- FIRST SAMPLE DUMP ---\n';
        if (sample) {
            output += JSON.stringify(sample.toObject(), null, 2) + '\n';
        } else {
            output += 'No samples found.\n';
        }

    } catch (error) {
        output += 'CRITICAL ERROR:\n';
        output += error.stack || error.message;
    } finally {
        try {
            fs.writeFileSync('filters_debug_output.txt', output);
            console.log('Written to filters_debug_output.txt');
        } catch (writeErr) {
            console.error('Failed to write file:', writeErr);
        }
        process.exit();
    }
};

verifyFilters();
