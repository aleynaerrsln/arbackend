const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Storage ayarları
const storage = multer.diskStorage({
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

// Dosya filtresi (sadece 3D model formatları)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.glb', '.gltf', '.obj', '.fbx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece .glb, .gltf, .obj, .fbx dosyaları yüklenebilir'), false);
  }
};

// Multer yapılandırması
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB maksimum dosya boyutu
  }
});

module.exports = upload;