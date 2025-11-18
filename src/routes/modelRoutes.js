const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
  getAllModels,
  getModelsByRestaurant,
  getModelById,
  createModel,
  deleteModel,
  incrementViewCount
} = require('../controllers/modelController');

// Routes
router.route('/')
  .get(getAllModels)                              // GET /api/models
  .post(upload.single('modelFile'), createModel); // POST /api/models (file upload)

router.route('/:id')
  .get(getModelById)      // GET /api/models/:id
  .delete(deleteModel);   // DELETE /api/models/:id

router.route('/restaurant/:restaurantId')
  .get(getModelsByRestaurant); // GET /api/models/restaurant/:restaurantId

router.route('/:id/view')
  .put(incrementViewCount); // PUT /api/models/:id/view

module.exports = router;