const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restoran adı gerekli'],
    unique: true,
    lowercase: true,
    trim: true
  },
  displayName: {
    type: String,
    required: [true, 'Görünen isim gerekli']
  },
  username: {
    type: String,
    required: [true, 'Kullanıcı adı gerekli'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Şifre gerekli'],
    minlength: 6,
    select: false
  },
  email: {
    type: String,
    match: [/^\S+@\S+\.\S+$/, 'Geçerli bir email girin']
  },
  phone: String,
  address: String,
  logo: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Şifreyi kaydetmeden önce hashle
restaurantSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Şifre karşılaştırma metodu
restaurantSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Restaurant', restaurantSchema);