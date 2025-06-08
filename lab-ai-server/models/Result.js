/* Result.js */
const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  filePath: { type: String, required: true },
  labResult: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Перевіряємо, чи модель уже існує, щоб уникнути повторної компіляції
module.exports = mongoose.models.Result || mongoose.model('Result', resultSchema);