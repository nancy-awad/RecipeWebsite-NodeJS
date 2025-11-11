# Routes recipes-v4.js - Updates Summary

## What Was Changed

### 1. Middleware Updates in auth.js

**Added clear comments and organization:**

```javascript
module.exports = {
    // Authentication middlewares
    authenticate: authenticateSession,       // ✓ Use this one
    authenticateSession,
    authenticateToken: authenticateSession,  // Deprecated
    optionalAuth,

    // Ownership middlewares
    checkRecipeOwnership,  // For recipe UPDATE/DELETE
    checkOwnership,        // Generic for any resource

    // Admin middleware (for future use)
    requireAdmin  // For admin-only routes
};
```

---

### 2. Simplified Recipe Ownership Routes

**BEFORE (v2/v4 old):** Code duplication in every route
```javascript
router.put('/:id/title', authenticate, (req, res) => {
    const userId = req.user.user_id;
    const isAdmin = req.user.is_admin;

    // Check ownership (15-20 lines of duplicate code)
    database.get('SELECT user_id FROM Recipes WHERE recipe_id = ?', [recipeId], (err, row) => {
        if (!row) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        if (!isAdmin && row.user_id !== userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // Finally update...
        database.run('UPDATE Recipes SET title = ? WHERE recipe_id = ?', ...);
    });
});
```

**AFTER (v4 new):** Clean and simple with middleware
```javascript
router.put('/:id/title', authenticate, checkRecipeOwnership, (req, res) => {
    const { title } = req.body;

    // Ownership already verified by middleware
    // Just validate and update
    database.run('UPDATE Recipes SET title = ? WHERE recipe_id = ?',
        [title, req.params.id], ...);
});
```

**Benefits:**
- ✓ 70% less code
- ✓ No duplication
- ✓ Easier to read
- ✓ Admin bypass built-in

---

### 3. Added Rating Routes (Interactions)

**New endpoints for users to rate ANY recipe:**

| Method | Endpoint | Auth | Ownership Check | Description |
|--------|----------|------|-----------------|-------------|
| GET | `/recipes/:id/ratings` | None | N/A | View all ratings for a recipe (public) |
| POST | `/recipes/:id/ratings` | ✓ | ✗ No | Add rating to ANY recipe |
| PUT | `/recipes/:id/ratings` | ✓ | ✗ No | Update YOUR OWN rating |
| DELETE | `/recipes/:id/ratings` | ✓ | ✗ No | Delete YOUR OWN rating |

**Key Points:**
- Users can rate **ANY** recipe (not just their own)
- No `checkRecipeOwnership` needed
- SQL WHERE clause ensures user can only modify their own rating

---

## Complete Route Structure

### Recipe Management (Ownership Required)

```javascript
// CREATE - Belongs to current user
POST   /recipes                → authenticate

// UPDATE - Owner OR Admin only
PUT    /recipes/:id/title      → authenticate + checkRecipeOwnership
PUT    /recipes/:id/allergy    → authenticate + checkRecipeOwnership
PUT    /recipes/:id/instructions/:stepId → authenticate + checkRecipeOwnership

// DELETE - Owner OR Admin only
DELETE /recipes/:id            → authenticate + checkRecipeOwnership
DELETE /recipes/:recipeId/ingredients/:ingredientId → authenticate + checkRecipeOwnership
```

### Recipe Interactions (No Ownership Check)

```javascript
// RATINGS - Any logged-in user can rate ANY recipe
POST   /recipes/:id/ratings    → authenticate (only)
PUT    /recipes/:id/ratings    → authenticate (only)
DELETE /recipes/:id/ratings    → authenticate (only)
GET    /recipes/:id/ratings    → Public (no auth)
```

---

## Examples

### Example 1: User Updates Their Recipe

```
User: John (user_id=1)
Recipe: "Pasta" (recipe_id=5, user_id=1)
Request: PUT /api/recipes/5/title { title: "Italian Pasta" }

Flow:
1. authenticate middleware:
   - Check session → John is logged in ✓
   - req.user = { user_id: 1, username: "john", is_admin: 0 }

2. checkRecipeOwnership middleware:
   - Query: SELECT user_id FROM Recipes WHERE recipe_id = 5
   - Result: { user_id: 1 }
   - Check: 1 === 1 ✓ (John owns the recipe)
   - Continue to handler

3. Handler:
   - Update recipe title
   - Return success

Result: ✓ Success - John can update his own recipe
```

### Example 2: User Tries to Update Someone Else's Recipe

```
User: Jane (user_id=2)
Recipe: "Pasta" (recipe_id=5, user_id=1, created by John)
Request: PUT /api/recipes/5/title { title: "Jane's Pasta" }

Flow:
1. authenticate middleware:
   - Check session → Jane is logged in ✓
   - req.user = { user_id: 2, username: "jane", is_admin: 0 }

2. checkRecipeOwnership middleware:
   - Query: SELECT user_id FROM Recipes WHERE recipe_id = 5
   - Result: { user_id: 1 }
   - Check: 2 === 1 ✗ (Jane doesn't own the recipe)
   - Return 403 Forbidden

Result: ✗ Forbidden - Jane cannot update John's recipe
```

### Example 3: User Rates Someone Else's Recipe

```
User: Jane (user_id=2)
Recipe: "Pasta" (recipe_id=5, user_id=1, created by John)
Request: POST /api/recipes/5/ratings { rating: 5, review: "Delicious!" }

Flow:
1. authenticate middleware:
   - Check session → Jane is logged in ✓
   - req.user = { user_id: 2, username: "jane" }

2. Handler (NO ownership check):
   - Validate: rating between 1-5 ✓
   - INSERT INTO RecipeRatings (recipe_id, user_id, rating, review)
     VALUES (5, 2, 5, "Delicious!")
   - Return success

Result: ✓ Success - Jane can rate John's recipe!
```

### Example 4: Admin Updates Any Recipe

```
User: Admin (user_id=3, is_admin=1)
Recipe: "Pasta" (recipe_id=5, user_id=1, created by John)
Request: PUT /api/recipes/5/title { title: "Admin Fix" }

Flow:
1. authenticate middleware:
   - Check session → Admin is logged in ✓
   - req.user = { user_id: 3, username: "admin", is_admin: 1 }

2. checkRecipeOwnership middleware:
   - Check: is_admin === 1 ✓
   - Admin bypass → Continue to handler

3. Handler:
   - Update recipe title
   - Return success

Result: ✓ Success - Admins can update any recipe
```

---

## Middleware Decision Tree

```
Is this route for VIEWING data?
├─ Yes → No authentication needed (public)
└─ No → Continue

Is this route CREATING a new resource?
├─ Yes → Use `authenticate` only
│        (resource will belong to current user)
└─ No → Continue

Is this route for INTERACTIONS (rating, favorite, comment)?
├─ Yes → Use `authenticate` only
│        (user can interact with ANY recipe)
│        (ownership checked via SQL: WHERE user_id = ?)
└─ No → Continue

Is this route MODIFYING/DELETING the original recipe?
└─ Yes → Use `authenticate` + `checkRecipeOwnership`
         (only owner OR admin can modify)
```

---

## Code Quality Improvements

### Before
- 20 lines per route (with ownership checks)
- Duplicate code in every route
- Hard to maintain
- Easy to forget checks

### After
- 8-10 lines per route
- DRY (Don't Repeat Yourself)
- Consistent behavior
- Impossible to forget checks (middleware enforces it)

---

## Routes Summary

| Endpoint | Method | Auth | Ownership | What It Does |
|----------|--------|------|-----------|--------------|
| `/recipes` | GET | No | - | View all recipes |
| `/recipes/:id` | GET | No | - | View single recipe |
| `/recipes` | POST | Yes | - | Create recipe (yours) |
| `/recipes/:id/title` | PUT | Yes | **Yes** | Update recipe title |
| `/recipes/:id/allergy` | PUT | Yes | **Yes** | Update recipe allergy |
| `/recipes/:id/instructions/:stepId` | PUT | Yes | **Yes** | Update instruction |
| `/recipes/:id` | DELETE | Yes | **Yes** | Delete recipe |
| `/recipes/:recipeId/ingredients/:ingredientId` | DELETE | Yes | **Yes** | Remove ingredient |
| `/recipes/:id/ratings` | GET | No | - | View ratings |
| `/recipes/:id/ratings` | POST | Yes | No | Rate any recipe |
| `/recipes/:id/ratings` | PUT | Yes | No | Update your rating |
| `/recipes/:id/ratings` | DELETE | Yes | No | Delete your rating |

---

**Last Updated**: 2025-11-05
