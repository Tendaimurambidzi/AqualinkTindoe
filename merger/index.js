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

// POST /merge: upload audio and video, merge using ffmpeg, return merged video
app.post('/merge', upload.fields([{ name: 'video' }, { name: 'audio' }]), async (req, res) => {
  try {
    const videoFile = req.files['video'][0].path;
    const audioFile = req.files['audio'][0].path;
    const outputFile = `uploads/merged_${Date.now()}.mp4`;

    // Merge using ffmpeg
    await new Promise((resolve, reject) => {
      exec(`ffmpeg -i ${videoFile} -i ${audioFile} -c:v copy -c:a aac -strict experimental -shortest ${outputFile}`, (err, stdout, stderr) => {
        if (err) return reject(stderr);
        resolve();
      });
    });

    res.download(outputFile, () => {
      // Cleanup
      fs.unlinkSync(videoFile);
      fs.unlinkSync(audioFile);
      fs.unlinkSync(outputFile);
    });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

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
