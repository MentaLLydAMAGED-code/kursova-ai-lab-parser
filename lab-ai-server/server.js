/* server.js */
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const pdfRoutes = require('./routes/pdfRoutes');

// Тимчасово очищаємо кеш моделей
mongoose.models = {};
mongoose.modelSchemas = {};

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// Налаштування директорії для завантажених файлів
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Секретний ключ для JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Підключення до MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/lab-ai', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Схеми та моделі MongoDB
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);
const Result = require('./models/result.js');

// Middleware для перевірки JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Токен відсутній' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Недійсний токен' });
    req.user = user;
    next();
  });
};

// Реєстрація
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Користувач уже існує' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    repeat
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Користувач зареєстрований' });
  } catch (err) {
    res.status(500).json({ message: 'Помилка при реєстрації' });
  }
});

// Логін
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Неправильний email або пароль' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Помилка при вході' });
  }
});

// Використовуємо маршрути з pdfRoutes.js
app.use('/api', pdfRoutes);

// Збереження результату
app.post('/api/save-result', authenticateToken, async (req, res) => {
  const { labResult, filePath } = req.body;
  const userId = req.user.id;

  try {
    const existingResult = await Result.findOne({ filePath, userId });
    if (existingResult) {
      existingResult.labResult = labResult;
      existingResult.updatedAt = new Date();
      await existingResult.save();
      res.json({ id: existingResult._id });
    } else {
      const newResult = new Result({
        userId,
        filePath,
        labResult,
        uploadedAt: new Date(),
        updatedAt: new Date(),
      });
      const savedResult = await newResult.save();
      res.json({ id: savedResult._id });
    }
  } catch (err) {
    res.status(500).json({ message: 'Помилка при збереженні результату' });
  }
});

// Отримання результату
app.get('/api/get-result', authenticateToken, async (req, res) => {
  const { filePath } = req.query;
  const userId = req.user.id;

  try {
    const result = await Result.findOne({ filePath, userId });
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: 'Результат не знайдено' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Помилка при отриманні результату' });
  }
});

// Історія файлів
app.get('/api/history', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const userHistory = await Result.find({ userId });
    res.json(userHistory);
  } catch (err) {
    res.status(500).json({ message: 'Помилка при отриманні історії' });
  }
});

// Доступ до завантажених файлів
app.use('/uploads', express.static(uploadDir));

app.listen(5001, () => {
  console.log('Server running on http://localhost:5001');
});