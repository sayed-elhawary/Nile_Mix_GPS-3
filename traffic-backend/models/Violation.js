const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
  code: String,
  name: String,
  job: String,
  type: String,
  amount: Number,
  image: String,
  companyPercentage: {
    type: Number,
    default: 0,
    min: [0, 'النسبة لا يمكن أن تكون أقل من 0'],
    max: [100, 'النسبة لا يمكن أن تتجاوز 100']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Violation', violationSchema);
