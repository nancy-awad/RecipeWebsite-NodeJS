# Ownership and Permissions Guide

## Business Logic

This application follows a **personal recipe management** model:

1. **Each user manages their own recipes**
   - Users can create recipes
   - Users can ONLY modify/delete their own recipes
   - Admins can modify/delete any recipe

2. **All users can interact with any recipe**
   - Any authenticated user can rate any recipe
   - Any authenticated user can add any recipe to favorites
   - Any authenticated user can comment on any recipe

3. **Users manage their own interactions**
   - Users can only delete their own comments
   - Users can update their own ratings
   - Users can remove recipes from their own favorites

---

## Permissions Matrix

### Recipes Endpoints

| HTTP Method | Endpoint | Action | Who Can Access | Middleware Chain |
|-------------|----------|--------|----------------|------------------|
| GET | `/api/recipes` | View all recipes | Everyone | None (public) |
| GET | `/api/recipes/:id` | View single recipe | Everyone | None (public) |
| POST | `/api/recipes` | Create recipe | Logged-in users | `authenticate` |
| PUT | `/api/recipes/:id/title` | Update recipe | Owner OR Admin | `authenticate`, `checkRecipeOwnership` |
| PUT | `/api/recipes/:id/allergy` | Update recipe | Owner OR Admin | `authenticate`, `checkRecipeOwnership` |
| DELETE | `/api/recipes/:id` | Delete recipe | Owner OR Admin | `authenticate`, `checkRecipeOwnership` |

**Key Point**: Ownership check is REQUIRED for modifying or deleting recipes.

---

### Ratings Endpoints

| HTTP Method | Endpoint | Action | Who Can Access | Middleware Chain |
|-------------|----------|--------|----------------|------------------|
| GET | `/api/recipes/:id/ratings` | View ratings | Everyone | None (public) |
| POST | `/api/recipes/:id/ratings` | Rate recipe | Logged-in users | `authenticate` |
| PUT | `/api/recipes/:id/ratings` | Update own rating | Logged-in users | `authenticate` |
| DELETE | `/api/recipes/:id/ratings` | Delete own rating | Logged-in users | `authenticate` |

**Key Point**: No ownership check needed - users interact with ANY recipe, but can only update/delete their OWN rating.

**Example Logic**:
```javascript
// POST /api/recipes/:id/ratings
router.post('/:id/ratings', authenticate, (req, res) => {
    const recipeId = req.params.id;
    const userId = req.user.user_id;  // From session
    const { rating, review } = req.body;

    // Insert with the CURRENT user's ID
    // One user can only have one rating per recipe (composite PK)
    database.run(
        'INSERT OR REPLACE INTO RecipeRatings (recipe_id, user_id, rating, review) VALUES (?, ?, ?, ?)',
        [recipeId, userId, rating, review],
        (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error' });
            }
            res.status(201).json({ message: 'Rating added' });
        }
    );
});
```

---

### Favorites Endpoints

| HTTP Method | Endpoint | Action | Who Can Access | Middleware Chain |
|-------------|----------|--------|----------------|------------------|
| GET | `/api/users/favorites` | View my favorites | Logged-in users | `authenticate` |
| POST | `/api/users/favorites/:recipeId` | Add to favorites | Logged-in users | `authenticate` |
| DELETE | `/api/users/favorites/:recipeId` | Remove from favorites | Logged-in users | `authenticate` |

**Key Point**: No ownership check needed - users can favorite ANY recipe. The favorite belongs to the current user.

**Example Logic**:
```javascript
// POST /api/users/favorites/:recipeId
router.post('/favorites/:recipeId', authenticate, (req, res) => {
    const recipeId = req.params.recipeId;
    const userId = req.user.user_id;  // From session

    // Add favorite for CURRENT user
    database.run(
        'INSERT INTO UserFavorites (user_id, recipe_id) VALUES (?, ?)',
        [userId, recipeId],
        (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error' });
            }
            res.status(201).json({ message: 'Added to favorites' });
        }
    );
});
```

---

### Comments Endpoints (If Implemented)

| HTTP Method | Endpoint | Action | Who Can Access | Middleware Chain |
|-------------|----------|--------|----------------|------------------|
| GET | `/api/recipes/:id/comments` | View comments | Everyone | None (public) |
| POST | `/api/recipes/:id/comments` | Add comment | Logged-in users | `authenticate` |
| PUT | `/api/comments/:commentId` | Update comment | Comment owner OR Admin | `authenticate`, `checkCommentOwnership` |
| DELETE | `/api/comments/:commentId` | Delete comment | Comment owner OR Admin | `authenticate`, `checkCommentOwnership` |

**Key Point**: Users can comment on ANY recipe, but can only edit/delete their OWN comments.

---

## When to Use `checkOwnership`

### ✓ Use `checkOwnership` when:

1. **Modifying the original resource created by user**
   ```javascript
   // User can only update THEIR OWN recipe
   router.put('/recipes/:id', authenticate, checkRecipeOwnership, updateRecipe);
   ```

2. **Deleting the original resource**
   ```javascript
   // User can only delete THEIR OWN recipe
   router.delete('/recipes/:id', authenticate, checkRecipeOwnership, deleteRecipe);
   ```

3. **Modifying someone else's content would be problematic**
   ```javascript
   // User should not be able to modify another user's comment
   router.put('/comments/:id', authenticate, checkCommentOwnership, updateComment);
   ```

### ✗ Don't use `checkOwnership` when:

1. **Creating a new interaction with someone else's resource**
   ```javascript
   // User CAN rate someone else's recipe
   router.post('/recipes/:id/ratings', authenticate, createRating);
   ```

2. **Managing your own list/collection**
   ```javascript
   // User is adding to THEIR favorites, not modifying the recipe
   router.post('/users/favorites/:recipeId', authenticate, addFavorite);
   ```

3. **Public read operations**
   ```javascript
   // Anyone can view recipes
   router.get('/recipes', getAllRecipes);
   ```

---

## Middleware Flow Examples

### Example 1: Update Recipe Title (Ownership Required)

```javascript
router.put('/recipes/:id/title', authenticate, checkRecipeOwnership, (req, res) => {
    // Flow:
    // 1. authenticate: Check if user is logged in
    //    - req.user = { user_id: 5, username: "john", is_admin: 0 }
    //
    // 2. checkRecipeOwnership: Check if user owns recipe
    //    - Query: SELECT user_id FROM Recipes WHERE recipe_id = 10
    //    - Result: { user_id: 5 }
    //    - Compare: 5 === 5 ✓ (OR user is admin)
    //    - Continue to handler
    //
    // 3. Handler: Update recipe (ownership guaranteed)
    const { title } = req.body;
    database.run('UPDATE Recipes SET title = ? WHERE recipe_id = ?',
        [title, req.params.id], ...);
});
```

### Example 2: Rate Recipe (No Ownership Check)

```javascript
router.post('/recipes/:id/ratings', authenticate, (req, res) => {
    // Flow:
    // 1. authenticate: Check if user is logged in
    //    - req.user = { user_id: 5, username: "john" }
    //
    // 2. Handler: Add rating (no ownership check needed)
    //    - User 5 can rate Recipe 10 (created by User 3)
    //    - The rating belongs to User 5, not modifying Recipe 10 content
    const { rating, review } = req.body;
    const userId = req.user.user_id;  // User 5
    const recipeId = req.params.id;   // Recipe 10 (owned by User 3)

    database.run(
        'INSERT INTO RecipeRatings (recipe_id, user_id, rating, review) VALUES (?, ?, ?, ?)',
        [recipeId, userId, rating, review], ...);
});
```

### Example 3: Add to Favorites (No Ownership Check)

```javascript
router.post('/users/favorites/:recipeId', authenticate, (req, res) => {
    // Flow:
    // 1. authenticate: Check if user is logged in
    //    - req.user = { user_id: 5, username: "john" }
    //
    // 2. Handler: Add to MY favorites (no ownership check needed)
    //    - User 5 adds Recipe 10 to THEIR favorites
    //    - Not modifying Recipe 10, just creating a link in UserFavorites
    const userId = req.user.user_id;      // User 5
    const recipeId = req.params.recipeId; // Recipe 10

    database.run(
        'INSERT INTO UserFavorites (user_id, recipe_id) VALUES (?, ?)',
        [userId, recipeId], ...);
});
```

---

## Database Schema Implications

### Recipes Table (Has Ownership)
```sql
CREATE TABLE Recipes (
    recipe_id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    user_id INTEGER NOT NULL,  -- Owner of the recipe
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
```
**Ownership Check Required**: When modifying/deleting

---

### UserFavorites Table (Junction Table)
```sql
CREATE TABLE UserFavorites (
    user_id INTEGER NOT NULL,       -- Who favorited
    recipe_id INTEGER NOT NULL,     -- What recipe
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, recipe_id)
);
```
**No Ownership Check**: User creates their own favorite entry

---

### RecipeRatings Table (Has Implicit Ownership)
```sql
CREATE TABLE RecipeRatings (
    user_id INTEGER NOT NULL,       -- Who rated
    recipe_id INTEGER NOT NULL,     -- What recipe
    rating INTEGER NOT NULL,
    review TEXT,
    PRIMARY KEY (user_id, recipe_id)
);
```
**Logic**:
- Creating rating: No ownership check (anyone can rate any recipe)
- Updating rating: Check that `rating.user_id === req.user.user_id`
- Deleting rating: Check that `rating.user_id === req.user.user_id`

---

## Complete Routes Example

### routes/recipes.js (With Correct Permissions)

```javascript
const express = require('express');
const router = express.Router();
const { authenticate, checkRecipeOwnership } = require('../middleware/auth');
const recipeController = require('../controllers/recipeController');

// ============================================
// PUBLIC ROUTES (No authentication)
// ============================================

router.get('/', recipeController.getAllRecipes);
router.get('/:id', recipeController.getRecipeById);

// ============================================
// PROTECTED ROUTES (Authentication only)
// ============================================

// Create recipe (belongs to current user)
router.post('/', authenticate, recipeController.createRecipe);

// ============================================
// OWNERSHIP ROUTES (Authentication + Ownership)
// ============================================

// Update/delete OWN recipe only
router.put('/:id/title', authenticate, checkRecipeOwnership, recipeController.updateRecipeTitle);
router.put('/:id/allergy', authenticate, checkRecipeOwnership, recipeController.updateRecipeAllergy);
router.delete('/:id', authenticate, checkRecipeOwnership, recipeController.deleteRecipe);

// ============================================
// INTERACTION ROUTES (No ownership check)
// ============================================

// Any logged-in user can rate/favorite ANY recipe
router.post('/:id/ratings', authenticate, recipeController.addRating);
router.put('/:id/ratings', authenticate, recipeController.updateOwnRating);
router.delete('/:id/ratings', authenticate, recipeController.deleteOwnRating);

module.exports = router;
```

### routes/users.js (Favorites Management)

```javascript
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const userController = require('../controllers/userController');

// ============================================
// FAVORITES (User manages THEIR favorites)
// ============================================

// Get MY favorites
router.get('/favorites', authenticate, userController.getFavorites);

// Add ANY recipe to MY favorites
router.post('/favorites/:recipeId', authenticate, userController.addFavorite);

// Remove from MY favorites
router.delete('/favorites/:recipeId', authenticate, userController.removeFavorite);

module.exports = router;
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Checking ownership when adding to favorites

```javascript
// WRONG - Don't check if user owns the RECIPE
router.post('/favorites/:recipeId', authenticate, checkRecipeOwnership, addFavorite);
// This would prevent users from favoriting OTHER people's recipes!
```

```javascript
// CORRECT - Only check authentication
router.post('/favorites/:recipeId', authenticate, addFavorite);
// Users can favorite ANY recipe
```

---

### ❌ Mistake 2: Not checking ownership when updating recipe

```javascript
// WRONG - Any logged-in user can modify any recipe
router.put('/recipes/:id', authenticate, updateRecipe);
```

```javascript
// CORRECT - Check ownership
router.put('/recipes/:id', authenticate, checkRecipeOwnership, updateRecipe);
// Only owner (or admin) can modify
```

---

### ❌ Mistake 3: Using recipe owner for rating ownership

```javascript
// WRONG - Checking if user owns the RECIPE
router.delete('/:recipeId/ratings', authenticate, checkRecipeOwnership, deleteRating);
```

```javascript
// CORRECT - Check in handler if user owns the RATING
router.delete('/:recipeId/ratings', authenticate, (req, res) => {
    const userId = req.user.user_id;
    const recipeId = req.params.recipeId;

    // Delete only if this user created the rating
    database.run(
        'DELETE FROM RecipeRatings WHERE recipe_id = ? AND user_id = ?',
        [recipeId, userId],
        function(err) {
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Rating not found or not yours' });
            }
            res.json({ message: 'Rating deleted' });
        }
    );
});
```

---

## Summary

### Ownership Check Required
- ✓ Modify recipe content (title, description, ingredients, etc.)
- ✓ Delete recipe
- ✓ Update/delete own comments
- ✓ Admin actions

### Ownership Check NOT Required
- ✓ View recipes (public)
- ✓ Create new recipe (becomes yours automatically)
- ✓ Rate any recipe (creates YOUR rating)
- ✓ Add to favorites (adds to YOUR favorites)
- ✓ Comment on any recipe (creates YOUR comment)

### The Pattern
```
Modifying ORIGINAL CONTENT → Check ownership
Creating NEW INTERACTION → No ownership check (belongs to current user)
```

---

**Last Updated**: 2025-11-05
