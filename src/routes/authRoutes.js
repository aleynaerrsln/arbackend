const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// Routes
router.post('/login', login);  // POST /api/auth/login

module.exports = router;