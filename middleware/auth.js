const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const auth = (req, res, next) => {
  console.log("333333333333333333333333333333")

  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded 
   
    next();
  } catch (error) {
    res.status(401).json({ 
      message: 'Invalid token.' 
    });
  }
};

module.exports = auth;
