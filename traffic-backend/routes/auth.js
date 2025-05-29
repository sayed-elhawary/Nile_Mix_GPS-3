const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { register, login } = require('../controllers/authController');

// مسار التسجيل مع تحقق من البيانات
router.post(
  '/register',
  [
    body('username').isString().withMessage('اسم المستخدم مطلوب').notEmpty(),
    body('password').isLength({ min: 6 }).withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
    body('role').optional().isIn(['user', 'admin']).withMessage('الدور غير صالح'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  register
);

// مسار تسجيل الدخول مع تحقق من البيانات
router.post(
  '/login',
  [
    body('username').isString().withMessage('اسم المستخدم مطلوب').notEmpty(),
    body('password').isString().withMessage('كلمة المرور مطلوبة').notEmpty(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  login
);

module.exports = router;

