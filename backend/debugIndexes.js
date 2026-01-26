const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const debugIndexes = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to: ${conn.connection.name}`);
    
    const collection = mongoose.connection.collection('samples');
    const indexes = await collection.indexes();
    
    console.log('\n--- EXISTING INDEXES ON SAMPLES ---');
    console.log(JSON.stringify(indexes, null, 2));
    
    // Check if sku_1 exists and drop it if found
    const skuIndex = indexes.find(idx => idx.name === 'sku_1');
    if (skuIndex) {
        console.log('\nFOUND sku_1 index! Attempting to drop...');
        await collection.dropIndex('sku_1');
        console.log('DROPPED sku_1 index.');
    } else {
        console.log('\nsku_1 index NOT found.');
    }

    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

debugIndexes();
