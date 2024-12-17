// db.js
const mongoose = require("mongoose");
const { MongoClient, GridFSBucket } = require("mongodb");

let gfsBucket;

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/playerdb", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB Connected...");

    // Access the MongoDB connection's native database to create a GridFS bucket
    const connection = mongoose.connection.db;
    gfsBucket = new GridFSBucket(connection, { bucketName: "uploads" });

    console.log("GridFS Bucket initialized...");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = { connectDB, gfsBucket };
