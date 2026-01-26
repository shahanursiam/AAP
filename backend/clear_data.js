const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const clearData = async () => {
    await connectDB();

    try {
        const Sample = require('./models/Sample');
        const Invoice = require('./models/Invoice');
        const MovementLog = require('./models/MovementLog');
        // keeping Locations and Users as they are setup data, usually "sample data" implies the transactional data

        console.log('Clearing Samples...');
        await Sample.deleteMany({});
        
        console.log('Clearing Invoices...');
        await Invoice.deleteMany({});

        console.log('Clearing Movement Logs...');
        await MovementLog.deleteMany({});

        console.log('Data Cleared Successfully!');
        process.exit();
    } catch (error) {
        console.error('Error Clearing Data:', error);
        process.exit(1);
    }
};

clearData();
