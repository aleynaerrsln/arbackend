const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI);
    
    console.log('═══════════════════════════════════════════════');
    console.log('✅ MongoDB Atlas Bağlantısı BAŞARILI!');
    console.log(`📊 Veritabanı: ${conn.connection.name}`);
    console.log(`🌐 Host: ${conn.connection.host}`);
    console.log('═══════════════════════════════════════════════');
  } catch (error) {
    console.error('═══════════════════════════════════════════════');
    console.error('❌ MongoDB Bağlantı HATASI:');
    console.error(`📛 Hata: ${error.message}`);
    console.error('═══════════════════════════════════════════════');
    process.exit(1);
  }
};

module.exports = connectDB;