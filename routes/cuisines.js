const express = require('express');
const router = express.Router();
const cuisineController = require('../controllers/cuisineController');
const { validateCuisine } = require('../middleware/validation');

// GET routes
router.get('/', cuisineController.getAllCuisines);
router.get('/:id', cuisineController.getCuisineById);

// POST routes
router.post('/', validateCuisine, cuisineController.createCuisine);

// PUT routes
router.put('/:id', validateCuisine, cuisineController.updateCuisine);

// DELETE routes
router.delete('/:id', cuisineController.deleteCuisine);

module.exports = router;