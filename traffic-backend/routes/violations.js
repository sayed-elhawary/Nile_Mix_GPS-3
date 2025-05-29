// routes/violations.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  addViolation,
  getViolations,
  deleteViolation,
} = require('../controllers/violationController');

const {
  authMiddleware,
  adminMiddleware,
} = require('../middleware/authMiddleware');

// إعداد تخزين الصور باستخدام multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // مجلد التخزين
  },
  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ✅ إضافة مخالفة (خاص بالـ admin فقط)
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  addViolation
);

// ✅ جلب كل المخالفات (متاح لجميع المستخدمين المسجلين)
router.get('/', authMiddleware, getViolations);

// ✅ حذف مخالفة (خاص بالـ admin فقط)
router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  deleteViolation
);

module.exports = router;

