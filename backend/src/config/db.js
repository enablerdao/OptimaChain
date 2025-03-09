const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // For development purposes, we'll use a mock database connection
    // In a real application, you would use mongoose.connect with your MongoDB URI
    console.log('Database connection simulated for development');
    
    // Uncomment the following line to connect to a real MongoDB instance
    // const conn = await mongoose.connect(process.env.MONGO_URI);
    // console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    return true;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;