const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'غير مصرح' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'غير مصرح' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'توكن غير صالح' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'غير مصرح لك' });
  next();
};

module.exports = { authMiddleware, adminMiddleware };

