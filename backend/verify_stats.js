const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Sample = require('./models/Sample');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const verifyStats = async () => {
    await connectDB();

    console.log('--- Verifying Stats Logic ---');

    // 1. Total Count (Old Logic)
    const count = await Sample.countDocuments({});
    console.log(`countDocuments (Total Records): ${count}`);

    // 2. Sum Quantity (New Logic)
    const sumResult = await Sample.aggregate([
        { $match: {} },
        { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
    const totalQuantity = sumResult.length > 0 ? sumResult[0].total : 0;
    console.log(`Aggregate Sum Quantity: ${totalQuantity}`);

    // 3. Status Breakdown
    const statusCounts = await Sample.aggregate([
        { $match: {} },
        { $group: { _id: '$status', count: { $sum: '$quantity' } } }
    ]);
    console.log('Status Breakdown (By Quantity):');
    console.table(statusCounts);

    // Write to file for checking
    const fs = require('fs');
    let output = '';
    output += `countDocuments (Total Records): ${count}\n`;
    output += `Aggregate Sum Quantity: ${totalQuantity}\n`;
    output += 'Status Breakdown (By Quantity):\n' + JSON.stringify(statusCounts, null, 2) + '\n';
    
    fs.writeFileSync('stats_output.txt', output);
    console.log('Stats written to stats_output.txt');

    process.exit();
};

verifyStats();
