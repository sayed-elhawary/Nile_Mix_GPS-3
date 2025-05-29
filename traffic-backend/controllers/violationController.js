const Violation = require('../models/Violation');
const fs = require('fs');
const path = require('path');

// إضافة مخالفة جديدة
exports.addViolation = async (req, res) => {
  try {
    const { code, name, job, type, amount } = req.body;
    let imagePath = '';
    if (req.file) {
      imagePath = req.file.path.replace(/\\/g, '/'); // تحويل مسار الصورة إلى صيغة URL مناسبة
    }

    const violation = new Violation({
      code,
      name,
      job,
      type,
      amount,
      image: imagePath
    });

    await violation.save();
    res.status(201).json({ message: 'تم تسجيل المخالفة' });
  } catch (error) {
    console.error('Error in addViolation:', error);
    res.status(500).json({ message: 'حدث خطأ في السيرفر' });
  }
};

// جلب جميع المخالفات
exports.getViolations = async (req, res) => {
  try {
    const violations = await Violation.find();
    res.json(violations);
  } catch (error) {
    console.error('Error in getViolations:', error);
    res.status(500).json({ message: 'حدث خطأ في السيرفر' });
  }
};

// حذف مخالفة حسب المعرف (ID)
exports.deleteViolation = async (req, res) => {
  const violationId = req.params.id;

  try {
    // البحث عن المخالفة أولاً
    const violation = await Violation.findById(violationId);
    if (!violation) {
      return res.status(404).json({ message: 'المخالفة غير موجودة' });
    }

    // حذف صورة المخالفة من مجلد uploads إذا كانت موجودة
    if (violation.image) {
      const imagePath = path.join(__dirname, '..', violation.image);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.warn('فشل حذف صورة المخالفة:', err);
          // لا نوقف الحذف بسبب فشل حذف الصورة
        }
      });
    }

    // حذف المخالفة من قاعدة البيانات
    await Violation.findByIdAndDelete(violationId);

    res.json({ message: 'تم حذف المخالفة بنجاح' });
  } catch (error) {
    console.error('Error in deleteViolation:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء حذف المخالفة' });
  }
};

