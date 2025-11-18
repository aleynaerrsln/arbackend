const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const config = require('./src/config/config');

// Express app oluştur
const app = express();

// MongoDB Atlas bağlantısı
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads klasörünü statik yap
app.use('/uploads', express.static('uploads'));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 AR Menu Backend API',
    version: '1.0.0',
    status: 'running',
    database: 'MongoDB Atlas',
    author: 'Aleyna',
    endpoints: {
      restaurants: '/api/restaurants',
      auth: '/api/auth',
      models: '/api/models'
    }
  });
});

// ==================== ROUTES ====================
// Restaurant Routes
const restaurantRoutes = require('./src/routes/restaurantRoutes');
app.use('/api/restaurants', restaurantRoutes);

// Auth Routes
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

const modelRoutes = require('./src/routes/modelRoutes');
app.use('/api/models', modelRoutes);

// ===============================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route bulunamadı'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Sunucu hatası',
    error: err.message
  });
});

// Sunucuyu başlat
// Sunucuyu başlat
const PORT = config.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('═══════════════════════════════════════════════');
  console.log(`🚀 Server ${config.NODE_ENV} modunda çalışıyor`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`🌐 Network: http://172.20.10.12:${PORT}`);
  console.log('═══════════════════════════════════════════════');
});