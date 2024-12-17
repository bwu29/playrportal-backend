const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

// ...existing code...

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const connection = mongoose.connection;

let gfsBucket;
connection.once('open', () => {
  gfsBucket = new GridFSBucket(connection.db, {
    bucketName: 'uploads'
  });
  console.log('GridFSBucket initialized');
});

module.exports = { connection, gfsBucket };
