const express = require('express');
const router = express.Router();
const {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantByName
} = require('../controllers/restaurantController');

// Routes
router.route('/')
  .get(getAllRestaurants)      // GET /api/restaurants
  .post(createRestaurant);     // POST /api/restaurants

router.route('/:id')
  .get(getRestaurantById)      // GET /api/restaurants/:id
  .put(updateRestaurant)       // PUT /api/restaurants/:id
  .delete(deleteRestaurant);   // DELETE /api/restaurants/:id

router.route('/name/:name')
  .get(getRestaurantByName);   // GET /api/restaurants/name/:name

module.exports = router;