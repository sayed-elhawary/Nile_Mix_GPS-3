// traffic-backend/routes/violations.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Violation = require('../models/Violation');
const ActivityLog = require('../models/ActivityLog');
const { authMiddleware, allowRoles, adminMiddleware } = require('../middleware/authMiddleware');

// إعداد multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// دالة تسجيل اللوج
const logActivity = async (req, action, violationId = null, details = {}) => {
  try {
    await ActivityLog.create({
      user: req.user.id,
      username: req.user.username || req.user.name || 'غير معروف',
      role: req.user.role,
      action,
      violationId,
      details,
      ipAddress: req.ip || req.connection?.remoteAddress || 'غير معروف'
    });
  } catch (err) {
    console.error('فشل في تسجيل اللوج:', err);
  }
};

// 1. إضافة مخالفة جديدة (Admin فقط)
router.post('/', authMiddleware, allowRoles('admin'), upload.single('image'), async (req, res) => {
  try {
    const { carCode, amount, type, details } = req.body;
    if (!carCode || !amount || !type) {
      return res.status(400).json({ message: 'كود العربية والمبلغ ونوع المخالفة مطلوبة' });
    }
    const image = req.file ? req.file.path.replace(/\\/g, '/') : null;
    const newViolation = await Violation.create({
      carCode: carCode.trim(),
      amount: Number(amount),
      type: type.trim(),
      details: details?.trim() || '',
      image,
      status: 'pending',
      addedBy: req.user.id
    });
    await logActivity(req, 'ADD_PENDING_VIOLATION', newViolation._id, { carCode, amount, type, hasImage: !!image });
    res.status(201).json({ message: 'تم إضافة المخالفة بنجاح (معلقة لإكمال HR)', violation: newViolation });
  } catch (err) {
    console.error('خطأ في إضافة المخالفة:', err);
    res.status(500).json({ message: 'خطأ في إضافة المخالفة' });
  }
});

// 2. إكمال المخالفة (HR فقط)
router.patch('/:id/complete', authMiddleware, allowRoles('hr'), async (req, res) => {
  try {
    const { employeeCode, name, job } = req.body;
    if (!employeeCode || !name || !job) {
      return res.status(400).json({ message: 'كود الموظف والاسم والوظيفة مطلوبة' });
    }
    const violation = await Violation.findById(req.params.id);
    if (!violation) return res.status(404).json({ message: 'المخالفة غير موجودة' });
    if (violation.status === 'completed') {
      return res.status(400).json({ message: 'المخالفة مكتملة مسبقًا' });
    }

    const updated = await Violation.findByIdAndUpdate(req.params.id, {
      employeeCode: employeeCode.trim(),
      name: name.trim(),
      job: job.trim(),
      status: 'completed',
      completedBy: req.user.id,
      completedAt: new Date()
    }, { new: true });

    await logActivity(req, 'COMPLETE_VIOLATION', req.params.id, { carCode: violation.carCode, employeeCode, name, job });
    res.json({ message: 'تم إكمال المخالفة بنجاح', violation: updated });
  } catch (err) {
    console.error('خطأ في إكمال المخالفة:', err);
    res.status(500).json({ message: 'خطأ في إكمال المخالفة' });
  }
});

// 3. جلب المخالفات المعلقة
router.get('/pending', authMiddleware, allowRoles('admin', 'hr'), async (req, res) => {
  try {
    const violations = await Violation.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .select('carCode amount type details image createdAt');
    res.json(violations);
  } catch (err) {
    console.error('خطأ في جلب المخالفات المعلقة:', err);
    res.status(500).json({ message: 'حدث خطأ في جلب المخالفات المعلقة' });
  }
});

// 4. جلب المخالفات المكتملة - مع إضافة employeeCode في الاستعلام
router.get('/', authMiddleware, async (req, res) => {
  try {
    const violations = await Violation.find({ status: 'completed' })
      .sort({ completedAt: -1 })
      .populate('addedBy completedBy', 'username role')
      .lean(); // لتحسين الأداء

    // نضيف حقل افتراضي code = employeeCode عشان الفرونت يشتغل زي ما هو
    const formattedViolations = violations.map(v => ({
      ...v,
      code: v.employeeCode || 'غير محدد', // هنا الحل السحري
      companyPercentage: v.companyPercentage ?? 0
    }));

    res.json(formattedViolations);
  } catch (err) {
    console.error('خطأ في جلب المخالفات:', err);
    res.status(500).json({ message: 'حدث خطأ في السيرفر' });
  }
});

// 5. حذف مخالفة
router.delete('/:id', authMiddleware, allowRoles('admin', 'hr'), async (req, res) => {
  try {
    const violation = await Violation.findById(req.params.id);
    if (!violation) return res.status(404).json({ message: 'المخالفة غير موجودة' });

    if (violation.image) {
      const imagePath = path.join(__dirname, '..', violation.image);
      await fs.unlink(imagePath).catch(err => console.warn('فشل حذف الصورة:', err));
    }

    await Violation.deleteOne({ _id: req.params.id });
    await logActivity(req, 'DELETE_VIOLATION', req.params.id, {
      carCode: violation.carCode,
      employeeCode: violation.employeeCode,
      status: violation.status
    });

    res.json({ message: 'تم حذف المخالفة بنجاح' });
  } catch (err) {
    console.error('خطأ في حذف المخالفة:', err);
    res.status(500).json({ message: 'خطأ في حذف المخالفة' });
  }
});

// 6. تعديل نسبة الشركة
router.patch('/:id/percentage', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { companyPercentage } = req.body;
    const percentage = Number(companyPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      return res.status(400).json({ message: 'النسبة يجب أن تكون بين 0 و 100' });
    }

    const violation = await Violation.findById(req.params.id);
    if (!violation) return res.status(404).json({ message: 'المخالفة غير موجودة' });
    if (violation.status !== 'completed') {
      return res.status(400).json({ message: 'لا يمكن تعديل نسبة مخالفة معلقة' });
    }

    const updated = await Violation.findByIdAndUpdate(req.params.id, {
      companyPercentage: percentage
    }, { new: true }).lean();

    const formatted = {
      ...updated,
      code: updated.employeeCode || 'غير محدد',
      companyPercentage: updated.companyPercentage ?? 0
    };

    await logActivity(req, 'UPDATE_PERCENTAGE', req.params.id, {
      oldPercentage: violation.companyPercentage,
      newPercentage: percentage
    });

    res.json(formatted);
  } catch (err) {
    console.error('خطأ في تعديل نسبة الشركة:', err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

module.exports = router;
