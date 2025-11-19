const Model3D = require('../models/Model3D');
const Restaurant = require('../models/Restaurant');
const fs = require('fs');
const path = require('path');
const { processVideoTo3D } = require('../services/videoProcessing');

// @desc    Tüm 3D modelleri getir
// @route   GET /api/models
// @access  Public
exports.getAllModels = async (req, res) => {
  try {
    const models = await Model3D.find().populate('restaurantId', 'name displayName');
    
    res.status(200).json({
      success: true,
      count: models.length,
      data: models
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Modeller getirilirken hata oluştu',
      error: error.message
    });
  }
};

// @desc    Restorana göre 3D modelleri getir
// @route   GET /api/models/restaurant/:restaurantId
// @access  Public
exports.getModelsByRestaurant = async (req, res) => {
  try {
    const models = await Model3D.find({ 
      restaurantId: req.params.restaurantId 
    });
    
    res.status(200).json({
      success: true,
      count: models.length,
      data: models
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Modeller getirilirken hata oluştu',
      error: error.message
    });
  }
};

// @desc    ID'ye göre tek model getir
// @route   GET /api/models/:id
// @access  Public
exports.getModelById = async (req, res) => {
  try {
    const model = await Model3D.findById(req.params.id)
      .populate('restaurantId', 'name displayName');
    
    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Model bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: model
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Model getirilirken hata oluştu',
      error: error.message
    });
  }
};

// @desc    Yeni 3D model ekle (dosya ile)
// @route   POST /api/models
// @access  Private (Sonra auth ekleyeceğiz)
exports.createModel = async (req, res) => {
  try {
    const { restaurantId, name, description, category } = req.body;
    
    // Zorunlu alanları kontrol et
    if (!restaurantId || !name) {
      return res.status(400).json({
        success: false,
        message: 'Restoran ID ve model adı gerekli'
      });
    }
    
    // Restoran var mı kontrol et
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restoran bulunamadı'
      });
    }
    
    // Dosya yüklendi mi kontrol et
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen bir 3D model dosyası yükleyin'
      });
    }
    
    // Model URL'i oluştur
    const modelUrl = `/uploads/models/${req.file.filename}`;
    
    // Yeni model oluştur
    const model = await Model3D.create({
      restaurantId,
      name,
      description,
      category,
      modelUrl,
      fileSize: req.file.size,
      format: path.extname(req.file.filename).replace('.', '')
    });
    
    res.status(201).json({
      success: true,
      message: 'Model başarıyla oluşturuldu',
      data: model
    });
  } catch (error) {
    // Hata olursa yüklenen dosyayı sil
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads/models', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Model oluşturulurken hata oluştu',
      error: error.message
    });
  }
};

// @desc    Video'dan 3D model oluştur (YENİ ENDPOINT) ✨
// @route   POST /api/models/from-video
// @access  Private
exports.createModelFromVideo = async (req, res) => {
  try {
    const { restaurantId, name, description, category } = req.body;
    
    console.log('📹 Video upload isteği alındı');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    // Zorunlu alanları kontrol et
    if (!restaurantId || !name) {
      return res.status(400).json({
        success: false,
        message: 'Restoran ID ve model adı gerekli'
      });
    }
    
    // Restoran var mı kontrol et
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restoran bulunamadı'
      });
    }
    
    // Video yüklendi mi kontrol et
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen bir video dosyası yükleyin'
      });
    }
    
    console.log('✅ Validation başarılı, video işleme başlıyor...');
    
    // Video dosya yolu
    const videoPath = req.file.path;
    
    // Video → 3D Model pipeline
    const result = await processVideoTo3D(videoPath, name);
    
    console.log('✅ Pipeline tamamlandı:', result);
    
    // Database'e kaydet
    const model = await Model3D.create({
      restaurantId,
      name,
      description,
      category,
      modelUrl: result.modelUrl,
      fileSize: result.fileSize,
      format: 'glb',
      metadata: {
        vertices: 0, // Python'dan alınabilir
        polygons: 0,
        scanDate: new Date(),
        frameCount: result.frameCount,
        videoPath: videoPath
      }
    });
    
    console.log('✅ Model database\'e kaydedildi:', model._id);
    
    res.status(201).json({
      success: true,
      message: '3D model başarıyla oluşturuldu!',
      data: {
        model,
        processing: {
          frameCount: result.frameCount,
          framesDir: result.framesDir
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Video → 3D Model hatası:', error);
    
    // Hata olursa yüklenen video'yu sil
    if (req.file) {
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Video işlenirken hata oluştu',
      error: error.message
    });
  }
};

// @desc    Model sil
// @route   DELETE /api/models/:id
// @access  Private (Sonra auth ekleyeceğiz)
exports.deleteModel = async (req, res) => {
  try {
    const model = await Model3D.findById(req.params.id);
    
    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Model bulunamadı'
      });
    }
    
    // Dosyayı sil
    const filename = path.basename(model.modelUrl);
    const filePath = path.join(__dirname, '../../uploads/models', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Veritabanından sil
    await Model3D.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Model başarıyla silindi',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Model silinirken hata oluştu',
      error: error.message
    });
  }
};

// @desc    Model görüntülenme sayısını artır
// @route   PUT /api/models/:id/view
// @access  Public
exports.incrementViewCount = async (req, res) => {
  try {
    const model = await Model3D.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
    
    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Model bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: model
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Görüntülenme sayısı güncellenirken hata oluştu',
      error: error.message
    });
  }
};