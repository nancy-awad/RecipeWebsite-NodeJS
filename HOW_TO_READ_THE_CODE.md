# How to Read and Understand the Code Flow

This guide explains how to trace a request through the application from start to finish.

## Table of Contents
1. [Understanding the Architecture](#understanding-the-architecture)
2. [Request Flow Overview](#request-flow-overview)
3. [Tracing an API Request Step-by-Step](#tracing-an-api-request-step-by-step)
4. [How to Read Each Component](#how-to-read-each-component)
5. [Examples: Tracing Real Requests](#examples-tracing-real-requests)

---

## Understanding the Architecture

This project follows the **MVC (Model-View-Controller)** pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT REQUEST                       │
│              (Browser, Postman, cURL, etc.)                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                          app.js                              │
│                     (Application Entry)                      │
│  - Loads dependencies                                        │
│  - Configures middleware                                     │
│  - Registers routes                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      MIDDLEWARE CHAIN                        │
│  1. express.json() - Parse JSON body                        │
│  2. CORS - Handle cross-origin requests                     │
│  3. Request Logger - Log incoming requests                  │
│  4. Validation - Validate request data (optional)           │
│  5. Authentication - Verify JWT token (optional)            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     ROUTES (routes/*.js)                     │
│  - Match URL pattern                                         │
│  - Match HTTP method (GET, POST, PUT, DELETE)               │
│  - Apply route-specific middleware                          │
│  - Call controller function                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              CONTROLLER (controllers/*.js)                   │
│  - Receive request (req) and response (res)                 │
│  - Extract parameters, body, query                          │
│  - Call model methods                                       │
│  - Handle errors                                            │
│  - Send response                                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   MODEL (models/*.js)                        │
│  - Interact with database                                   │
│  - Execute SQL queries                                      │
│  - Return data or errors                                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE (SQLite)                           │
│  - Store and retrieve data                                  │
│  - Execute queries                                          │
│  - Return results                                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    RESPONSE TO CLIENT                        │
│              (JSON data or error message)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Request Flow Overview

### When a request comes to `/api/recipes`:

**Start here:**
1. **app.js** (line ~1-130) - Application entry point
2. **routes/recipes.js** (line ~1-26) - Route definitions
3. **middleware/validation.js** (optional, line ~1-104) - Validate data
4. **controllers/recipeController.js** (line ~1-200+) - Business logic
5. **models/Recipe.js** (line ~1-100+) - Database queries
6. **Back to controller** - Process data
7. **Back to client** - Send response

---

## Tracing an API Request Step-by-Step

### Step 1: Start at `app.js`

**File**: `app.js`

This is the **entry point** of your application. Always start here.

```javascript
// app.js (line 1-5)
const express = require('express');
const app = express();

// Line 8-11: Import routes
const recipeRoutes = require('./routes/recipes');
const cuisineRoutes = require('./routes/cuisines');
const ingredientRoutes = require('./routes/ingredients');
const userRoutes = require('./routes/users');
```

**Key sections to understand:**

#### A. Middleware Setup (lines 16-36)
```javascript
// Line 16-17: Parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Line 20-30: CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    // ... more headers
});

// Line 33-36: Request logging
app.use((req, res, next) => {
    console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
    next(); // IMPORTANT: Pass to next middleware
});
```

**What happens**: Every request passes through these middleware in order.

#### B. Route Registration (lines 39-43)
```javascript
// Line 39-43
app.use('/api/recipes', recipeRoutes);      // All /api/recipes/* go here
app.use('/api/cuisines', cuisineRoutes);    // All /api/cuisines/* go here
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/users', userRoutes);
```

**How it works:**
- Request to `GET /api/recipes` → goes to `recipeRoutes`
- Request to `POST /api/users/login` → goes to `userRoutes`
- The prefix (`/api/recipes`) is removed before entering the route file

---

### Step 2: Follow to Routes File

**File**: `routes/recipes.js`

After `app.js` directs the request to the route file:

```javascript
// routes/recipes.js (line 1-4)
const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { validateRecipe } = require('../middleware/validation');
```

**Route definitions** (lines 7-24):
```javascript
// Line 7: GET /api/recipes → becomes just / in this file
router.get('/', recipeController.getAllRecipes);

// Line 8: GET /api/recipes/5 → becomes /:id
router.get('/:id', recipeController.getRecipeById);

// Line 14: POST /api/recipes with validation
router.post('/', validateRecipe, recipeController.createRecipe);
//              ↑ middleware     ↑ controller function
```

**Important**:
- The base path `/api/recipes` is already handled by `app.js`
- So `/` in this file means `/api/recipes`
- `/:id` means `/api/recipes/:id`

**Middleware execution order**:
```
Request → validateRecipe (optional) → recipeController.createRecipe
```

---

### Step 3: Middleware (Optional)

**File**: `middleware/validation.js`

If a route uses middleware (like `validateRecipe`):

```javascript
// middleware/validation.js (line 2-34)
const validateRecipe = (req, res, next) => {
    const { title, description, cuisine_id, goal_id } = req.body;

    // Check if title is valid
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Title is required and must be a non-empty string'
        });
    }

    // If all checks pass, continue to controller
    next(); // ← IMPORTANT: This calls the next function (controller)
};
```

**Key points**:
- Middleware receives `(req, res, next)`
- Validates data from `req.body`, `req.params`, `req.query`
- If validation fails: send error response and **DON'T call `next()`**
- If validation passes: call `next()` to continue to controller

---

### Step 4: Controller

**File**: `controllers/recipeController.js`

Controllers contain the **business logic**:

```javascript
// controllers/recipeController.js
const Recipe = require('../models/Recipe');

/**
 * Get all recipes
 * Called from: router.get('/', recipeController.getAllRecipes)
 */
exports.getAllRecipes = async (req, res, next) => {
    try {
        // 1. Call the Model to get data from database
        const recipes = await Recipe.findAll();

        // 2. Send successful response
        res.status(200).json({
            success: true,
            count: recipes.length,
            data: recipes
        });
    } catch (error) {
        // 3. If error, pass to error handler middleware
        next(error);
    }
};
```

**Flow**:
1. Extract data from `req.body`, `req.params`, `req.query`
2. Call Model methods (database operations)
3. Process the data if needed
4. Send response using `res.json()` or `res.status().json()`
5. Handle errors with `try/catch` and `next(error)`

---

### Step 5: Model

**File**: `models/Recipe.js`

Models handle **database interactions**:

```javascript
// models/Recipe.js
const database = require('../config/database');

class Recipe {
    /**
     * Get all recipes from database
     * Called from: recipeController.getAllRecipes()
     */
    static async findAll() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT r.*, c.name as cuisine_name, g.name as goal_name
                FROM Recipes r
                LEFT JOIN Cuisines c ON r.cuisine_id = c.cuisine_id
                LEFT JOIN Goals g ON r.goal_id = g.goal_id
            `;

            // Execute query
            database.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err); // Error goes back to controller
                } else {
                    resolve(rows); // Data goes back to controller
                }
            });
        });
    }
}
```

**Key points**:
- Uses `database` connection from `config/database.js`
- Executes SQL queries
- Returns Promises (async/await)
- Handles database errors

---

### Step 6: Database Config

**File**: `config/database.js`

This file creates the SQLite connection:

```javascript
// config/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/recettes.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error connecting to database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
    }
});

module.exports = db;
```

**What it does**:
- Creates SQLite database connection
- Exports the `db` object
- Used by all models

---

## How to Read Each Component

### Reading `app.js`

**Questions to ask:**
1. What middleware is registered? (Look for `app.use()`)
2. What routes are registered? (Look for `app.use('/api/...')`)
3. Is there error handling? (Look for `app.use(errorHandler)` at the end)
4. What port does it run on? (Look for `app.listen()`)

**Order matters!** Middleware executes in the order it's defined.

---

### Reading Routes (`routes/*.js`)

**Questions to ask:**
1. What HTTP method is used? (`router.get`, `router.post`, etc.)
2. What is the URL pattern? (`/`, `/:id`, `/cuisine/:cuisineId`)
3. Is there middleware? (Between route and controller)
4. What controller function is called?

**Example**:
```javascript
router.post('/', validateRecipe, recipeController.createRecipe);
//     ↑     ↑         ↑                    ↑
//  method  path   middleware          controller
```

**Full URL**: Base path + route path
- Base: `/api/recipes` (from app.js)
- Route: `/`
- Full: `POST /api/recipes`

---

### Understanding Route Structure (IMPORTANT!)

Every route definition follows this pattern:

```javascript
router.METHOD(path, middleware1, middleware2, ..., finalHandler);
```

#### Breaking Down the Arguments

```javascript
router.post('/', authenticateToken, validateCuisine, cuisineController.createCuisine);
//      |    |         |                |                    |
//      1    2         3                4                    5
```

1. **HTTP Method** (`post`) - The request type
2. **Path** (`'/'`) - **FIRST ARGUMENT** - URL pattern
3. **Middleware 1** (`authenticateToken`) - Executes first
4. **Middleware 2** (`validateCuisine`) - Executes second
5. **Final Handler** (`cuisineController.createCuisine`) - **LAST ARGUMENT** - Executes last

#### The Three Parts

| Part | Position | What It Is | Example |
|------|----------|------------|---------|
| **Path** | First argument | URL pattern to match | `'/'`, `'/:id'`, `'/search'` |
| **Middleware** | Middle arguments (optional) | Functions that run before handler | `authenticateToken`, `validateCuisine` |
| **Handler** | Last argument | Final function that sends response | `cuisineController.createCuisine` |

#### Execution Order: Left to Right

**IMPORTANT**: Middleware executes in the **exact order** from left to right.

```javascript
router.post('/', auth, validate, controller);
//              ↓     ↓        ↓
//              1st   2nd      3rd (last)
```

**Example with execution flow**:
```javascript
router.post('/', authenticateToken, validateCuisine, cuisineController.createCuisine);

// When request arrives:
Step 1: authenticateToken runs
        - Verifies JWT token
        - Sets req.user = { user_id, username, email }
        - Calls next()
        ↓
Step 2: validateCuisine runs
        - Checks if req.body.name is valid
        - If invalid: sends 400 error and STOPS
        - If valid: calls next()
        ↓
Step 3: cuisineController.createCuisine runs
        - Uses req.user.user_id (from step 1)
        - Uses req.body.name (validated in step 2)
        - Creates cuisine in database
        - Sends response (does NOT call next)
```

#### Common Patterns

**No middleware** (simplest):
```javascript
router.get('/', controller.getAll);
//          ↑   ↑
//        path  handler only
```

**With one middleware**:
```javascript
router.post('/', validateData, controller.create);
//           ↑    ↑             ↑
//         path  middleware    handler
```

**With multiple middleware** (most secure):
```javascript
router.delete('/:id', authenticateToken, checkOwnership, controller.delete);
//            ↑       ↑                  ↑               ↑
//          path    middleware 1      middleware 2    handler
```

#### Why Order Matters

**WRONG ORDER** - Validation before authentication:
```javascript
router.post('/', validateCuisine, authenticateToken, controller.create);
//              BAD: Validates data before checking if user is logged in
```

**CORRECT ORDER** - Authentication first, then validation:
```javascript
router.post('/', authenticateToken, validateCuisine, controller.create);
//              GOOD: Checks auth first, then validates data
```

**Rule**: Always authenticate BEFORE doing other operations.

#### Terminology: Route vs API Endpoint

| Term | When to Use |
|------|-------------|
| **Route** | In code/technical discussion |
| **API Endpoint** | In documentation/talking to users |
| **Route Definition** | When being very specific |

Both terms refer to the same thing, just different contexts.

#### Visual Breakdown

```
router.post('/', middleware1, middleware2, finalHandler);
           │      │           │           │
           │      │           │           └─ LAST: Sends response
           │      │           └─ MIDDLE: Validates/processes
           │      └─ MIDDLE: Authenticates/checks
           └─ FIRST: URL pattern to match
```

#### Quick Test Your Understanding

**Question**: In this route, what executes first?
```javascript
router.put('/:id', validateData, authenticateToken, controller.update);
```

**Answer**: `validateData` executes first (left to right order).

**Is this good?** NO! Authentication should come before validation.

**Better version**:
```javascript
router.put('/:id', authenticateToken, validateData, controller.update);
```

---

### Reading Middleware (`middleware/*.js`)

**Questions to ask:**
1. What does it validate/check?
2. Does it call `next()` on success?
3. Does it send a response on failure?
4. Does it modify `req` or `res`?

**Pattern**:
```javascript
const myMiddleware = (req, res, next) => {
    // 1. Get data from req
    // 2. Validate or process
    // 3. If error: send response and STOP
    // 4. If success: call next()
};
```

---

### Reading Controllers (`controllers/*.js`)

**Questions to ask:**
1. What data does it extract from `req`?
2. What model methods does it call?
3. What response does it send?
4. How does it handle errors?

**Pattern**:
```javascript
exports.methodName = async (req, res, next) => {
    try {
        // 1. Extract data from req
        const { param } = req.body;

        // 2. Call model
        const result = await Model.method(param);

        // 3. Send response
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        // 4. Handle errors
        next(error);
    }
};
```

---

### Reading Models (`models/*.js`)

**Questions to ask:**
1. What SQL query is executed?
2. What parameters are passed?
3. What data is returned?
4. How are errors handled?

**Pattern**:
```javascript
static async methodName(params) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT ...';
        database.all(sql, [params], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}
```

---

## Examples: Tracing Real Requests

### Example 1: `GET /api/recipes`

**Follow the flow:**

1. **app.js:39** → `app.use('/api/recipes', recipeRoutes)`
   - Routes request to `routes/recipes.js`

2. **routes/recipes.js:7** → `router.get('/', recipeController.getAllRecipes)`
   - Matches GET request to `/`
   - Calls `getAllRecipes` controller

3. **controllers/recipeController.js** → `exports.getAllRecipes`
   - Calls `Recipe.findAll()`

4. **models/Recipe.js** → `static async findAll()`
   - Executes SQL query
   - Returns recipes array

5. **Back to controller** → Sends JSON response
   ```json
   {
     "success": true,
     "count": 10,
     "data": [...]
   }
   ```

**Console output:**
```
📝 2025-11-04T10:30:00.000Z - GET /api/recipes
```

---

### Example 2: `POST /api/recipes` (with validation)

**Follow the flow:**

1. **app.js:16** → `express.json()`
   - Parses JSON body

2. **app.js:39** → Routes to `recipeRoutes`

3. **routes/recipes.js:14** → `router.post('/', validateRecipe, recipeController.createRecipe)`
   - First calls `validateRecipe` middleware

4. **middleware/validation.js:2** → `validateRecipe(req, res, next)`
   - Checks if title, description, etc. are valid
   - If invalid: sends 400 error and STOPS
   - If valid: calls `next()` to continue

5. **controllers/recipeController.js** → `exports.createRecipe`
   - Calls `Recipe.create(data)`

6. **models/Recipe.js** → `static async create(data)`
   - Executes INSERT query
   - Returns new recipe

7. **Back to controller** → Sends 201 response

---

### Example 3: `GET /api/users/profile` (with auth)

**Follow the flow:**

1. **app.js:43** → Routes to `userRoutes`

2. **routes/users.js:49** → `router.get('/profile', authenticateToken, userController.getProfile)`
   - First calls `authenticateToken` middleware

3. **middleware/auth.js** → `authenticateToken(req, res, next)`
   - Gets token from `Authorization` header
   - Verifies JWT token
   - If invalid: sends 401/403 error and STOPS
   - If valid: attaches `req.user` and calls `next()`

4. **controllers/userController.js** → `exports.getProfile`
   - Uses `req.user.user_id` (from middleware)
   - Calls `User.findById()`

5. **models/User.js** → `static async findById(id)`
   - Executes SELECT query
   - Returns user data

6. **Back to controller** → Sends user profile (without password)

---

## Quick Reference: What to Look At

| To understand... | Look at file... | Key sections |
|-----------------|-----------------|--------------|
| Application structure | `app.js` | Lines 1-130 |
| Available routes | `routes/*.js` | All router definitions |
| Request validation | `middleware/validation.js` | All validation functions |
| Authentication | `middleware/auth.js` | authenticateToken |
| Business logic | `controllers/*.js` | All exports functions |
| Database queries | `models/*.js` | All static methods |
| Error handling | `middleware/errorHandler.js` | Error handler function |

---

## Tips for Students

### 1. Follow the Path
Always start at `app.js` and follow the path:
```
app.js → routes → middleware → controller → model → database
```

### 2. Use Console Logs
Add `console.log()` statements to track flow:
```javascript
console.log('1. Entered controller');
console.log('2. Data:', req.body);
console.log('3. Calling model...');
```

### 3. Check Middleware Order
Middleware executes in order. If something isn't working, check if middleware is in the right place.

### 4. Read Error Messages
Error messages tell you where the problem is:
```
Error in recipeController.getAllRecipes → Check controller
Error in Recipe.findAll → Check model
Error: connect ECONNREFUSED → Check database connection
```

### 5. Test One Route at a Time
Don't implement everything at once. Test each endpoint individually.

---

## Common Patterns

### Pattern 1: Basic GET endpoint
```
Client → app.js → routes → controller → model → database
                                        ↓
Client ← JSON response ← controller ← model ← database
```

### Pattern 2: POST with validation
```
Client → app.js → routes → validation middleware
                            ↓ (if valid)
                         controller → model → database
                            ↓
Client ← JSON response ← controller
```

### Pattern 3: Protected endpoint with auth
```
Client (with token) → app.js → routes → auth middleware
                                         ↓ (if token valid)
                                      controller → model
                                         ↓
Client ← JSON response ← controller
```

---

## Summary

**To understand any API endpoint:**

1. **Start**: `app.js` - Find where routes are registered
2. **Routes**: `routes/*.js` - Find the matching route
3. **Middleware**: `middleware/*.js` - See what runs before controller
4. **Controller**: `controllers/*.js` - See the business logic
5. **Model**: `models/*.js` - See the database queries
6. **Response**: Back through the chain to the client

**Remember**: The flow is always **sequential** from top to bottom in `app.js` and left to right in route definitions!
