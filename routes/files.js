const express = require('express');
const mongoose = require('mongoose');
const { gfsBucket } = require('../db');
const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const downloadStream = gfsBucket.openDownloadStream(fileId);

    downloadStream.on('data', (chunk) => {
      res.write(chunk);
    });

    downloadStream.on('error', (err) => {
      console.error('Error downloading file:', err);
      res.status(500).send('Error downloading file');
    });

    downloadStream.on('end', () => {
      res.end();
    });
  } catch (err) {
    console.error('Error retrieving file:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
