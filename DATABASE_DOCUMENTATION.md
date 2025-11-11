# Database Documentation

## Overview

This document describes the complete database schema for the Recipe Website project using SQLite.

**Database Type**: SQLite3
**Location**: `database/recipe_website.db`
**Total Tables**: 11

---

## Table Relationships Diagram

```
Users (1) ──────┬──────> (N) Recipes
                │
                ├──────> (N) UserFavorites
                │
                └──────> (N) RecipeRatings

Recipes (1) ────┬──────> (N) RecipeIngredients
                │
                ├──────> (N) RecipeInstructions
                │
                ├──────> (N) UserFavorites
                │
                ├──────> (N) RecipeRatings
                │
                ├──────> (1) Cuisines
                │
                ├──────> (1) Goals
                │
                ├──────> (1) DietaryInformation
                │
                └──────> (1) AllergiesInformation

Ingredients (1) ─────> (N) RecipeIngredients
```

---

## Core Tables

### 1. Users

**Purpose**: Store user account information with authentication and role management.

**Schema**:
```sql
CREATE TABLE IF NOT EXISTS Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Fields**:
| Field | Type | Null | Default | Description |
|-------|------|------|---------|-------------|
| user_id | INTEGER | No | AUTO | Primary key |
| username | TEXT | No | - | Unique username |
| email | TEXT | No | - | Unique email address |
| password_hash | TEXT | No | - | bcrypt hashed password (10 salt rounds) |
| first_name | TEXT | Yes | NULL | User's first name |
| last_name | TEXT | Yes | NULL | User's last name |
| **is_admin** | INTEGER | No | **0** | **Admin flag: 0 = regular user, 1 = admin** |
| created_at | DATETIME | No | CURRENT_TIMESTAMP | Account creation date |
| updated_at | DATETIME | No | CURRENT_TIMESTAMP | Last update date |

**Constraints**:
- `username` must be unique
- `email` must be unique
- `password_hash` is never null (always hashed with bcrypt)

**Indexes**:
```sql
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_username ON Users(username);
```

---

### 2. Recipes

**Purpose**: Store recipe information with user ownership.

**Schema**:
```sql
CREATE TABLE IF NOT EXISTS Recipes (
    recipe_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    cuisine_id INTEGER,
    goal_id INTEGER,
    DietaryInformation_id INTEGER,
    AllergiesInformation_id INTEGER,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cuisine_id) REFERENCES Cuisines(cuisine_id) ON DELETE SET NULL,
    FOREIGN KEY (goal_id) REFERENCES Goals(goal_id) ON DELETE SET NULL,
    FOREIGN KEY (DietaryInformation_id) REFERENCES DietaryInformation(diet_id) ON DELETE SET NULL,
    FOREIGN KEY (AllergiesInformation_id) REFERENCES AllergiesInformation(allergy_id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);
```

**Fields**:
| Field | Type | Null | Default | Description |
|-------|------|------|---------|-------------|
| recipe_id | INTEGER | No | AUTO | Primary key |
| title | TEXT | No | - | Recipe name |
| description | TEXT | Yes | NULL | Recipe description |
| image_url | TEXT | Yes | NULL | URL to recipe image |
| cuisine_id | INTEGER | Yes | NULL | FK to Cuisines |
| goal_id | INTEGER | Yes | NULL | FK to Goals |
| DietaryInformation_id | INTEGER | Yes | NULL | FK to DietaryInformation |
| AllergiesInformation_id | INTEGER | Yes | NULL | FK to AllergiesInformation |
| **user_id** | INTEGER | **No** | - | **FK to Users (owner)** |
| created_at | DATETIME | No | CURRENT_TIMESTAMP | Creation date |
| updated_at | DATETIME | No | CURRENT_TIMESTAMP | Last update date |

**Foreign Key Behavior**:
- If user is deleted → CASCADE delete all their recipes
- If cuisine/goal/diet/allergy is deleted → SET NULL (recipe remains)

**Indexes**:
```sql
CREATE INDEX idx_recipes_user ON Recipes(user_id);
CREATE INDEX idx_recipes_cuisine ON Recipes(cuisine_id);
```

---

### 3. Ingredients

**Schema**:
```sql
CREATE TABLE IF NOT EXISTS Ingredients (
    ingredient_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    unit TEXT
);
```

**Fields**:
| Field | Type | Null | Default | Description |
|-------|------|------|---------|-------------|
| ingredient_id | INTEGER | No | AUTO | Primary key |
| name | TEXT | No | - | Ingredient name (unique) |
| unit | TEXT | Yes | NULL | Measurement unit (g, ml, cup, etc.) |

---

### 4. RecipeIngredients (Junction Table)

**Purpose**: Many-to-many relationship between Recipes and Ingredients.

**Schema**:
```sql
CREATE TABLE IF NOT EXISTS RecipeIngredients (
    recipe_id INTEGER,
    ingredient_id INTEGER,
    quantity REAL NOT NULL,
    PRIMARY KEY (recipe_id, ingredient_id),
    FOREIGN KEY (recipe_id) REFERENCES Recipes(recipe_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients(ingredient_id) ON DELETE CASCADE
);
```

**Fields**:
| Field | Type | Null | Default | Description |
|-------|------|------|---------|-------------|
| recipe_id | INTEGER | No | - | FK to Recipes |
| ingredient_id | INTEGER | No | - | FK to Ingredients |
| quantity | REAL | No | - | Amount needed |

**Composite Primary Key**: (recipe_id, ingredient_id)

---

### 5. RecipeInstructions

**Schema**:
```sql
CREATE TABLE IF NOT EXISTS RecipeInstructions (
    instruction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    step_number INTEGER NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES Recipes(recipe_id) ON DELETE CASCADE
);
```

**Fields**:
| Field | Type | Null | Default | Description |
|-------|------|------|---------|-------------|
| instruction_id | INTEGER | No | AUTO | Primary key |
| recipe_id | INTEGER | No | - | FK to Recipes |
| step_number | INTEGER | No | - | Order of step (1, 2, 3...) |
| description | TEXT | No | - | Instruction text |

---

## User-Specific Tables

### 6. UserFavorites

**Purpose**: Track which recipes users have favorited.

**Schema**:
```sql
CREATE TABLE IF NOT EXISTS UserFavorites (
    user_id INTEGER NOT NULL,
    recipe_id INTEGER NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, recipe_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES Recipes(recipe_id) ON DELETE CASCADE
);
```

**Fields**:
| Field | Type | Null | Default | Description |
|-------|------|------|---------|-------------|
| user_id | INTEGER | No | - | FK to Users |
| recipe_id | INTEGER | No | - | FK to Recipes |
| added_at | DATETIME | No | CURRENT_TIMESTAMP | When favorited |

**Composite Primary Key**: (user_id, recipe_id)

---

### 7. RecipeRatings

**Purpose**: Store user ratings for recipes (1-5 stars).

**Schema**:
```sql
CREATE TABLE IF NOT EXISTS RecipeRatings (
    user_id INTEGER NOT NULL,
    recipe_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, recipe_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES Recipes(recipe_id) ON DELETE CASCADE
);
```

**Fields**:
| Field | Type | Null | Default | Description |
|-------|------|------|---------|-------------|
| user_id | INTEGER | No | - | FK to Users |
| recipe_id | INTEGER | No | - | FK to Recipes |
| rating | INTEGER | No | - | Rating value (1-5) |
| review | TEXT | Yes | NULL | Optional review text |
| created_at | DATETIME | No | CURRENT_TIMESTAMP | When rated |

**Constraints**:
- `rating` must be between 1 and 5
- User can only rate a recipe once (composite PK)

---

## Reference/Lookup Tables

### 8. Cuisines

```sql
CREATE TABLE IF NOT EXISTS Cuisines (
    cuisine_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);
```

**Examples**: Italian, Chinese, Mexican, French, Indian, Japanese

---

### 9. Goals

```sql
CREATE TABLE IF NOT EXISTS Goals (
    goal_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);
```

**Examples**: Weight Loss, Muscle Gain, Heart Health, Energy Boost

---

### 10. DietaryInformation

```sql
CREATE TABLE IF NOT EXISTS DietaryInformation (
    diet_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);
```

**Examples**: Vegetarian, Vegan, Keto, Paleo, Gluten-Free

---

### 11. AllergiesInformation

```sql
CREATE TABLE IF NOT EXISTS AllergiesInformation (
    allergy_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);
```

**Examples**: Nuts, Dairy, Eggs, Shellfish, Soy, Gluten

---

## Role-Based Access Control (RBAC)

### The `is_admin` Field

**Location**: `Users` table
**Type**: INTEGER (0 or 1)
**Default**: 0 (regular user)

**Values**:
- `0` = Regular user (default)
- `1` = Administrator

### How It Works

#### 1. Setting Admin Status

**Manually in database**:
```sql
UPDATE Users SET is_admin = 1 WHERE email = 'admin@example.com';
```

**During registration** (first user becomes admin):
```javascript
const userCount = await User.count();
const is_admin = (userCount === 0) ? 1 : 0;

await User.create({
    username,
    email,
    password,
    is_admin
});
```

#### 2. Checking Admin Status in Middleware

**File**: `middleware/auth.js`

```javascript
const requireAdmin = (req, res, next) => {
    // Must be authenticated first
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. Please login to continue.'
        });
    }

    // Check if user is admin
    if (!req.user.is_admin) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden. Admin access required.'
        });
    }

    next();
};

module.exports = {
    authenticateSession,
    authenticateToken: authenticateSession,
    optionalAuth,
    checkOwnership,
    requireAdmin  // New middleware
};
```

#### 3. Including in Session

**File**: `controllers/userController.js`

```javascript
// In login function
req.session.user = {
    user_id: user.user_id,
    username: user.username,
    email: user.email,
    is_admin: user.is_admin  // Include admin status
};
```

#### 4. Using in Routes

**Admin-only routes**:
```javascript
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Only admins can delete any recipe (bypass ownership check)
router.delete('/:id/admin-delete', requireAdmin, recipeController.adminDeleteRecipe);

// Only admins can view all users
router.get('/all', requireAdmin, userController.getAllUsers);

// Only admins can promote users to admin
router.put('/:id/promote', requireAdmin, userController.promoteToAdmin);

// Only admins can delete cuisines
router.delete('/:id', requireAdmin, cuisineController.deleteCuisine);
```

**Mixed permissions** (owner OR admin):
```javascript
router.delete('/:id', authenticateToken, (req, res) => {
    const userId = req.user.user_id;
    const isAdmin = req.user.is_admin;

    database.get('SELECT user_id FROM Recipes WHERE recipe_id = ?', [req.params.id], (err, recipe) => {
        // Admin can delete any recipe, regular user only their own
        if (!isAdmin && recipe.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You can only delete your own recipes'
            });
        }

        // Delete recipe...
    });
});
```

### Example Use Cases

| Action | Regular User | Admin |
|--------|-------------|-------|
| View recipes | Yes | Yes |
| Create recipe | Yes (own) | Yes |
| Edit recipe | Yes (own only) | Yes (any) |
| Delete recipe | Yes (own only) | Yes (any) |
| Add cuisine | No | Yes |
| Delete cuisine | No | Yes |
| View all users | No | Yes |
| Promote user to admin | No | Yes |
| Delete any user | No | Yes |

---

## Common Queries

### User Management

**Get user with admin status**:
```sql
SELECT user_id, username, email, is_admin, created_at
FROM Users
WHERE email = 'user@example.com';
```

**Promote user to admin**:
```sql
UPDATE Users
SET is_admin = 1
WHERE user_id = 5;
```

**Get all admins**:
```sql
SELECT user_id, username, email
FROM Users
WHERE is_admin = 1;
```

### Recipe Queries

**Get recipe with owner info**:
```sql
SELECT
    r.recipe_id, r.title, r.description,
    u.username as owner_username,
    u.user_id as owner_id,
    u.is_admin as owner_is_admin
FROM Recipes r
JOIN Users u ON r.user_id = u.user_id
WHERE r.recipe_id = 1;
```

**Get all recipes by user**:
```sql
SELECT recipe_id, title, description, created_at
FROM Recipes
WHERE user_id = 5
ORDER BY created_at DESC;
```

**Get recipe with ingredients**:
```sql
SELECT
    r.title,
    i.name as ingredient_name,
    ri.quantity,
    i.unit
FROM Recipes r
JOIN RecipeIngredients ri ON r.recipe_id = ri.recipe_id
JOIN Ingredients i ON ri.ingredient_id = i.ingredient_id
WHERE r.recipe_id = 1;
```

**Get recipe with instructions**:
```sql
SELECT step_number, description
FROM RecipeInstructions
WHERE recipe_id = 1
ORDER BY step_number;
```

### Favorites and Ratings

**Get user's favorite recipes**:
```sql
SELECT r.recipe_id, r.title, r.description, uf.added_at
FROM UserFavorites uf
JOIN Recipes r ON uf.recipe_id = r.recipe_id
WHERE uf.user_id = 5
ORDER BY uf.added_at DESC;
```

**Get recipe average rating**:
```sql
SELECT
    r.recipe_id,
    r.title,
    AVG(rr.rating) as average_rating,
    COUNT(rr.rating) as total_ratings
FROM Recipes r
LEFT JOIN RecipeRatings rr ON r.recipe_id = rr.recipe_id
WHERE r.recipe_id = 1
GROUP BY r.recipe_id;
```

**Check if user favorited a recipe**:
```sql
SELECT 1
FROM UserFavorites
WHERE user_id = 5 AND recipe_id = 10;
```

### Advanced Queries

**Get recipes with filters**:
```sql
SELECT DISTINCT r.*
FROM Recipes r
LEFT JOIN Cuisines c ON r.cuisine_id = c.cuisine_id
LEFT JOIN Goals g ON r.goal_id = g.goal_id
LEFT JOIN DietaryInformation d ON r.DietaryInformation_id = d.diet_id
WHERE
    r.cuisine_id = 1  -- Italian
    AND r.goal_id = 2  -- Weight Loss
    AND (r.AllergiesInformation_id != 3 OR r.AllergiesInformation_id IS NULL);  -- No Dairy
```

**Get top-rated recipes**:
```sql
SELECT
    r.recipe_id,
    r.title,
    AVG(rr.rating) as avg_rating,
    COUNT(rr.rating) as num_ratings
FROM Recipes r
LEFT JOIN RecipeRatings rr ON r.recipe_id = rr.recipe_id
GROUP BY r.recipe_id
HAVING num_ratings >= 5
ORDER BY avg_rating DESC
LIMIT 10;
```

---

## Database Initialization

### Setup Files

1. **database/schema.sql** - Main tables (Recipes, Ingredients, etc.)
2. **database/user_tables.sql** - User, UserFavorites, RecipeRatings tables
3. **database/seed_data.sql** - Sample data for testing

### Initialization Script

**File**: `database/initializeDB.js`

```javascript
const database = require('../config/database').getDB();
const fs = require('fs');
const path = require('path');

// Read and execute schema files
const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
const userTablesSQL = fs.readFileSync(path.join(__dirname, 'user_tables.sql'), 'utf8');

database.exec(schemaSQL, (err) => {
    if (err) console.error('Error creating schema:', err);
    else console.log('Schema created successfully');
});

database.exec(userTablesSQL, (err) => {
    if (err) console.error('Error creating user tables:', err);
    else console.log('User tables created successfully');
});
```

---

## Foreign Key Constraints

SQLite requires foreign key support to be enabled:

```javascript
// In config/database.js
sqlite3.verbose();
const db = new sqlite3.Database('./database/recipe_website.db');

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON;');
```

### CASCADE Rules Summary

| Parent Table | Child Table | On Delete |
|--------------|-------------|-----------|
| Users → Recipes | CASCADE | Delete user deletes all their recipes |
| Users → UserFavorites | CASCADE | Delete user deletes all their favorites |
| Users → RecipeRatings | CASCADE | Delete user deletes all their ratings |
| Recipes → RecipeIngredients | CASCADE | Delete recipe deletes all ingredient links |
| Recipes → RecipeInstructions | CASCADE | Delete recipe deletes all instructions |
| Cuisines → Recipes | SET NULL | Delete cuisine sets recipe.cuisine_id to NULL |
| Goals → Recipes | SET NULL | Delete goal sets recipe.goal_id to NULL |

---

## Security Considerations

### Password Storage

- Never store plain text passwords
- Always hash with bcrypt (10 salt rounds minimum)
- Password hash is stored in `Users.password_hash`

```javascript
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash(password, 10);
```

### Admin Privileges

- `is_admin` field controls admin access
- Always check `is_admin` before admin operations
- Use `requireAdmin` middleware for admin-only routes
- Log admin actions for audit trail

### SQL Injection Prevention

- Always use parameterized queries
- Never concatenate user input into SQL strings

**Bad**:
```javascript
const sql = `SELECT * FROM Users WHERE email = '${email}'`;  // UNSAFE!
```

**Good**:
```javascript
const sql = 'SELECT * FROM Users WHERE email = ?';
database.get(sql, [email], callback);  // SAFE
```

---

## Migration: Adding is_admin to Existing Database

If you already have a Users table without `is_admin`:

```sql
-- Add the column
ALTER TABLE Users ADD COLUMN is_admin INTEGER DEFAULT 0;

-- Make the first user an admin
UPDATE Users
SET is_admin = 1
WHERE user_id = (SELECT MIN(user_id) FROM Users);
```

---

## Summary

### Key Points

1. **11 total tables** in the database
2. **Users table** includes `is_admin` field for role-based access control
3. **Foreign keys** enforce referential integrity
4. **CASCADE deletes** clean up related data automatically
5. **Composite primary keys** prevent duplicate favorites/ratings
6. **CHECK constraints** validate rating values (1-5)
7. **Session-based auth** stores user info including `is_admin` status
8. **bcrypt hashing** protects passwords
9. **Parameterized queries** prevent SQL injection

### Admin Features

- `is_admin = 1` grants admin privileges
- `requireAdmin` middleware protects admin routes
- Admins can manage all resources, users can only manage their own
- Admin status included in session data

---

**Last Updated**: 2025-11-05
