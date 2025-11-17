// traffic-backend/models/Violation.js
const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
  carCode: { type: String, required: true },           // كود العربية (الأدمن يملاه)
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  details: { type: String },
  image: { type: String },

  // بيانات الموظف (HR يكملها)
  employeeCode: { type: String },
  name: { type: String },
  job: { type: String },

  // حالة المخالفة
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },

  companyPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },

  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Violation', violationSchema);
