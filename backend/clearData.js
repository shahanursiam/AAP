const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const clearData = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to: ${conn.connection.name}`);
    
    // Clear Collections
    console.log('Clearing Samples...');
    await mongoose.connection.collection('samples').deleteMany({});
    
    console.log('Clearing Movement Logs...');
    await mongoose.connection.collection('movementlogs').deleteMany({});
    
    console.log('Clearing Invoices...');
    await mongoose.connection.collection('invoices').deleteMany({});
    
    // Check if approvalrequests exists before clearing (might not if no requests made)
    const collections = await mongoose.connection.db.listCollections().toArray();
    const hasApproval = collections.some(c => c.name === 'approvalrequests');
    if (hasApproval) {
        console.log('Clearing Approval Requests...');
        await mongoose.connection.collection('approvalrequests').deleteMany({});
    }

    console.log('\n--- DATA CLEARED SUCCESSFULLY ---');
    console.log('Users and Locations were NOT deleted.');
    
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

clearData();
