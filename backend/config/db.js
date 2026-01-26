const mongoose = require('mongoose');

const connectDB = require('mongoose').connect;

// Updating to use async/await and handle connection
const connect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connect;
