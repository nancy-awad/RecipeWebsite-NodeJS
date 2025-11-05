const express = require('express');
const router = express.Router();
const cuisineController = require('../controllers/cuisineController');
const { validateCuisine } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// Anyone can view cuisines
router.get('/', cuisineController.getAllCuisines);
router.get('/:id', cuisineController.getCuisineById);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

// Only logged-in users can create cuisines
router.post('/', authenticateToken, validateCuisine, cuisineController.createCuisine);

// Only logged-in users can update cuisines
router.put('/:id', authenticateToken, validateCuisine, cuisineController.updateCuisine);

// Only logged-in users can delete cuisines
router.delete('/:id', authenticateToken, cuisineController.deleteCuisine);

module.exports = router;