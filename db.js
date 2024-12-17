const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

// ...existing code...

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;

let gfsBucket;
connection.once('open', () => {
  try {
    gfsBucket = new GridFSBucket(connection.db, {
      bucketName: 'uploads'
    });
    console.log('GridFSBucket initialized');
  } catch (error) {
    console.error('Error initializing GridFSBucket:', error);
  }
});

module.exports = { connection, gfsBucket };
