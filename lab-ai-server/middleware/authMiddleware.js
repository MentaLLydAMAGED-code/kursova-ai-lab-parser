/* authMiddleware.js */
const jwt = require('jsonwebtoken');

   const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

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

   module.exports = authenticateToken;