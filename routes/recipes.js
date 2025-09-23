const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { validateRecipe, validateRecipeUpdate } = require('../middleware/validation');

// GET routes
router.get('/', recipeController.getAllRecipes);
router.get('/:id', recipeController.getRecipeById);
router.get('/cuisine/:cuisineId', recipeController.getRecipesByCuisine);
router.get('/no-allergens/:allergyId', recipeController.getRecipesWithoutAllergen);
router.get('/goal/:goalId', recipeController.getRecipesByGoal);

// POST routes
router.post('/', validateRecipe, recipeController.createRecipe);
router.post('/:id/ingredients', recipeController.addIngredientToRecipe);

// PUT routes
router.put('/:id/title', validateRecipeUpdate, recipeController.updateRecipeTitle);
router.put('/:id/allergy', recipeController.updateRecipeAllergy);
router.put('/:id/instructions/:stepId', recipeController.updateRecipeInstruction);

// DELETE routes
router.delete('/:id', recipeController.deleteRecipe);
router.delete('/:id/ingredients/:ingredientId', recipeController.removeIngredientFromRecipe);

module.exports = router;