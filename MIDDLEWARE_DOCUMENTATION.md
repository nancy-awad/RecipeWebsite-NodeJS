# Middleware Documentation

## Overview
Middlewares are functions that execute during the request-response cycle. They have access to the request object (`req`), response object (`res`), and the next middleware function (`next`).

## Middlewares in This Project

### 1. Custom Validation Middleware
**Location**: `middleware/validation.js`

#### validateRecipe
Validates recipe creation requests.

**Validates**:
- `title` - Required, must be a non-empty string
- `description` - Required, must be a string
- `cuisine_id` - Required, must be an integer
- `goal_id` - Required, must be an integer

**Usage**:
```javascript
const { validateRecipe } = require('./middleware/validation');
router.post('/recipes', validateRecipe, recipeController.createRecipe);
```

**Error Response Example**:
```json
{
  "success": false,
  "message": "Title is required and must be a non-empty string"
}
```

#### validateRecipeUpdate
Validates recipe update requests.

**Validates**:
- `title` - Optional, but if provided must be a non-empty string

**Usage**:
```javascript
router.put('/recipes/:id', validateRecipeUpdate, recipeController.updateRecipe);
```

#### validateCuisine
Validates cuisine creation/update requests.

**Validates**:
- `name` - Required, must be a non-empty string

**Usage**:
```javascript
router.post('/cuisines', validateCuisine, cuisineController.createCuisine);
```

#### validateIngredient
Validates ingredient creation requests.

**Validates**:
- `name` - Required, must be a non-empty string
- `quantity` - Optional, must be a string if provided
- `unit` - Optional, must be a string if provided

**Usage**:
```javascript
router.post('/ingredients', validateIngredient, ingredientController.createIngredient);
```

---

### 2. Error Handler Middleware
**Location**: `middleware/errorHandler.js`

Centralized error handling middleware that catches and formats all errors.

**Handles**:
- **SQLite Constraint Errors** (`SQLITE_CONSTRAINT`) - Returns 400
- **Foreign Key Violations** (`SQLITE_CONSTRAINT_FOREIGNKEY`) - Returns 400
- **Unique Constraint Violations** (`SQLITE_CONSTRAINT_UNIQUE`) - Returns 409
- **Validation Errors** - Returns 400
- **JSON Parsing Errors** - Returns 400
- **Generic Server Errors** - Returns 500

**Features**:
- Logs errors to console with stack trace
- Hides error details in production mode
- Returns consistent JSON error responses

**Usage** (must be last middleware):
```javascript
app.use(errorHandler);
```

**Error Response Example**:
```json
{
  "success": false,
  "message": "Database constraint violation",
  "error": "FOREIGN KEY constraint failed" // only in development
}
```

---

### 3. Built-in Express Middlewares
**Location**: `app.js:16-17`

#### express.json()
Parses incoming requests with JSON payloads.

**Usage**:
```javascript
app.use(express.json());
```

**Example**: Converts `{ "title": "Pasta" }` in request body to `req.body.title`

#### express.urlencoded({ extended: true })
Parses incoming requests with URL-encoded payloads (form data).

**Usage**:
```javascript
app.use(express.urlencoded({ extended: true }));
```

---

### 4. Custom CORS Middleware
**Location**: `app.js:20-30`

Enables Cross-Origin Resource Sharing for frontend applications.

**Features**:
- Allows requests from any origin (`*`)
- Supports GET, POST, PUT, DELETE, OPTIONS methods
- Handles preflight OPTIONS requests

**Headers Set**:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization`

**Usage**:
```javascript
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});
```

---

### 5. Request Logging Middleware
**Location**: `app.js:33-36`

Logs every incoming HTTP request with timestamp, method, and path.

**Output Format**:
```
📝 2025-11-04T10:30:45.123Z - GET /api/recipes
📝 2025-11-04T10:30:50.456Z - POST /api/recipes
📝 2025-11-04T10:31:00.789Z - PUT /api/recipes/1
```

**Usage**:
```javascript
app.use((req, res, next) => {
    console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
```

---

### 6. 404 Handler Middleware
**Location**: `app.js:89-102`

Catches all undefined routes and returns a helpful 404 response.

**Usage** (must be after all routes):
```javascript
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl,
        availableEndpoints: [...]
    });
});
```

**Response Example**:
```json
{
  "success": false,
  "message": "Endpoint not found",
  "path": "/api/invalid-route",
  "availableEndpoints": [
    "GET /",
    "GET /help",
    "GET /api/recipes",
    "GET /api/cuisines",
    "GET /api/ingredients"
  ]
}
```

---

## Middleware Execution Order

The order of middleware matters! They execute in the order they are defined:

```
1. express.json()                    ← Parse JSON request body
2. express.urlencoded()              ← Parse URL-encoded body
3. CORS middleware                   ← Handle cross-origin requests
4. Request logging                   ← Log incoming requests
5. Routes with validation            ← Your API endpoints
   └── validateRecipe               ← Validate before controller
   └── recipeController             ← Handle business logic
6. 404 handler (*)                   ← Catch undefined routes
7. errorHandler                      ← Catch ALL errors (MUST BE LAST!)
```

### Example Flow:
```
Request: POST /api/recipes
  ↓
express.json() → Parses { "title": "Pasta", ... }
  ↓
CORS middleware → Adds CORS headers
  ↓
Request logging → Logs "📝 2025-11-04... - POST /api/recipes"
  ↓
Route matched → /api/recipes
  ↓
validateRecipe → Checks if title, description, cuisine_id, goal_id are valid
  ↓ (if valid)
recipeController.createRecipe → Business logic
  ↓ (if error occurs)
errorHandler → Returns formatted error response
```

---

## Best Practices

### 1. Order Matters
- Body parsers (`express.json()`) must come before routes
- Error handler must be **last** (after all routes and 404 handler)
- Validation middleware should run before controller logic

### 2. Always Call next()
```javascript
// Good ✅
const myMiddleware = (req, res, next) => {
    // Do something
    next(); // Pass control to next middleware
};

// Bad ❌
const myMiddleware = (req, res, next) => {
    // Do something
    // Forgot next() - request hangs!
};
```

### 3. Error Handling
```javascript
// Pass errors to error handler
const myMiddleware = (req, res, next) => {
    try {
        // Do something
        next();
    } catch (error) {
        next(error); // Pass to error handler
    }
};
```

### 4. Return After Sending Response
```javascript
const validateSomething = (req, res, next) => {
    if (!req.body.field) {
        return res.status(400).json({ error: 'Field required' });
        // RETURN to prevent next() from executing
    }
    next();
};
```

---

## TODO: Additional Middlewares to Implement

Based on `validation.js:92-97`, consider implementing:

- `validateDietaryInformation` - Validate dietary info creation/updates
- `validateAllergiesInformation` - Validate allergy info creation/updates
- `validateGoals` - Validate goal creation/updates
- `validateRecipeIngredients` - Validate recipe-ingredient relationships
- `validateRecipeInstructions` - Validate cooking instructions

### Optional Advanced Middlewares:
- **Authentication middleware** - Verify user tokens
- **Rate limiting** - Prevent API abuse
- **Request sanitization** - Clean user input
- **Compression** - Compress response data
- **Security headers** - Add security headers (helmet.js)

---

## Testing Middlewares

### Test Validation Middleware:
```bash
# Should fail - missing title
curl -X POST http://localhost:3000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{"description": "Test"}'

# Should succeed
curl -X POST http://localhost:3000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{"title": "Pasta", "description": "Delicious", "cuisine_id": 1, "goal_id": 1}'
```

### Test Error Handler:
```bash
# Trigger 404 handler
curl http://localhost:3000/api/invalid-route

# Trigger validation error
curl -X POST http://localhost:3000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'
```

### Test CORS:
```bash
# OPTIONS request (preflight)
curl -X OPTIONS http://localhost:3000/api/recipes \
  -H "Access-Control-Request-Method: POST" \
  -v
```

---

## Summary

Your project implements **6 middleware types**:
1. ✅ Validation (4 validators)
2. ✅ Error handling (centralized)
3. ✅ Body parsing (JSON & URL-encoded)
4. ✅ CORS (cross-origin support)
5. ✅ Request logging
6. ✅ 404 handling

All middlewares work together to create a robust, secure, and maintainable API!
