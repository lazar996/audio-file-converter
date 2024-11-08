import express from 'express';
import multer from 'multer';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs';

ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();
const PORT = 5500;

const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/upload', upload.single('audio'), (req, res) => {
  const inputFile = path.resolve(req.file.path); 
  const outputFile = path.resolve('uploads', `${req.file.filename}-converted.wav`);
  if (req.file.mimetype === 'audio/mp3' || req.file.mimetype === 'audio/mpeg' || req.file.mimetype === 'audio/wav') {
    ffmpeg(inputFile)
      .audioFrequency(8000)   
      .audioChannels(1)         
      .audioCodec('pcm_mulaw')  
      .on('end', () => {
        res.download(outputFile, `${req.file.originalname.replace(/\.[^/.]+$/, '')}-converted.wav`, (err) => {
          if (err) {
            console.error('Greška prilikom slanja fajla:', err);
          }
          fs.unlink(inputFile, () => {});
          fs.unlink(outputFile, () => {});
        });
      })
      .on('error', (err) => {
        res.status(500).send('Konverzija nije uspela');
      })
      .save(outputFile);
  } else {
    res.status(400).send('Molimo vas da postavite validan MP3 ili WAV fajl.');
  }
});

app.listen(PORT, () => {
  console.log(`Server radi na http://localhost:${PORT}`);
});
