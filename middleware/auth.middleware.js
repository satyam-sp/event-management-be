// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  console.log(token, '---token---')
  if (!token) {
    return res.status(403).send({ message: 'No token provided!' });
  }

  // Handle 'Bearer <token>' format
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized!' });
    }
    console.log('decode',decoded)
    req.userId = decoded.id;
    req.isAdmin = decoded.isAdmin;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).send({ message: 'Require Admin Role!' });
  }
  next();
};

module.exports = { verifyToken, isAdmin };