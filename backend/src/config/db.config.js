const mongoose = require('mongoose');

const connectDatabase = async ({ mongoUri, dbName } = {}) => {
  const uri = mongoUri || process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017';
  const name = dbName || process.env.MONGODB_NAME || 'blood_donor_finder';
  if (mongoose.connection.readyState === 1) {
    if (mongoose.connection.name !== name) throw new Error('A different database is already connected in this process.');
    return mongoose.connection;
  }
  await mongoose.connect(uri, { dbName: name, serverSelectionTimeoutMS: 5000, autoIndex: true });
  return mongoose.connection;
};

module.exports = { connectDatabase };
