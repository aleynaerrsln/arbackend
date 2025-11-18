const mongoose = require('mongoose');

const model3DSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restoran ID gerekli']
  },
  name: {
    type: String,
    required: [true, 'Model adı gerekli']
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'Genel'
  },
  modelUrl: {
    type: String,
    required: [true, 'Model URL gerekli']
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: 0
  },
  format: {
    type: String,
    enum: ['glb', 'gltf', 'obj'],
    default: 'glb'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  metadata: {
    vertices: Number,
    polygons: Number,
    scanDate: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Model3D', model3DSchema);