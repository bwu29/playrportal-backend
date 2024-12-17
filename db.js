const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

// ...existing code...

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;

let gridFSBucket;
connection.once('open', () => {
  try {
    gridFSBucket = new GridFSBucket(connection.db, {
      bucketName: 'uploads'
    });
    console.log('GridFSBucket initialized');
  } catch (error) {
    console.error('Error initializing GridFSBucket:', error);
  }
});

const getGridFSBucket = () => {
  if (!gridFSBucket) {
    throw new Error('GridFSBucket is not initialized');
  }
  return gridFSBucket;
};

module.exports = { connection, getGridFSBucket };
