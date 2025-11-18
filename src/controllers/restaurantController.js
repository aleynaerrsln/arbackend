const Restaurant = require('../models/Restaurant');

// @desc    Tüm restoranları getir
// @route   GET /api/restaurants
// @access  Public
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().select('-password');
    
    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Restoranlar getirilirken hata oluştu',
      error: error.message
    });
  }
};

// @desc    ID'ye göre tek restoran getir
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).select('-password');
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restoran bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Restoran getirilirken hata oluştu',
      error: error.message
    });
  }
};

// @desc    Yeni restoran oluştur
// @route   POST /api/restaurants
// @access  Public (Sonra Auth ekleyeceğiz)
exports.createRestaurant = async (req, res) => {
  try {
    const { name, displayName, username, password, email, phone, address } = req.body;
    
    // Zorunlu alanları kontrol et
    if (!name || !displayName || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen tüm zorunlu alanları doldurun (name, displayName, username, password)'
      });
    }
    
    // Restoran zaten var mı kontrol et
    const existingRestaurant = await Restaurant.findOne({ 
      $or: [{ name }, { username }] 
    });
    
    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: 'Bu restoran adı veya kullanıcı adı zaten kullanılıyor'
      });
    }
    
    // Yeni restoran oluştur
    const restaurant = await Restaurant.create({
      name,
      displayName,
      username,
      password,
      email,
      phone,
      address
    });
    
    // Password'u response'dan çıkar
    const restaurantData = restaurant.toObject();
    delete restaurantData.password;
    
    res.status(201).json({
      success: true,
      message: 'Restoran başarıyla oluşturuldu',
      data: restaurantData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Restoran oluşturulurken hata oluştu',
      error: error.message
    });
  }
};

// @desc    Restoran güncelle
// @route   PUT /api/restaurants/:id
// @access  Private (Sonra Auth ekleyeceğiz)
exports.updateRestaurant = async (req, res) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restoran bulunamadı'
      });
    }
    
    // Şifre güncelleniyorsa, hashlenecek (model'de pre-save hook var)
    restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');
    
    res.status(200).json({
      success: true,
      message: 'Restoran başarıyla güncellendi',
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Restoran güncellenirken hata oluştu',
      error: error.message
    });
  }
};

// @desc    Restoran sil
// @route   DELETE /api/restaurants/:id
// @access  Private (Sonra Auth ekleyeceğiz)
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restoran bulunamadı'
      });
    }
    
    await Restaurant.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Restoran başarıyla silindi',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Restoran silinirken hata oluştu',
      error: error.message
    });
  }
};

// @desc    Name'e göre restoran getir (Public sayfa için)
// @route   GET /api/restaurants/name/:name
// @access  Public
exports.getRestaurantByName = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ 
      name: req.params.name.toLowerCase() 
    }).select('-password');
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restoran bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Restoran getirilirken hata oluştu',
      error: error.message
    });
  }
};