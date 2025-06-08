/* pdfController.js */
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

const uploadPDF = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не передано' });
  }

  res.status(200).json({
    message: 'Файл успішно завантажено',
    filePath: req.file.path
  });
};

module.exports = { upload, uploadPDF };



