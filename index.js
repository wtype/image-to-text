const express = require('express');
const fs = require('fs');
const multer = require('multer');
const { createWorker } = require('tesseract.js');

const PORT = process.env.PORT || 9090;
const app = express();

const worker = createWorker();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage }).single('file');

app.set('view engine', 'ejs');

app.post('/upload', (req, res) => {
  upload(req, res, err => {
    fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
      if (err) return console.log(err);

      (async () => {
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const {
          data: { text },
        } = await worker.recognize(data);
        // res.redirect('/download');
        res.send(text);
        await worker.terminate();
      })();
    });
  });
});

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}`));
