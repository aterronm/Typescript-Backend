const mongoose = require('mongoose');

async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb+srv://aterronm:aterronm@aterronm.sa30qim.mongodb.net/?appName=aterronm';
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, { autoIndex: true });
  console.log('MongoDB conectado');
  return mongoose;
}

module.exports = { connectDB };
