const express = require('express');
const router = express.Router();
const { uploadModel, uploadVideo } = require('../middleware/uploadMiddleware');
const {
  getAllModels,
  getModelsByRestaurant,
  getModelById,
  createModel,
  createModelFromVideo,
  deleteModel,
  incrementViewCount
} = require('../controllers/modelController');

// Routes
router.route('/')
  .get(getAllModels)                              // GET /api/models
  .post(uploadModel, createModel);                // POST /api/models (file upload)

// YENİ: Video'dan 3D model oluştur ✨
router.route('/from-video')
  .post(uploadVideo, createModelFromVideo);       // POST /api/models/from-video

router.route('/:id')
  .get(getModelById)      // GET /api/models/:id
  .delete(deleteModel);   // DELETE /api/models/:id

router.route('/restaurant/:restaurantId')
  .get(getModelsByRestaurant); // GET /api/models/restaurant/:restaurantId

router.route('/:id/view')
  .put(incrementViewCount); // PUT /api/models/:id/view

module.exports = router;