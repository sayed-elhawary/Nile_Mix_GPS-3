// routes/violations.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Violation = require('../models/Violation');
const ActivityLog = require('../models/ActivityLog'); // جديد
const {
  addViolation,
  getViolations,
  deleteViolation,
} = require('../controllers/violationController');
const {
  authMiddleware,
  adminMiddleware,
} = require('../middleware/authMiddleware');

// إعداد multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// دالة مساعدة لتسجيل اللوج
const logActivity = async (req, action, violationId = null, details = {}) => {
  try {
    await ActivityLog.create({
      user: req.user.id,
      username: req.user.username || req.user.name,
      role: req.user.role,
      action,
      violationId,
      details,
      ipAddress: req.ip || req.connection.remoteAddress
    });
  } catch (err) {
    console.error('فشل في تسجيل اللوج:', err);
    // ما نوقفش الطلب حتى لو اللوج فشل
  }
};

// إضافة مخالفة
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  async (req, res) => {
    try {
      const { code, name, job, type, amount } = req.body;
      const image = req.file ? req.file.path : null;

      const newViolation = await Violation.create({
        code,
        name,
        job,
        type,
        amount: Number(amount),
        image,
        companyPercentage: 0
      });

      // تسجيل اللوج
      await logActivity(req, 'ADD_VIOLATION', newViolation._id, {
        code,
        name,
        job,
        type,
        amount: Number(amount),
        image: image
      });

      res.status(201).json(newViolation);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'خطأ في إضافة المخالفة' });
    }
  }
);

// جلب كل المخالفات
router.get('/', authMiddleware, getViolations);

// حذف مخالفة
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const violation = await Violation.findById(req.params.id);
    if (!violation) return res.status(404).json({ message: 'المخالفة غير موجودة' });

    const violationData = violation.toObject();

    await Violation.deleteOne({ _id: req.params.id });

    // تسجيل اللوج قبل الحذف
    await logActivity(req, 'DELETE_VIOLATION', req.params.id, {
      code: violationData.code,
      name: violationData.name,
      amount: violationData.amount,
      companyPercentage: violationData.companyPercentage
    });

    res.json({ message: 'تم حذف المخالفة بنجاح' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في حذف المخالفة' });
  }
});

// تعديل نسبة الشركة
router.patch('/:id/percentage', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { companyPercentage } = req.body;
    if (companyPercentage === undefined || companyPercentage === null) {
      return res.status(400).json({ message: 'حقل companyPercentage مطلوب' });
    }
    const percentage = Number(companyPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      return res.status(400).json({ message: 'النسبة يجب أن تكون بين 0 و 100' });
    }

    const oldViolation = await Violation.findById(req.params.id);
    if (!oldViolation) return res.status(404).json({ message: 'المخالفة غير موجودة' });

    const updated = await Violation.findByIdAndUpdate(
      req.params.id,
      { companyPercentage: percentage },
      { new: true }
    );

    // تسجيل اللوج
    await logActivity(req, 'UPDATE_PERCENTAGE', req.params.id, {
      code: oldViolation.code,
      name: oldViolation.name,
      oldPercentage: oldViolation.companyPercentage,
      newPercentage: percentage
    });

    res.json(updated);
  } catch (err) {
    console.error('خطأ في تعديل نسبة الشركة:', err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

module.exports = router;
