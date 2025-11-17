const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'hr'],  // ← أضفنا hr هنا
    default: 'user' 
  }
});

module.exports = mongoose.model('User', userSchema);
