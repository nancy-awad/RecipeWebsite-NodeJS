const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');
const { validateIngredient } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// Anyone can view ingredients
router.get('/', ingredientController.getAllIngredients);
router.get('/:id', ingredientController.getIngredientById);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

// Only logged-in users can create ingredients
router.post('/', authenticateToken, validateIngredient, ingredientController.createIngredient);

// Only logged-in users can update ingredients
router.put('/:id', authenticateToken, validateIngredient, ingredientController.updateIngredient);

// Only logged-in users can delete ingredients
router.delete('/:id', authenticateToken, ingredientController.deleteIngredient);

module.exports = router;