const jwt = require('jsonwebtoken');

// 1. Middleware عام للتحقق من التوكن فقط (أي مستخدم مسجل دخول)
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'غير مصرح - التوكن مفقود أو غير صحيح' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'توكن غير صالح أو منتهي الصلاحية' });
  }
};

// 2. Middleware للـ Admin فقط
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'غير مصرح لك - مطلوب صلاحية Admin' });
  }
  next();
};

// 3. Middleware للـ HR فقط
const hrMiddleware = (req, res, next) => {
  if (req.user.role !== 'hr') {
    return res.status(403).json({ message: 'غير مصرح لك - مطلوب صلاحية HR' });
  }
  next();
};

// 4. Middleware مرن: يسمح لأكتر من رول في نفس الوقت (مثلاً admin أو hr)
const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'غير مصرح لك - صلاحيات غير كافية' 
      });
    }
    next();
  };
};

// تصدير الكل
module.exports = {
  authMiddleware,
  adminMiddleware,
  hrMiddleware,
  allowRoles, // استخدمه كده: allowRoles('admin', 'hr')
};
