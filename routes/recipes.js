const express = require('express');
const router = express.Router();
const database = require('../config/database').getDB();
const { authenticate, checkRecipeOwnership } = require('../middleware/auth');

// ============================================
// SQL QUERIES ORGANIZED AT TOP
// ============================================

const sql = {
    // GET queries
    getAll: `
        SELECT
            r.recipe_id, r.title, r.description, r.image_url,
            r.average_rating, r.total_ratings,
            c.name as cuisine_name,
            GROUP_CONCAT(DISTINCT g.name) as goal_names,
            GROUP_CONCAT(DISTINCT d.name) as diet_names
        FROM Recipes r
        LEFT JOIN Cuisines c ON r.cuisine_id = c.cuisine_id
        LEFT JOIN RecipeGoals rg ON r.recipe_id = rg.recipe_id
        LEFT JOIN Goals g ON rg.goal_id = g.goal_id
        LEFT JOIN RecipeDietary rd ON r.recipe_id = rd.recipe_id
        LEFT JOIN DietaryInformation d ON rd.diet_id = d.diet_id
        GROUP BY r.recipe_id
    `,

    getById: `
        SELECT
            r.*,
            c.name as cuisine_name
        FROM Recipes r
        LEFT JOIN Cuisines c ON r.cuisine_id = c.cuisine_id
        WHERE r.recipe_id = ?
    `,

    getIngredients: `
        SELECT i.ingredient_id, i.name, i.unit, ri.quantity
        FROM RecipeIngredients ri
        JOIN Ingredients i ON ri.ingredient_id = i.ingredient_id
        WHERE ri.recipe_id = ?
    `,

    getInstructions: `
        SELECT instruction_id, step_number, description
        FROM RecipeInstructions
        WHERE recipe_id = ?
        ORDER BY step_number
    `,

    getDietaryForRecipe: `
        SELECT d.diet_id, d.name
        FROM RecipeDietary rd
        JOIN DietaryInformation d ON rd.diet_id = d.diet_id
        WHERE rd.recipe_id = ?
    `,

    getGoalsForRecipe: `
        SELECT g.goal_id, g.name
        FROM RecipeGoals rg
        JOIN Goals g ON rg.goal_id = g.goal_id
        WHERE rg.recipe_id = ?
    `,

    getAllergensForRecipe: `
        SELECT DISTINCT a.allergy_id, a.name
        FROM RecipeIngredients ri
        JOIN IngredientAllergies ia ON ri.ingredient_id = ia.ingredient_id
        JOIN AllergiesInformation a ON ia.allergy_id = a.allergy_id
        WHERE ri.recipe_id = ?
    `,

    getByCuisine: `
        SELECT
            r.recipe_id, r.title, r.description, r.image_url,
            c.name as cuisine_name
        FROM Recipes r
        JOIN Cuisines c ON r.cuisine_id = c.cuisine_id
        WHERE r.cuisine_id = ?
    `,

    getByGoal: `
        SELECT
            r.recipe_id, r.title, r.description, r.image_url,
            g.name as goal_name
        FROM Recipes r
        JOIN RecipeGoals rg ON r.recipe_id = rg.recipe_id
        JOIN Goals g ON rg.goal_id = g.goal_id
        WHERE rg.goal_id = ?
    `,

    getWithoutAllergen: `
        SELECT
            r.recipe_id, r.title, r.description, r.image_url,
            c.name as cuisine_name
        FROM Recipes r
        LEFT JOIN Cuisines c ON r.cuisine_id = c.cuisine_id
        WHERE r.recipe_id NOT IN (
            SELECT ri.recipe_id
            FROM RecipeIngredients ri
            JOIN IngredientAllergies ia ON ri.ingredient_id = ia.ingredient_id
            WHERE ia.allergy_id = ?
        )
    `,

    getByUserId: `
        SELECT
            r.recipe_id, r.title, r.description, r.image_url,
            r.average_rating, r.total_ratings,
            c.name as cuisine_name,
            GROUP_CONCAT(DISTINCT g.name) as goal_names,
            GROUP_CONCAT(DISTINCT d.name) as diet_names
        FROM Recipes r
        LEFT JOIN Cuisines c ON r.cuisine_id = c.cuisine_id
        LEFT JOIN RecipeGoals rg ON r.recipe_id = rg.recipe_id
        LEFT JOIN Goals g ON rg.goal_id = g.goal_id
        LEFT JOIN RecipeDietary rd ON r.recipe_id = rd.recipe_id
        LEFT JOIN DietaryInformation d ON rd.diet_id = d.diet_id
        WHERE r.user_id = ?
        GROUP BY r.recipe_id
        ORDER BY r.recipe_id DESC
    `,

    // POST queries
    create: `
        INSERT INTO Recipes (title, description, image_url, cuisine_id, user_id)
        VALUES (?, ?, ?, ?, ?)
    `,

    addIngredient: `
        INSERT INTO RecipeIngredients (recipe_id, ingredient_id, quantity)
        VALUES (?, ?, ?)
    `,

    addDietary: `
        INSERT INTO RecipeDietary (recipe_id, diet_id)
        VALUES (?, ?)
    `,

    removeDietary: `
        DELETE FROM RecipeDietary
        WHERE recipe_id = ? AND diet_id = ?
    `,

    addGoal: `
        INSERT INTO RecipeGoals (recipe_id, goal_id)
        VALUES (?, ?)
    `,

    removeGoal: `
        DELETE FROM RecipeGoals
        WHERE recipe_id = ? AND goal_id = ?
    `,

    addInstruction: `
        INSERT INTO RecipeInstructions (recipe_id, step_number, description, ingredient_id)
        VALUES (?, ?, ?, ?)
    `,

    deleteInstruction: `
        DELETE FROM RecipeInstructions
        WHERE instruction_id = ? AND recipe_id = ?
    `,

    // PUT queries
    updateTitle: 'UPDATE Recipes SET title = ? WHERE recipe_id = ?',

    updateInstruction: `
        UPDATE RecipeInstructions
        SET description = ?
        WHERE instruction_id = ? AND recipe_id = ?
    `,

    // DELETE queries
    deleteRecipe: 'DELETE FROM Recipes WHERE recipe_id = ?',

    removeIngredient: `
        DELETE FROM RecipeIngredients
        WHERE recipe_id = ? AND ingredient_id = ?
    `,

    // OWNERSHIP CHECK queries
    checkOwnership: 'SELECT user_id FROM Recipes WHERE recipe_id = ?'
};

// Helper: transform GROUP_CONCAT strings into arrays
function parseGroupConcat(row) {
    return {
        ...row,
        goals: row.goal_names ? row.goal_names.split(',') : [],
        dietary: row.diet_names ? row.diet_names.split(',') : []
    };
}

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * Get all recipes
 * GET /api/recipes
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

        const data = rows.map(parseGroupConcat);

        res.status(200).json({
            success: true,
            count: data.length,
            data
        });
    });
});

/**
 * Get recipes created by logged-in user
 * GET /api/recipes/my-recipes
 * Requires authentication
 */
router.get('/my-recipes', authenticate, (req, res) => {
    const userId = req.user.user_id;

    database.all(sql.getByUserId, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database error',
                error: err.message
            });
        }

        const data = rows.map(parseGroupConcat);

        res.status(200).json({
            success: true,
            count: data.length,
            data,
            message: data.length === 0 ? 'You have not created any recipes yet' : undefined
        });
    });
});

/**
 * Get recipe by ID with ingredients, instructions, dietary, goals, and allergens
 * GET /api/recipes/:id
 */
router.get('/:id', (req, res) => {
    const recipeId = req.params.id;

    database.get(sql.getById, [recipeId], (err, recipe) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database error',
                error: err.message
            });
        }

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        // Fetch all sub-data in parallel using a counter
        let pending = 5;
        let failed = false;

        const done = () => {
            if (--pending === 0 && !failed) {
                res.status(200).json({
                    success: true,
                    data: recipe
                });
            }
        };

        const fail = (msg, error) => {
            if (!failed) {
                failed = true;
                res.status(500).json({ success: false, message: msg, error: error.message });
            }
        };

        database.all(sql.getIngredients, [recipeId], (err, rows) => {
            if (err) return fail('Error fetching ingredients', err);
            recipe.ingredients = rows;
            done();
        });

        database.all(sql.getInstructions, [recipeId], (err, rows) => {
            if (err) return fail('Error fetching instructions', err);
            recipe.instructions = rows;
            done();
        });

        database.all(sql.getDietaryForRecipe, [recipeId], (err, rows) => {
            if (err) return fail('Error fetching dietary info', err);
            recipe.dietary = rows;
            done();
        });

        database.all(sql.getGoalsForRecipe, [recipeId], (err, rows) => {
            if (err) return fail('Error fetching goals', err);
            recipe.goals = rows;
            done();
        });

        database.all(sql.getAllergensForRecipe, [recipeId], (err, rows) => {
            if (err) return fail('Error fetching allergens', err);
            recipe.allergens = rows;
            done();
        });
    });
});

/**
 * Get recipes by cuisine ID
 * GET /api/recipes/cuisine/:cuisineId
 */
router.get('/cuisine/:cuisineId', (req, res) => {
    const cuisineId = req.params.cuisineId;

    database.all(sql.getByCuisine, [cuisineId], (err, rows) => {
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
 * Get recipes without specific allergen (ingredient-level check)
 * GET /api/recipes/no-allergens/:allergyId
 */
router.get('/no-allergens/:allergyId', (req, res) => {
    const allergyId = req.params.allergyId;

    database.all(sql.getWithoutAllergen, [allergyId], (err, rows) => {
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
 * Get recipes by goal ID (through junction table)
 * GET /api/recipes/goal/:goalId
 */
router.get('/goal/:goalId', (req, res) => {
    const goalId = req.params.goalId;

    database.all(sql.getByGoal, [goalId], (err, rows) => {
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

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

/**
 * Create a new recipe
 * POST /api/recipes
 * Requires authentication
 */
router.post('/', authenticate, (req, res) => {
    const { title, description, image_url, cuisine_id } = req.body;
    const userId = req.user.user_id;

    if (!title || !description || !cuisine_id) {
        return res.status(400).json({
            success: false,
            message: 'Title, description, and cuisine_id are required'
        });
    }

    database.run(
        sql.create,
        [title, description, image_url, cuisine_id, userId],
        function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to create recipe',
                    error: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: 'Recipe created successfully',
                data: {
                    recipe_id: this.lastID,
                    title,
                    description,
                    user_id: userId
                }
            });
        }
    );
});

/**
 * Add ingredient to recipe
 * POST /api/recipes/:id/ingredients
 * Requires authentication + ownership
 */
router.post('/:id/ingredients', authenticate, checkRecipeOwnership, (req, res) => {
    const recipeId = req.params.id;
    const { ingredient_id, quantity } = req.body;

    if (!ingredient_id || !quantity) {
        return res.status(400).json({
            success: false,
            message: 'ingredient_id and quantity are required'
        });
    }

    database.run(sql.addIngredient, [recipeId, ingredient_id, quantity], function (err) {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to add ingredient',
                error: err.message
            });
        }

        res.status(201).json({
            success: true,
            message: 'Ingredient added to recipe'
        });
    });
});

/**
 * Add dietary classification to recipe
 * POST /api/recipes/:id/dietary
 * Requires authentication + ownership
 */
router.post('/:id/dietary', authenticate, checkRecipeOwnership, (req, res) => {
    const recipeId = req.params.id;
    const { diet_id } = req.body;

    if (!diet_id) {
        return res.status(400).json({
            success: false,
            message: 'diet_id is required'
        });
    }

    database.run(sql.addDietary, [recipeId, diet_id], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint') || err.message.includes('PRIMARY KEY')) {
                return res.status(409).json({
                    success: false,
                    message: 'This dietary classification is already assigned to this recipe'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Failed to add dietary classification',
                error: err.message
            });
        }

        res.status(201).json({
            success: true,
            message: 'Dietary classification added to recipe'
        });
    });
});

/**
 * Remove dietary classification from recipe
 * DELETE /api/recipes/:id/dietary/:dietId
 * Requires authentication + ownership
 */
router.delete('/:id/dietary/:dietId', authenticate, checkRecipeOwnership, (req, res) => {
    const recipeId = req.params.id;
    const dietId = req.params.dietId;

    database.run(sql.removeDietary, [recipeId, dietId], function (err) {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to remove dietary classification',
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Dietary classification not found on this recipe'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Dietary classification removed from recipe'
        });
    });
});

/**
 * Add goal to recipe
 * POST /api/recipes/:id/goals
 * Requires authentication + ownership
 */
router.post('/:id/goals', authenticate, checkRecipeOwnership, (req, res) => {
    const recipeId = req.params.id;
    const { goal_id } = req.body;

    if (!goal_id) {
        return res.status(400).json({
            success: false,
            message: 'goal_id is required'
        });
    }

    database.run(sql.addGoal, [recipeId, goal_id], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint') || err.message.includes('PRIMARY KEY')) {
                return res.status(409).json({
                    success: false,
                    message: 'This goal is already assigned to this recipe'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Failed to add goal',
                error: err.message
            });
        }

        res.status(201).json({
            success: true,
            message: 'Goal added to recipe'
        });
    });
});

/**
 * Remove goal from recipe
 * DELETE /api/recipes/:id/goals/:goalId
 * Requires authentication + ownership
 */
router.delete('/:id/goals/:goalId', authenticate, checkRecipeOwnership, (req, res) => {
    const recipeId = req.params.id;
    const goalId = req.params.goalId;

    database.run(sql.removeGoal, [recipeId, goalId], function (err) {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to remove goal',
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Goal not found on this recipe'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Goal removed from recipe'
        });
    });
});

/**
 * Add instruction to recipe
 * POST /api/recipes/:id/instructions
 * Requires authentication + ownership
 */
router.post('/:id/instructions', authenticate, checkRecipeOwnership, (req, res) => {
    const recipeId = req.params.id;
    const { step_number, description, ingredient_id } = req.body;

    if (!step_number || !description) {
        return res.status(400).json({
            success: false,
            message: 'step_number and description are required'
        });
    }

    database.run(sql.addInstruction, [recipeId, step_number, description, ingredient_id || null], function (err) {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to add instruction',
                error: err.message
            });
        }

        res.status(201).json({
            success: true,
            message: 'Instruction added to recipe',
            data: {
                instruction_id: this.lastID,
                step_number,
                description
            }
        });
    });
});

/**
 * Delete instruction from recipe
 * DELETE /api/recipes/:id/instructions/:stepId
 * Requires authentication + ownership
 */
router.delete('/:id/instructions/:stepId', authenticate, checkRecipeOwnership, (req, res) => {
    const recipeId = req.params.id;
    const stepId = req.params.stepId;

    database.run(sql.deleteInstruction, [stepId, recipeId], function (err) {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to delete instruction',
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Instruction not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Instruction deleted successfully'
        });
    });
});

/**
 * Update recipe title
 * PUT /api/recipes/:id/title
 * Requires authentication + ownership
 */
router.put('/:id/title', authenticate, checkRecipeOwnership, (req, res) => {
    const recipeId = req.params.id;
    const { title } = req.body;

    if (!title || title.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Title is required and must not be empty'
        });
    }

    database.run(sql.updateTitle, [title, recipeId], function (err) {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update recipe',
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Recipe title updated successfully'
        });
    });
});

/**
 * Update recipe instruction
 * PUT /api/recipes/:id/instructions/:stepId
 * Requires authentication + ownership
 */
router.put('/:id/instructions/:stepId', authenticate, checkRecipeOwnership, (req, res) => {
    const recipeId = req.params.id;
    const stepId = req.params.stepId;
    const { description } = req.body;

    if (!description) {
        return res.status(400).json({
            success: false,
            message: 'Description is required'
        });
    }

    database.run(sql.updateInstruction, [description, stepId, recipeId], function (err) {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update instruction',
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Instruction not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Instruction updated successfully'
        });
    });
});

/**
 * Delete recipe
 * DELETE /api/recipes/:id
 * Requires authentication + ownership
 */
router.delete('/:id', authenticate, checkRecipeOwnership, (req, res) => {
    const recipeId = req.params.id;

    database.run(sql.deleteRecipe, [recipeId], function (err) {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to delete recipe',
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Recipe deleted successfully'
        });
    });
});

/**
 * Remove ingredient from recipe
 * DELETE /api/recipes/:recipeId/ingredients/:ingredientId
 * Requires authentication + ownership
 */
router.delete('/:recipeId/ingredients/:ingredientId', authenticate, checkRecipeOwnership, (req, res) => {
    const recipeId = req.params.recipeId;
    const ingredientId = req.params.ingredientId;

    database.run(sql.removeIngredient, [recipeId, ingredientId], function (err) {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to remove ingredient',
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ingredient not found in recipe'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Ingredient removed from recipe'
        });
    });
});

// ============================================
// INTERACTION ROUTES (No ownership check required)
// Users can interact with ANY recipe
// ============================================

/**
 * Add rating to recipe
 * POST /api/recipes/:id/ratings
 * Requires authentication (user can rate ANY recipe)
 */
router.post('/:id/ratings', authenticate, (req, res) => {
    const recipeId = req.params.id;
    const userId = req.user.user_id;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
            success: false,
            message: 'Rating must be between 1 and 5'
        });
    }

    const ratingSql = `
        INSERT OR REPLACE INTO RecipeRatings (recipe_id, user_id, rating, review_text, created_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    database.run(ratingSql, [recipeId, userId, rating, review || null], function (err) {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to add rating',
                error: err.message
            });
        }

        res.status(201).json({
            success: true,
            message: 'Rating added successfully'
        });
    });
});

/**
 * Update own rating for a recipe
 * PUT /api/recipes/:id/ratings
 * Requires authentication (user can only update THEIR OWN rating)
 */
router.put('/:id/ratings', authenticate, (req, res) => {
    const recipeId = req.params.id;
    const userId = req.user.user_id;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
            success: false,
            message: 'Rating must be between 1 and 5'
        });
    }

    const updateRatingSql = `
        UPDATE RecipeRatings
        SET rating = ?, review_text = ?, updated_at = CURRENT_TIMESTAMP
        WHERE recipe_id = ? AND user_id = ?
    `;

    database.run(updateRatingSql, [rating, review || null, recipeId, userId], function (err) {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update rating',
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found. You must create a rating first.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Rating updated successfully'
        });
    });
});

/**
 * Delete own rating for a recipe
 * DELETE /api/recipes/:id/ratings
 * Requires authentication (user can only delete THEIR OWN rating)
 */
router.delete('/:id/ratings', authenticate, (req, res) => {
    const recipeId = req.params.id;
    const userId = req.user.user_id;

    const deleteRatingSql = 'DELETE FROM RecipeRatings WHERE recipe_id = ? AND user_id = ?';

    database.run(deleteRatingSql, [recipeId, userId], function (err) {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to delete rating',
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Rating deleted successfully'
        });
    });
});

/**
 * Get all ratings for a recipe
 * GET /api/recipes/:id/ratings
 * Public route (anyone can view ratings)
 */
router.get('/:id/ratings', (req, res) => {
    const recipeId = req.params.id;

    const getRatingsSql = `
        SELECT
            rr.rating,
            rr.review_text,
            rr.created_at,
            u.username
        FROM RecipeRatings rr
        JOIN Users u ON rr.user_id = u.user_id
        WHERE rr.recipe_id = ?
        ORDER BY rr.created_at DESC
    `;

    database.all(getRatingsSql, [recipeId], (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch ratings',
                error: err.message
            });
        }

        const avgRating = rows.length > 0
            ? rows.reduce((sum, row) => sum + row.rating, 0) / rows.length
            : 0;

        res.status(200).json({
            success: true,
            data: {
                average_rating: Math.round(avgRating * 10) / 10,
                total_ratings: rows.length,
                ratings: rows
            }
        });
    });
});

module.exports = router;
