const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
  code: String,
  name: String,
  job: String,
  type: String,
  amount: Number,
  image: String, // path to uploaded image
});

module.exports = mongoose.model('Violation', violationSchema);

