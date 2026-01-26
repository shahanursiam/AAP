const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const checkIndexes = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    const samples = await mongoose.connection.collection('samples').indexes();
    console.log('\n--- SAMPLES INDEXES ---');
    console.log(samples);

    const invoices = await mongoose.connection.collection('invoices').indexes();
    console.log('\n--- INVOICES INDEXES ---');
    console.log(invoices);
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

checkIndexes();
