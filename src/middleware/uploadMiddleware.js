const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ==================== MODEL UPLOAD ====================
// Storage ayarları - 3D Model dosyaları için
const modelStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/models';
    
    // Klasör yoksa oluştur
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Benzersiz dosya adı: timestamp-randomnumber.uzantı
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'model-' + uniqueSuffix + ext);
  }
});

// Dosya filtresi - 3D model formatları
const modelFileFilter = (req, file, cb) => {
  const allowedTypes = ['.glb', '.gltf', '.obj', '.fbx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece .glb, .gltf, .obj, .fbx dosyaları yüklenebilir'), false);
  }
};

// Multer yapılandırması - 3D Modeller
const uploadModel = multer({
  storage: modelStorage,
  fileFilter: modelFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB maksimum dosya boyutu
  }
});

// ==================== VIDEO UPLOAD ====================
// Storage ayarları - Video dosyaları için
const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/videos';
    
    // Klasör yoksa oluştur
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Benzersiz dosya adı: timestamp-randomnumber.uzantı
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.webm'; // Default: webm
    cb(null, 'video-' + uniqueSuffix + ext);
  }
});

// Dosya filtresi - Video formatları
const videoFileFilter = (req, file, cb) => {
  const allowedTypes = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  // MIME type kontrolü
  const allowedMimes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
  
  if (allowedTypes.includes(ext) || allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece video dosyaları yüklenebilir (.mp4, .webm, .mov, .avi)'), false);
  }
};

// Multer yapılandırması - Video
const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB maksimum video boyutu
  }
});

// ==================== EXPORTS ====================
module.exports = {
  uploadModel: uploadModel.single('modelFile'),
  uploadVideo: uploadVideo.single('video'),
  uploadVideoMultiple: uploadVideo.array('videos', 5) // Maksimum 5 video
};