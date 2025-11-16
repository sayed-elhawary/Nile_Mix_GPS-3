// routes/activityLogs.js
const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// جلب كل اللوجز (للأدمن فقط)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 }) // من الأحدث للأقدم
      .populate('user', 'username name') // اختياري لو عايز تجيب بيانات اليوزر
      .lean();

    res.json(logs);
  } catch (err) {
    console.error('خطأ في جلب اللوجز:', err);
    res.status(500).json({ message: 'خطأ في جلب سجل الأنشطة' });
  }
});

module.exports = router;
