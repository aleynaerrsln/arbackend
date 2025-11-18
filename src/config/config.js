// Tüm konfigürasyon ayarları
const config = {
  PORT: 5000,
  
  // MongoDB Atlas Connection String (SSL parametreleri eklendi)
  MONGODB_URI: 'mongodb+srv://aleynaerarslan2002_db_user:123456aleyna@cluster0.3l5q4f9.mongodb.net/armenu-db?retryWrites=true&w=majority&appName=Cluster0&tls=true&tlsAllowInvalidCertificates=true',
  
  // JWT Ayarları
  JWT_SECRET: 'ar-menu-super-secret-key-2024-aleyna',
  JWT_EXPIRE: '7d',
  
  // Ortam
  NODE_ENV: 'development'
};

module.exports = config;