require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const mux = require('@mux/mux-node');

const app = express();
const upload = multer({ dest: 'uploads/' });

const muxClient = new mux.Video({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

app.use(express.json());



// POST /mux/upload: upload video to Mux
app.post('/mux/upload', upload.single('video'), async (req, res) => {
  try {
    const asset = await muxClient.assets.create({
      input: req.file.path,
      playback_policy: 'public',
    });
    fs.unlinkSync(req.file.path);
    res.json({ asset });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Merger backend running on port ${PORT}`);
});
