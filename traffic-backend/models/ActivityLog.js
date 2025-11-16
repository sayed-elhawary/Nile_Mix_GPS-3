// models/ActivityLog.js
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: String,
  role: String,
  action: {
    type: String,
    required: true,
    enum: ['ADD_VIOLATION', 'DELETE_VIOLATION', 'UPDATE_PERCENTAGE']
  },
  violationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Violation'
  },
  details: {
    type: Object,
    default: {}
  },
  ipAddress: String
}, {
  timestamps: true  // createdAt & updatedAt تلقائي
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
