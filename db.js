const mongoose = require('mongoose');

// ...existing code...

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;

connection.once('open', () => {
  console.log('MongoDB connection established');
});

module.exports = { connection };
