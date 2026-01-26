const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Drop the index
    await mongoose.connection.collection('samples').dropIndex('sku_1');
    console.log('Index "sku_1" dropped successfully');
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // If index doesn't exist, it throws error usually.
    process.exit(1);
  }
};

connectDB();
