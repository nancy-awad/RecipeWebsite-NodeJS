const express = require('express');
const router = express.Router();
const database = require('../config/database').getDB();
const { authenticate, requireAdmin } = require('../middleware/auth');

// ============================================
// SQL QUERIES ORGANIZED AT TOP
// ============================================

const sql = {
    // GET queries
    getAll: `
        SELECT ingredient_id, name, unit
        FROM Ingredients
        ORDER BY name ASC
    `,

    getById: `
        SELECT ingredient_id, name, unit
        FROM Ingredients
        WHERE ingredient_id = ?
    `,

    getRecipesByIngredient: `
        SELECT
            r.recipe_id,
            r.title,
            r.description,
            r.image_url,
            ri.quantity
        FROM Recipes r
        JOIN RecipeIngredients ri ON r.recipe_id = ri.recipe_id
        WHERE ri.ingredient_id = ?
    `,

    // POST queries
    create: `
        INSERT INTO Ingredients (name, unit)
        VALUES (?, ?)
    `,

    // PUT queries
    update: `
        UPDATE Ingredients
        SET name = ?, unit = ?
        WHERE ingredient_id = ?
    `,

    // DELETE queries
    deleteIngredient: 'DELETE FROM Ingredients WHERE ingredient_id = ?',

    // Check if ingredient exists
    checkExists: 'SELECT ingredient_id FROM Ingredients WHERE ingredient_id = ?',

    // Allergen queries
    getAllergiesForIngredient: `
        SELECT a.allergy_id, a.name
        FROM IngredientAllergies ia
        JOIN AllergiesInformation a ON ia.allergy_id = a.allergy_id
        WHERE ia.ingredient_id = ?
    `,

    addAllergyToIngredient: `
        INSERT INTO IngredientAllergies (ingredient_id, allergy_id)
        VALUES (?, ?)
    `,

    removeAllergyFromIngredient: `
        DELETE FROM IngredientAllergies
        WHERE ingredient_id = ? AND allergy_id = ?
    `
};

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * Get all ingredients
 * GET /api/ingredients
 */
router.get('/', (req, res) => {
    database.all(sql.getAll, [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database error',
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    });
});

/**
 * Get ingredient by ID with associated recipes
 * GET /api/ingredients/:id
 */
router.get('/:id', (req, res) => {
    const ingredientId = req.params.id;

    database.get(sql.getById, [ingredientId], (err, ingredient) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database error',
                error: err.message
            });
        }

        if (!ingredient) {
            return res.status(404).json({
                success: false,
                message: 'Ingredient not found'
            });
        }

        // Get recipes and allergens for this ingredient
        let pending = 2;
        let failed = false;

        const done = () => {
            if (--pending === 0 && !failed) {
                res.status(200).json({
                    success: true,
                    data: ingredient
                });
            }
        };

        const fail = (msg, error) => {
            if (!failed) {
                failed = true;
                res.status(500).json({ success: false, message: msg, error: error.message });
            }
        };

        database.all(sql.getRecipesByIngredient, [ingredientId], (err, recipes) => {
            if (err) return fail('Error fetching recipes for this ingredient', err);
            ingredient.recipes = recipes;
            ingredient.recipe_count = recipes.length;
            done();
        });

        database.all(sql.getAllergiesForIngredient, [ingredientId], (err, allergies) => {
            if (err) return fail('Error fetching allergies for this ingredient', err);
            ingredient.allergies = allergies;
            done();
        });
    });
});

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

/**
 * Create a new ingredient
 * POST /api/ingredients
 * Requires authentication
 */
router.post('/', authenticate, (req, res) => {
    const { name, unit } = req.body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Ingredient name is required and must not be empty'
        });
    }

    if (!unit || unit.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Unit is required and must not be empty'
        });
    }

    database.run(sql.create, [name.trim(), unit.trim()], function (err) {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create ingredient',
                error: err.message
            });
        }

        res.status(201).json({
            success: true,
            message: 'Ingredient created successfully',
            data: {
                ingredient_id: this.lastID,
                name: name.trim(),
                unit: unit.trim()
            }
        });
    });
});

/**
 * Update ingredient
 * PUT /api/ingredients/:id
 * Requires authentication
 */
router.put('/:id', authenticate, (req, res) => {
    const ingredientId = req.params.id;
    const { name, unit } = req.body;

    // Validate input
    if (!name || name.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Ingredient name is required and must not be empty'
        });
    }

    if (!unit || unit.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Unit is required and must not be empty'
        });
    }

    // First check if ingredient exists
    database.get(sql.checkExists, [ingredientId], (err, row) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database error',
                error: err.message
            });
        }

        if (!row) {
            return res.status(404).json({
                success: false,
                message: 'Ingredient not found'
            });
        }

        // Update the ingredient
        database.run(sql.update, [name.trim(), unit.trim(), ingredientId], function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update ingredient',
                    error: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: 'Ingredient updated successfully',
                data: {
                    ingredient_id: ingredientId,
                    name: name.trim(),
                    unit: unit.trim()
                }
            });
        });
    });
});

/**
 * Delete ingredient
 * DELETE /api/ingredients/:id
 * Requires authentication
 */
router.delete('/:id', authenticate, (req, res) => {
    const ingredientId = req.params.id;

    // First check if ingredient exists
    database.get(sql.checkExists, [ingredientId], (err, row) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database error',
                error: err.message
            });
        }

        if (!row) {
            return res.status(404).json({
                success: false,
                message: 'Ingredient not found'
            });
        }

        // Delete the ingredient
        database.run(sql.deleteIngredient, [ingredientId], function (err) {
            if (err) {
                // Check if error is due to foreign key constraint
                if (err.message.includes('FOREIGN KEY constraint failed')) {
                    return res.status(409).json({
                        success: false,
                        message: 'Cannot delete ingredient: It is used by existing recipes. Please remove it from those recipes first.'
                    });
                }

                return res.status(500).json({
                    success: false,
                    message: 'Failed to delete ingredient',
                    error: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: 'Ingredient deleted successfully'
            });
        });
    });
});

// ============================================
// ALLERGEN ROUTES
// ============================================

/**
 * Get allergies for an ingredient
 * GET /api/ingredients/:id/allergies
 * Public route
 */
router.get('/:id/allergies', (req, res) => {
    const ingredientId = req.params.id;

    database.get(sql.checkExists, [ingredientId], (err, row) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database error',
                error: err.message
            });
        }

        if (!row) {
            return res.status(404).json({
                success: false,
                message: 'Ingredient not found'
            });
        }

        database.all(sql.getAllergiesForIngredient, [ingredientId], (err, allergies) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching allergies',
                    error: err.message
                });
            }

            res.status(200).json({
                success: true,
                count: allergies.length,
                data: allergies
            });
        });
    });
});

/**
 * Add allergen to ingredient
 * POST /api/ingredients/:id/allergies
 * Requires admin authentication
 */
router.post('/:id/allergies', requireAdmin, (req, res) => {
    const ingredientId = req.params.id;
    const { allergy_id } = req.body;

    if (!allergy_id) {
        return res.status(400).json({
            success: false,
            message: 'allergy_id is required'
        });
    }

    database.run(sql.addAllergyToIngredient, [ingredientId, allergy_id], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint') || err.message.includes('PRIMARY KEY')) {
                return res.status(409).json({
                    success: false,
                    message: 'This allergen is already assigned to this ingredient'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Failed to add allergen to ingredient',
                error: err.message
            });
        }

        res.status(201).json({
            success: true,
            message: 'Allergen added to ingredient'
        });
    });
});

/**
 * Remove allergen from ingredient
 * DELETE /api/ingredients/:id/allergies/:allergyId
 * Requires admin authentication
 */
router.delete('/:id/allergies/:allergyId', requireAdmin, (req, res) => {
    const ingredientId = req.params.id;
    const allergyId = req.params.allergyId;

    database.run(sql.removeAllergyFromIngredient, [ingredientId, allergyId], function (err) {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to remove allergen from ingredient',
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Allergen not found on this ingredient'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Allergen removed from ingredient'
        });
    });
});

module.exports = router;
