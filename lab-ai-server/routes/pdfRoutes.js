/* pdfRoutes.js */
require('dotenv').config();
   const express = require('express');
   const router = express.Router();
   const upload = require('../middleware/uploadMiddleware');
   const fs = require('fs');
   const pdf = require('pdf-parse');
   const axios = require('axios');
   const Result = require('../models/result');
   const authenticateToken = require('../middleware/authMiddleware'); // Додаємо middleware

   const GROQ_API_KEY = process.env.GROQ_API_KEY;

   router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
     console.log('Запит на /api/upload отриманий');
     console.log('Файл:', req.file);

     if (!req.file) {
       return res.status(400).json({ message: 'Файл не завантажено' });
     }

     if (req.file.mimetype !== 'application/pdf') {
       return res.status(400).json({ message: 'Тільки PDF файли дозволені.' });
     }

     const filePath = `/uploads/${req.file.filename}`;

     try {
       console.log('Витягуємо текст із PDF...');
       const dataBuffer = fs.readFileSync(req.file.path);
       const data = await pdf(dataBuffer);
       const pdfText = data.text.trim();
       console.log('Текст із PDF:', pdfText);

       if (!pdfText) {
         return res.status(400).json({ message: 'PDF не містить тексту. Переконайся, що це не сканований документ.' });
       }

       console.log('API-ключ із .env:', GROQ_API_KEY);
       console.log('Надсилаємо запит до Groq API...');
       const groqResponse = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
         model: 'llama-3.3-70b-versatile',
         messages: [
           {
             role: 'user',
             content: `Виконай цю лабораторну роботу і поверни результат у текстовому вигляді:\n\n${pdfText}`
           }
         ]
       }, {
         headers: {
           'Authorization': `Bearer ${GROQ_API_KEY}`,
           'Content-Type': 'application/json'
         }
       });

       console.log('Відповідь від Groq API:', groqResponse.data);
       const labResult = groqResponse.data.choices[0].message.content;
       console.log('Текст відповіді від Groq API:', labResult);

       // Зберігаємо результат у базі даних
       const newResult = new Result({
         userId: req.user.id,
         filePath,
         labResult,
         uploadedAt: new Date(),
         updatedAt: new Date(),
       });
       await newResult.save();

       res.json({
         message: 'Лабораторна робота виконана',
         filePath,
         labResult
       });
     } catch (error) {
       console.error('Помилка:', error.response ? error.response.data : error.message);
       res.status(500).json({ 
         message: 'Помилка при обробці файлу', 
         error: error.response ? error.response.data : error.message 
       });
     }
   });

   // Маршрут для збереження результату
   router.post('/save-result', authenticateToken, async (req, res) => {
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
     } catch (error) {
       res.status(500).json({ message: 'Помилка при збереженні', error: error.message });
     }
   });

   // Маршрут для отримання збереженого результату
   router.get('/get-result', authenticateToken, async (req, res) => {
     const { filePath } = req.query;
     const userId = req.user.id;

     try {
       const result = await Result.findOne({ filePath, userId }).sort({ timestamp: -1 });
       if (result) {
         res.status(200).json({ id: result._id, labResult: result.labResult });
       } else {
         res.status(404).json({ message: 'Результат не знайдено' });
       }
     } catch (error) {
       res.status(500).json({ message: 'Помилка при отриманні результату', error: error.message });
     }
   });

   module.exports = router;