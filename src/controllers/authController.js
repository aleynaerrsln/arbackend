const Restaurant = require('../models/Restaurant');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// @desc    Restoran paneline login
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kullanıcı adı ve şifre kontrolü
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen kullanıcı adı ve şifre girin'
      });
    }

    // Restoranı bul (password dahil)
    const restaurant = await Restaurant.findOne({ username }).select('+password');

    if (!restaurant) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz kullanıcı adı veya şifre'
      });
    }

    // Şifre kontrolü
    const isPasswordMatch = await restaurant.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz kullanıcı adı veya şifre'
      });
    }

    // JWT Token oluştur
    const token = jwt.sign(
      { 
        id: restaurant._id,
        username: restaurant.username,
        name: restaurant.name
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRE }
    );

    // Başarılı response
    res.status(200).json({
      success: true,
      message: 'Giriş başarılı',
      token: token,
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        displayName: restaurant.displayName,
        username: restaurant.username,
        email: restaurant.email,
        phone: restaurant.phone,
        address: restaurant.address
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login işlemi sırasında hata oluştu',
      error: error.message
    });
  }
};