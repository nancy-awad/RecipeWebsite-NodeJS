const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { validateRecipe, validateRecipeUpdate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// Anyone can view recipes
router.get('/', recipeController.getAllRecipes);
router.get('/:id', recipeController.getRecipeById);
router.get('/cuisine/:cuisineId', recipeController.getRecipesByCuisine);
router.get('/no-allergens/:allergyId', recipeController.getRecipesWithoutAllergen);
router.get('/goal/:goalId', recipeController.getRecipesByGoal);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

// Only logged-in users can create recipes
router.post('/', authenticateToken, validateRecipe, recipeController.createRecipe);

// Only logged-in users can add ingredients
router.post('/:id/ingredients', authenticateToken, recipeController.addIngredientToRecipe);

// Only recipe owner can update their recipe (ownership checked in controller)
router.put('/:id/title', authenticateToken, validateRecipeUpdate, recipeController.updateRecipeTitle);
router.put('/:id/allergy', authenticateToken, recipeController.updateRecipeAllergy);
router.put('/:id/instructions/:stepId', authenticateToken, recipeController.updateRecipeInstruction);

// Only recipe owner can delete their recipe (ownership checked in controller)
router.delete('/:id', authenticateToken, recipeController.deleteRecipe);
router.delete('/:id/ingredients/:ingredientId', authenticateToken, recipeController.removeIngredientFromRecipe);

module.exports = router;