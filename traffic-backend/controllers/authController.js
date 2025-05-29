const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// تسجيل مستخدم جديد
exports.register = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // التحقق من وجود مستخدم بنفس اسم المستخدم مسبقًا
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'اسم المستخدم موجود بالفعل' });
    }

    // تشفير كلمة المرور قبل الحفظ
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء نموذج مستخدم جديد مع البيانات المدخلة
    const user = new User({
      username,
      password: hashedPassword,
      role: role || 'user', // الافتراضي 'user' إذا لم يُحدد الدور
    });

    // حفظ المستخدم في قاعدة البيانات
    await user.save();

    // الرد على العميل بنجاح التسجيل
    res.status(201).json({ message: 'تم التسجيل بنجاح' });
  } catch (error) {
    console.error('خطأ أثناء التسجيل:', error);
    res.status(500).json({ message: 'حدث خطأ في السيرفر، يرجى المحاولة لاحقًا' });
  }
};

// تسجيل الدخول والتحقق من بيانات المستخدم
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // البحث عن المستخدم في قاعدة البيانات عبر اسم المستخدم
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'بيانات الدخول غير صحيحة' });
    }

    // التحقق من مطابقة كلمة المرور
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'بيانات الدخول غير صحيحة' });
    }

    // إنشاء JWT يحتوي على بيانات المستخدم والمدة الزمنية لانتهائه
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // الرد مع التوكن ودور المستخدم ورسالة النجاح
    res.json({
      token,
      role: user.role,
      message: 'تم تسجيل الدخول بنجاح',
    });
  } catch (error) {
    console.error('خطأ أثناء تسجيل الدخول:', error);
    res.status(500).json({ message: 'حدث خطأ في السيرفر، يرجى المحاولة لاحقًا' });
  }
};
