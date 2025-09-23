const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');
const { validateIngredient } = require('../middleware/validation');

// GET routes
router.get('/', ingredientController.getAllIngredients);
router.get('/:id', ingredientController.getIngredientById);

// POST routes
router.post('/', validateIngredient, ingredientController.createIngredient);

// PUT routes
router.put('/:id', validateIngredient, ingredientController.updateIngredient);

// DELETE routes
router.delete('/:id', ingredientController.deleteIngredient);

module.exports = router;