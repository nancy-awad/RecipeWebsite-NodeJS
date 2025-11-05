# Authentication & Authorization Guide

## Table of Contents
1. [Authentication vs Authorization](#authentication-vs-authorization)
2. [Middleware Chains Explained](#middleware-chains-explained)
3. [Where to Extract User Information](#where-to-extract-user-information)
4. [Ownership and Permissions](#ownership-and-permissions)
5. [Complete Route Examples](#complete-route-examples)
6. [Best Practices](#best-practices)

---

## Authentication vs Authorization

### Authentication (Who are you?)
**Definition**: Verifying the identity of a user.
**Question**: "Are you who you say you are?"
**Implementation**: JWT token verification
**Middleware**: `authenticateToken`

**Example**:
```javascript
// User sends request with JWT token
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Middleware verifies token and extracts user info
req.user = { user_id: 1, username: "john_doe", email: "john@example.com" }
```

### Authorization (What can you do?)
**Definition**: Verifying if a user has permission to perform an action.
**Question**: "Are you allowed to do this?"
**Implementation**: Ownership checks, role-based access
**Location**: Controller or specific middleware

**Example**:
```javascript
// User wants to delete recipe #5
// Check: Does recipe #5 belong to this user?
if (recipe.user_id !== req.user.user_id) {
    return res.status(403).json({ message: 'Forbidden' });
}
```

---

## Middleware Chains Explained

### What is a Middleware Chain?

Middleware functions execute **in order** from left to right:

```javascript
router.post('/', middleware1, middleware2, middleware3, controllerFunction);
//              ^step 1      ^step 2      ^step 3      ^final step
```

Each middleware can:
1. **Read/modify** the request (`req`)
2. **Read/modify** the response (`res`)
3. **Call `next()`** to continue to the next middleware
4. **Stop the chain** by sending a response

### Example: Creating a Cuisine

```javascript
// routes/cuisines.js
router.post('/', authenticateToken, validateCuisine, cuisineController.createCuisine);
```

**Execution Flow**:

```
1. authenticateToken
   - Checks if JWT token exists
   - Verifies token is valid
   - Extracts user info: req.user = { user_id, username, email }
   - Calls next()
   ↓
2. validateCuisine
   - Checks if req.body.name exists
   - Checks if name is a valid string
   - If invalid: sends 400 error and STOPS
   - If valid: calls next()
   ↓
3. cuisineController.createCuisine
   - Uses req.user.user_id (from step 1)
   - Uses req.body.name (validated in step 2)
   - Saves to database
   - Sends response
```

---

## Where to Extract User Information

### Option 1: In Middleware (RECOMMENDED)

**File**: `middleware/auth.js`

```javascript
const authenticateToken = (req, res, next) => {
    // 1. Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    try {
        // 2. Verify and decode token
        const decoded = jwt.verify(token, JWT_SECRET);

        // 3. Attach user info to request object
        req.user = decoded; // { user_id, username, email }

        // 4. Continue to next middleware/controller
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};
```

### Option 2: In Controller (NOT RECOMMENDED)

```javascript
// DON'T DO THIS - Repeating code in every controller
exports.createCuisine = async (req, res) => {
    // Extracting token in controller = BAD
    const token = req.headers['authorization']?.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user_id = decoded.user_id;
    // ... rest of logic
};
```

**Why Option 1 is Better**:
- Don't Repeat Yourself (DRY principle)
- Centralized authentication logic
- Reusable across all routes
- Easier to maintain and test

---

## Ownership and Permissions

### When to Check Ownership

Check ownership for these operations:
- **UPDATE** - Only owner can modify their resource
- **DELETE** - Only owner can delete their resource
- **READ** (sometimes) - Private resources only visible to owner

### Where to Check Ownership

**Option A: In Controller (RECOMMENDED for students)**

```javascript
// controllers/recipeController.js
exports.deleteRecipe = async (req, res, next) => {
    try {
        const recipeId = req.params.id;
        const userId = req.user.user_id; // From authenticateToken middleware

        // 1. Get the recipe from database
        const recipe = await Recipe.findById(recipeId);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        // 2. Check if user owns this recipe
        if (recipe.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You can only delete your own recipes'
            });
        }

        // 3. User owns it, proceed with deletion
        await Recipe.delete(recipeId);

        res.status(200).json({
            success: true,
            message: 'Recipe deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
```

**Option B: In Dedicated Middleware (Advanced)**

```javascript
// middleware/auth.js
const checkRecipeOwnership = async (req, res, next) => {
    try {
        const recipeId = req.params.id;
        const userId = req.user.user_id;

        const recipe = await Recipe.findById(recipeId);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        if (recipe.user_id !== userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        req.recipe = recipe; // Attach for use in controller
        next();
    } catch (error) {
        next(error);
    }
};

// routes/recipes.js
router.delete('/:id', authenticateToken, checkRecipeOwnership, recipeController.deleteRecipe);
```

**For Students**: Use Option A (check in controller) - it's more explicit and easier to understand.

---

## Complete Route Examples

### Recipe Routes (with Authentication & Authorization)

```javascript
// routes/recipes.js
const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { validateRecipe, validateRecipeUpdate } = require('../middleware/validation');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

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

// Only recipe owner can update their recipe
router.put('/:id/title', authenticateToken, validateRecipeUpdate, recipeController.updateRecipeTitle);
router.put('/:id/allergy', authenticateToken, recipeController.updateRecipeAllergy);
router.put('/:id/instructions/:stepId', authenticateToken, recipeController.updateRecipeInstruction);

// Only recipe owner can delete their recipe
router.delete('/:id', authenticateToken, recipeController.deleteRecipe);
router.delete('/:id/ingredients/:ingredientId', authenticateToken, recipeController.removeIngredientFromRecipe);

module.exports = router;
```

### Cuisine Routes (with Authentication)

```javascript
// routes/cuisines.js
const express = require('express');
const router = express.Router();
const cuisineController = require('../controllers/cuisineController');
const { validateCuisine } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// ============================================
// PUBLIC ROUTES
// ============================================
router.get('/', cuisineController.getAllCuisines);
router.get('/:id', cuisineController.getCuisineById);

// ============================================
// PROTECTED ROUTES (Admin or authenticated users)
// ============================================
router.post('/', authenticateToken, validateCuisine, cuisineController.createCuisine);
router.put('/:id', authenticateToken, validateCuisine, cuisineController.updateCuisine);
router.delete('/:id', authenticateToken, cuisineController.deleteCuisine);

module.exports = router;
```

### Ingredient Routes (with Authentication)

```javascript
// routes/ingredients.js
const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');
const { validateIngredient } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// ============================================
// PUBLIC ROUTES
// ============================================
router.get('/', ingredientController.getAllIngredients);
router.get('/:id', ingredientController.getIngredientById);

// ============================================
// PROTECTED ROUTES
// ============================================
router.post('/', authenticateToken, validateIngredient, ingredientController.createIngredient);
router.put('/:id', authenticateToken, validateIngredient, ingredientController.updateIngredient);
router.delete('/:id', authenticateToken, ingredientController.deleteIngredient);

module.exports = router;
```

---

## Controller Implementation with Ownership Check

### Example: Delete Recipe (Full Implementation)

```javascript
// controllers/recipeController.js
const Recipe = require('../models/Recipe');

/**
 * Delete a recipe (only owner can delete)
 * DELETE /api/recipes/:id
 * Authentication: Required
 * Authorization: Owner only
 */
exports.deleteRecipe = async (req, res, next) => {
    try {
        const recipeId = parseInt(req.params.id);
        const userId = req.user.user_id; // From authenticateToken middleware

        // Step 1: Check if recipe exists
        const recipe = await Recipe.findById(recipeId);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        // Step 2: Check ownership (Authorization)
        if (recipe.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You can only delete your own recipes'
            });
        }

        // Step 3: User owns the recipe, delete it
        await Recipe.delete(recipeId);

        res.status(200).json({
            success: true,
            message: 'Recipe deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};
```

### Example: Create Cuisine (Extract User)

```javascript
// controllers/cuisineController.js
const Cuisine = require('../models/Cuisine');

/**
 * Create a new cuisine
 * POST /api/cuisines
 * Authentication: Required
 */
exports.createCuisine = async (req, res, next) => {
    try {
        const { name } = req.body; // From validateCuisine middleware
        const userId = req.user.user_id; // From authenticateToken middleware

        // Create cuisine with user_id
        const cuisine = await Cuisine.create({
            name,
            created_by: userId // Track who created it
        });

        res.status(201).json({
            success: true,
            message: 'Cuisine created successfully',
            data: cuisine
        });

    } catch (error) {
        next(error);
    }
};
```

---

## Best Practices

### 1. Middleware Order Matters

**Correct Order**:
```javascript
router.post('/', authenticateToken, validateData, controller);
//              ^1. Auth first    ^2. Then validate  ^3. Finally business logic
```

**Wrong Order**:
```javascript
router.post('/', validateData, authenticateToken, controller);
//              ^BAD: Validates before checking if user is logged in
```

### 2. Use Meaningful HTTP Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | No token or invalid token |
| 403 | Forbidden | Valid token but no permission |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Database or server error |

### 3. Always Check Ownership for Modify/Delete

```javascript
// GOOD - Checks ownership
exports.updateRecipe = async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);
    if (recipe.user_id !== req.user.user_id) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    // ... update recipe
};

// BAD - Anyone can update any recipe
exports.updateRecipe = async (req, res) => {
    await Recipe.update(req.params.id, req.body);
    // ... no ownership check
};
```

### 4. Extract User in Middleware, Use in Controller

```javascript
// GOOD - Separation of concerns
// Middleware extracts
const authenticateToken = (req, res, next) => {
    req.user = jwt.verify(token, SECRET);
    next();
};

// Controller uses
exports.createRecipe = async (req, res) => {
    const userId = req.user.user_id;
    // ... create recipe
};

// BAD - Mixing concerns
exports.createRecipe = async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    const decoded = jwt.verify(token, SECRET);
    const userId = decoded.user_id;
    // ... mixing auth and business logic
};
```

### 5. Provide Clear Error Messages

```javascript
// GOOD - Clear error messages
if (!recipe) {
    return res.status(404).json({
        success: false,
        message: 'Recipe not found'
    });
}

if (recipe.user_id !== req.user.user_id) {
    return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only modify your own recipes'
    });
}

// BAD - Vague error
res.status(403).json({ message: 'Error' });
```

---

## Summary: Decision Tree

### Should this route require authentication?

```
Is the action sensitive? (create/update/delete)
├─ YES → Add authenticateToken middleware
│         └─ Does it modify/delete a resource?
│             ├─ YES → Check ownership in controller
│             └─ NO → No ownership check needed
│
└─ NO → Public route (no middleware)
```

### Where to extract user information?

```
Need user info?
├─ For authentication → Use authenticateToken middleware
│                       Result: req.user = { user_id, username, email }
│
└─ For business logic → Use req.user.user_id in controller
                        (Already extracted by middleware)
```

### Where to check permissions?

```
Need to verify ownership?
├─ Simple check → In controller (RECOMMENDED for students)
│                 Example: if (recipe.user_id !== req.user.user_id)
│
└─ Reusable check → In dedicated middleware (ADVANCED)
                    Example: checkRecipeOwnership middleware
```

---

## Quick Reference

### Middleware Chain Template

```javascript
router.METHOD('/path',
    authenticateToken,    // 1. Verify user identity (if needed)
    validateData,         // 2. Validate request data (if needed)
    controller.method     // 3. Execute business logic
);
```

### Controller Template with Auth & Authorization

```javascript
exports.methodName = async (req, res, next) => {
    try {
        // 1. Extract data
        const resourceId = req.params.id;
        const userId = req.user.user_id; // From authenticateToken

        // 2. Get resource
        const resource = await Model.findById(resourceId);
        if (!resource) {
            return res.status(404).json({ message: 'Not found' });
        }

        // 3. Check ownership (for update/delete)
        if (resource.user_id !== userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // 4. Perform operation
        const result = await Model.method(resourceId, data);

        // 5. Send response
        res.status(200).json({ success: true, data: result });

    } catch (error) {
        next(error);
    }
};
```

---

**Last Updated**: 2025-11-05
