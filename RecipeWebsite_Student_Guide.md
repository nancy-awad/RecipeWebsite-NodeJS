# RecipeWebsite - Student Implementation Guide

## 📋 Project Overview
You need to create a **REST API** for a recipe website using **Node.js** and **SQLite**. This is a **backend-only** project - no HTML pages required, just API endpoints that can be tested.

## 🎯 Project Goals
- Build a complete recipe management API
- Implement recipe categorization by diet, allergies, cuisine, and goals
- Create CRUD operations for recipes and related data
- Test your API endpoints without building a frontend

## 🗃️ Database Schema Overview

### Core Tables Structure:
```
Recipes ──┬─── Cuisines
          ├─── Goals
          ├─── DietaryInformation
          └─── AllergiesInformation

Recipes ──── RecipeIngredients ──── Ingredients
   │
   └──── RecipeInstructions
```

### Key Categories to Implement:

**Dietary Information:**
- Sans produits laitiers, Sans Oeufs, Sans sucre, Sans gluten
- Végétarien, Végétalien, Paléo, Cétogène
- Faible en glucides, Faible en matières grasses

**Allergy Information:**
- Gluten, Produits laitiers, Noix, Fruits de mer
- Soja, Oeufs, Blé

**Cuisine Types:**
- Asiatique, Italienne, Chinoise, Française, Mexicaine
- Indienne, Méditerranéenne, Américaine, Thaïlandaise, Japonaise

**Goals:**
- Perte de poids, Riche en protéines, Riche en nutriments
- Faible en calories, Rapide et facile, Adapté aux familles
- Économique, Occasions spéciales

## 🚀 Step-by-Step Implementation

### Step 1: Project Setup
```bash
# Create project directory
mkdir recipe-website-api
cd recipe-website-api

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express sqlite3

# Optional: Install development dependencies
npm install --save-dev nodemon
```

### Step 2: Database Setup

1. **Install SQLite3** (if not already installed)
2. **Create database file:**
   ```bash
   sqlite3 recettes.db
   ```
3. **Execute SQL files in order:**
   - First: `creationDB.sql` (create tables)
   - Second: `InsertionDB.sql` (insert sample data)

4. **Verify database structure:**
   ```sql
   .tables
   PRAGMA table_info(Recipes);
   .quit
   ```

### Step 3: Project File Organization

Before writing code, organize your project structure properly:

```
recipe-website-api/
├── 📁 config/
│   └── database.js          # Database connection configuration
├── 📁 controllers/
│   ├── recipeController.js  # Recipe business logic
│   ├── cuisineController.js # Cuisine business logic
│   └── ingredientController.js
├── 📁 routes/
│   ├── recipes.js           # Recipe endpoints
│   ├── cuisines.js          # Cuisine endpoints
│   └── ingredients.js       # Ingredient endpoints
├── 📁 middleware/
│   ├── validation.js        # Input validation middleware
│   └── errorHandler.js      # Error handling middleware
├── 📁 models/
│   ├── Recipe.js           # Recipe data access layer
│   ├── Cuisine.js          # Cuisine data access layer
│   └── Ingredient.js       # Ingredient data access layer
├── 📁 database/
│   ├── recettes.db         # SQLite database file
│   ├── creationDB.sql      # Table creation scripts
│   └── InsertionDB.sql     # Sample data insertion
├── 📁 tests/
│   ├── recipes.test.js     # Recipe endpoint tests
│   └── database.test.js    # Database tests
├── 📁 utils/
│   └── helpers.js          # Utility functions
├── .env                    # Environment variables
├── .gitignore             # Git ignore file
├── package.json           # Project dependencies
├── README.md              # Project documentation
└── app.js                 # Main application entry point
```

### Why This Structure?

**🎯 Separation of Concerns:**
- **Routes** handle HTTP requests/responses
- **Controllers** contain business logic
- **Models** manage database operations
- **Middleware** handles cross-cutting concerns

**📈 Scalability:**
- Easy to add new features
- Simple to locate and modify code
- Team collaboration friendly

**🧪 Testability:**
- Each component can be tested independently
- Clear dependencies between layers

### Step 4: Express Server Setup

**1. Create `app.js` (Main Entry Point):**
```javascript
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

// Import routes
const recipeRoutes = require('./routes/recipes');
const cuisineRoutes = require('./routes/cuisines');
const ingredientRoutes = require('./routes/ingredients');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/recipes', recipeRoutes);
app.use('/api/cuisines', cuisineRoutes);
app.use('/api/ingredients', ingredientRoutes);

// Home route
app.get('/', (req, res) => {
    res.json({
        message: 'Recipe Website API',
        version: '1.0.0',
        endpoints: {
            recipes: '/api/recipes',
            cuisines: '/api/cuisines',
            ingredients: '/api/ingredients'
        }
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📖 API documentation: http://localhost:${port}/`);
});

module.exports = app;
```

**2. Create `config/database.js` (Database Configuration):**
```javascript
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/recettes.db');

class Database {
    constructor() {
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('❌ Error opening database:', err.message);
            } else {
                console.log('✅ Connected to SQLite database');
            }
        });
    }

    getDB() {
        return this.db;
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('📪 Database connection closed');
                    resolve();
                }
            });
        });
    }
}

module.exports = new Database();
```

**3. Create `routes/recipes.js` (Recipe Routes):**
```javascript
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
```

**4. Create `controllers/recipeController.js` (Business Logic):**
```javascript
const Recipe = require('../models/Recipe');

class RecipeController {
    async getAllRecipes(req, res, next) {
        try {
            const recipes = await Recipe.findAll();
            res.json({
                success: true,
                count: recipes.length,
                data: recipes
            });
        } catch (error) {
            next(error);
        }
    }

    async getRecipeById(req, res, next) {
        try {
            const { id } = req.params;
            const recipe = await Recipe.findById(id);

            if (!recipe) {
                return res.status(404).json({
                    success: false,
                    message: 'Recipe not found'
                });
            }

            res.json({
                success: true,
                data: recipe
            });
        } catch (error) {
            next(error);
        }
    }

    async createRecipe(req, res, next) {
        try {
            const recipeData = req.body;
            const newRecipe = await Recipe.create(recipeData);

            res.status(201).json({
                success: true,
                message: 'Recipe created successfully',
                data: newRecipe
            });
        } catch (error) {
            next(error);
        }
    }

    // Add other methods...
}

module.exports = new RecipeController();
```

**5. Create `models/Recipe.js` (Data Access Layer):**
```javascript
const database = require('../config/database');

class Recipe {
    constructor(data) {
        this.recipe_id = data.recipe_id;
        this.title = data.title;
        this.description = data.description;
        this.image_url = data.image_url;
        this.cuisine_id = data.cuisine_id;
        this.goal_id = data.goal_id;
        this.DietaryInformation_id = data.DietaryInformation_id;
        this.AllergiesInformation_id = data.AllergiesInformation_id;
    }

    static async findAll() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT r.*, c.name as cuisine_name, g.name as goal_name,
                       d.name as diet_name, a.name as allergy_name
                FROM Recipes r
                LEFT JOIN Cuisines c ON r.cuisine_id = c.cuisine_id
                LEFT JOIN Goals g ON r.goal_id = g.goal_id
                LEFT JOIN DietaryInformation d ON r.DietaryInformation_id = d.diet_id
                LEFT JOIN AllergiesInformation a ON r.AllergiesInformation_id = a.allergy_id
            `;

            database.getDB().all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => new Recipe(row)));
                }
            });
        });
    }

    static async findById(id) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT r.*, c.name as cuisine_name, g.name as goal_name,
                       d.name as diet_name, a.name as allergy_name
                FROM Recipes r
                LEFT JOIN Cuisines c ON r.cuisine_id = c.cuisine_id
                LEFT JOIN Goals g ON r.goal_id = g.goal_id
                LEFT JOIN DietaryInformation d ON r.DietaryInformation_id = d.diet_id
                LEFT JOIN AllergiesInformation a ON r.AllergiesInformation_id = a.allergy_id
                WHERE r.recipe_id = ?
            `;

            database.getDB().get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? new Recipe(row) : null);
                }
            });
        });
    }

    static async create(data) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO Recipes (title, description, image_url, cuisine_id, goal_id, DietaryInformation_id, AllergiesInformation_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            database.getDB().run(sql, [
                data.title, data.description, data.image_url,
                data.cuisine_id, data.goal_id, data.DietaryInformation_id, data.AllergiesInformation_id
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(new Recipe({...data, recipe_id: this.lastID}));
                }
            });
        });
    }

    // Add other methods (update, delete, etc.)
}

module.exports = Recipe;
```

**6. Create `middleware/validation.js` (Input Validation):**
```javascript
const validateRecipe = (req, res, next) => {
    const { title, description, cuisine_id, goal_id } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Title is required and must be a non-empty string'
        });
    }

    if (!description || typeof description !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Description is required and must be a string'
        });
    }

    if (!cuisine_id || !Number.isInteger(cuisine_id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid cuisine_id is required'
        });
    }

    if (!goal_id || !Number.isInteger(goal_id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid goal_id is required'
        });
    }

    next();
};

const validateRecipeUpdate = (req, res, next) => {
    const { title } = req.body;

    if (title && (typeof title !== 'string' || title.trim().length === 0)) {
        return res.status(400).json({
            success: false,
            message: 'Title must be a non-empty string'
        });
    }

    next();
};

module.exports = {
    validateRecipe,
    validateRecipeUpdate
};
```

**7. Create `middleware/errorHandler.js` (Error Handling):**
```javascript
const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err.message);

    // SQLite errors
    if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json({
            success: false,
            message: 'Database constraint violation',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Default error
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

module.exports = errorHandler;
```

**8. Create `.env` (Environment Variables):**
```
NODE_ENV=development
PORT=3000
DATABASE_PATH=./database/recettes.db
```

**9. Update `package.json` scripts:**
```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "test": "jest"
  }
}
```

### 🎯 Benefits of This Structure:

1. **🔍 Easy to Navigate** - Find any file quickly
2. **🧪 Testable** - Each layer can be tested independently
3. **🔧 Maintainable** - Changes are isolated to specific files
4. **👥 Team-Friendly** - Multiple developers can work simultaneously
5. **📈 Scalable** - Easy to add new features without breaking existing code

### 📋 Development Workflow:

1. **Start with Models** - Define your data access layer
2. **Add Controllers** - Implement business logic
3. **Create Routes** - Define your API endpoints
4. **Add Middleware** - Handle validation and errors
5. **Test Everything** - Verify each layer works correctly

## 🛠️ Required API Endpoints

### GET Endpoints (Read Operations)

1. **GET /recipes** - Return all recipes
2. **GET /recipes/cuisine/:cuisine_id** - Return recipes from specific cuisine
3. **GET /recipes/no-allergens/:allergy_id** - Return recipes without specific allergens
4. **GET /recipes/goal/:goal_id** - Return recipes that meet specific goal
5. **GET /recipes/:id** - Return single recipe with all details (ingredients, instructions, etc.)
6. **GET /help** - Help and contact page info
7. **GET /** - Home page info

### POST Endpoints (Create Operations)

1. **POST /recipes** - Add new recipe with all information
2. **POST /recipes/:id/ingredients** - Add ingredient to recipe
3. **POST /cuisines** - Add new cuisine
4. **POST /ingredients** - Add new ingredient

### PUT Endpoints (Update Operations)

1. **PUT /recipes/:id/title** - Update recipe name
2. **PUT /recipes/:id/allergy** - Update recipe allergy information
3. **PUT /recipes/:id/instructions/:step_id** - Update recipe step description

### DELETE Endpoints (Delete Operations)

1. **DELETE /recipes/:id/ingredients/:ingredient_id** - Remove ingredient from recipe
2. **DELETE /recipes/:id** - Delete entire recipe
3. **DELETE /cuisines/:id** - Delete cuisine (update all related recipes to "International")

## 📝 Implementation Tips

### Database Queries Examples:

**Get all recipes:**
```javascript
app.get('/recipes', (req, res) => {
    db.all('SELECT * FROM Recipes', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ recipes: rows });
    });
});
```

**Get recipe with full details:**
```sql
SELECT r.*, c.name as cuisine_name, g.name as goal_name,
       d.name as diet_name, a.name as allergy_name
FROM Recipes r
LEFT JOIN Cuisines c ON r.cuisine_id = c.cuisine_id
LEFT JOIN Goals g ON r.goal_id = g.goal_id
LEFT JOIN DietaryInformation d ON r.DietaryInformation_id = d.diet_id
LEFT JOIN AllergiesInformation a ON r.AllergiesInformation_id = a.allergy_id
WHERE r.recipe_id = ?
```

### Error Handling Best Practices:
- Always check for database errors
- Return appropriate HTTP status codes
- Provide meaningful error messages
- Handle cases where resources don't exist

### Testing Your API:
1. Use a browser for GET requests
2. Use Postman or similar tools for POST/PUT/DELETE
3. Test all error scenarios
4. Verify data integrity after operations

## 🧪 Complete Postman Testing Guide

### Setting Up Postman

1. **Download and Install Postman**
   - Visit [postman.com](https://www.postman.com/downloads/)
   - Create a free account or skip and use locally

2. **Create a New Collection**
   - Click "New" → "Collection"
   - Name it "Recipe Website API"
   - Add description: "Testing endpoints for recipe management API"

### Environment Setup in Postman

1. **Create Environment Variables**
   - Click gear icon (⚙️) → "Manage Environments"
   - Add new environment: "Recipe API Local"
   - Add variable:
     - `base_url`: `http://localhost:3000`

### Testing Each Endpoint Type

#### 🔍 GET Requests (Read Operations)

**Test 1: Get All Recipes**
```
Method: GET
URL: {{base_url}}/recipes
Headers: (none needed)
Body: (none)
```
Expected Response: `200 OK` with JSON array of recipes

**Test 2: Get Single Recipe**
```
Method: GET
URL: {{base_url}}/recipes/1
Headers: (none needed)
Body: (none)
```
Expected Response: `200 OK` with single recipe object

**Test 3: Get Recipes by Cuisine**
```
Method: GET
URL: {{base_url}}/recipes/cuisine/2
Headers: (none needed)
Body: (none)
```
Expected Response: `200 OK` with filtered recipes

**Test 4: Get Recipes without Allergens**
```
Method: GET
URL: {{base_url}}/recipes/no-allergens/1
Headers: (none needed)
Body: (none)
```
Expected Response: `200 OK` with filtered recipes

#### ➕ POST Requests (Create Operations)

**Test 5: Create New Recipe**
```
Method: POST
URL: {{base_url}}/recipes
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "title": "Salade César Végétalienne",
  "description": "Une délicieuse salade césar sans produits animaux",
  "image_url": "https://example.com/image.jpg",
  "cuisine_id": 2,
  "goal_id": 1,
  "DietaryInformation_id": 6,
  "AllergiesInformation_id": 1
}
```
Expected Response: `201 Created` with new recipe object

**Test 6: Add Ingredient to Recipe**
```
Method: POST
URL: {{base_url}}/recipes/1/ingredients
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "ingredient_id": 5,
  "quantity": "100",
  "unit": "grammes"
}
```
Expected Response: `201 Created`

**Test 7: Create New Cuisine**
```
Method: POST
URL: {{base_url}}/cuisines
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "name": "Coréenne"
}
```
Expected Response: `201 Created` with new cuisine object

#### ✏️ PUT Requests (Update Operations)

**Test 8: Update Recipe Title**
```
Method: PUT
URL: {{base_url}}/recipes/1/title
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "title": "Nouveau Titre de Recette"
}
```
Expected Response: `200 OK` with updated recipe

**Test 9: Update Recipe Allergy Info**
```
Method: PUT
URL: {{base_url}}/recipes/1/allergy
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "AllergiesInformation_id": 3
}
```
Expected Response: `200 OK`

**Test 10: Update Recipe Instruction**
```
Method: PUT
URL: {{base_url}}/recipes/1/instructions/2
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "description": "Mélangez délicatement tous les ingrédients"
}
```
Expected Response: `200 OK`

#### 🗑️ DELETE Requests (Delete Operations)

**Test 11: Remove Ingredient from Recipe**
```
Method: DELETE
URL: {{base_url}}/recipes/1/ingredients/3
Headers: (none needed)
Body: (none)
```
Expected Response: `200 OK` or `204 No Content`

**Test 12: Delete Recipe**
```
Method: DELETE
URL: {{base_url}}/recipes/5
Headers: (none needed)
Body: (none)
```
Expected Response: `200 OK` or `204 No Content`

**Test 13: Delete Cuisine**
```
Method: DELETE
URL: {{base_url}}/cuisines/4
Headers: (none needed)
Body: (none)
```
Expected Response: `200 OK` with update message

### 🛡️ Error Testing Scenarios

**Test 14: Invalid Recipe ID**
```
Method: GET
URL: {{base_url}}/recipes/99999
Expected Response: 404 Not Found
```

**Test 15: Invalid JSON Format**
```
Method: POST
URL: {{base_url}}/recipes
Body: {invalid json}
Expected Response: 400 Bad Request
```

**Test 16: Missing Required Fields**
```
Method: POST
URL: {{base_url}}/recipes
Body: {"title": "Only Title"}
Expected Response: 400 Bad Request
```

**Test 17: Non-existent Foreign Key**
```
Method: POST
URL: {{base_url}}/recipes
Body: {
  "title": "Test",
  "cuisine_id": 99999,
  ...
}
Expected Response: 400 Bad Request
```

### 📊 Postman Testing Best Practices

#### 1. **Use Tests Tab for Automated Validation**
Add this JavaScript in the Tests tab:

```javascript
// Test for successful response
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Test response time
pm.test("Response time is less than 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

// Test JSON structure
pm.test("Response has recipes array", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('recipes');
    pm.expect(jsonData.recipes).to.be.an('array');
});
```

#### 2. **Use Pre-request Scripts for Dynamic Data**
```javascript
// Generate random recipe name for testing
pm.globals.set("random_recipe_name", "Test Recipe " + Math.floor(Math.random() * 1000));
```

#### 3. **Organize Tests by Folders**
```
📁 Recipe Website API
  📁 Recipes
    📁 GET Requests
    📁 POST Requests
    📁 PUT Requests
    📁 DELETE Requests
  📁 Cuisines
  📁 Ingredients
  📁 Error Scenarios
```

#### 4. **Use Environment Variables**
- `{{base_url}}` for server URL
- `{{recipe_id}}` for dynamic IDs
- `{{auth_token}}` if you add authentication

### 🔄 Testing Workflow

1. **Start Your Server**
   ```bash
   node app.js
   # or with nodemon:
   npm run dev
   ```

2. **Run Tests in Order**
   - Start with GET requests (read existing data)
   - Test POST requests (create new data)
   - Test PUT requests (update data)
   - Test DELETE requests (clean up)
   - Test error scenarios

3. **Check Database After Each Test**
   ```bash
   sqlite3 recettes.db
   SELECT * FROM Recipes ORDER BY recipe_id DESC LIMIT 5;
   .quit
   ```

### 🎯 Success Criteria

Your API is working correctly when:
- ✅ All GET requests return proper JSON responses
- ✅ POST requests create new records in database
- ✅ PUT requests modify existing records
- ✅ DELETE requests remove records safely
- ✅ Error cases return appropriate HTTP status codes
- ✅ Foreign key relationships are maintained
- ✅ No SQL injection vulnerabilities
- ✅ Response times are reasonable (< 500ms)

### 📱 Alternative Testing Tools

If you don't want to use Postman:
- **Insomnia** - Similar to Postman, free
- **Thunder Client** - VSCode extension
- **curl** - Command line tool
- **REST Client** - VSCode extension

## 🔍 Testing Checklist

- [ ] All GET endpoints return correct data
- [ ] POST endpoints create new records
- [ ] PUT endpoints update existing records
- [ ] DELETE endpoints remove records safely
- [ ] Error handling works for invalid requests
- [ ] Foreign key relationships are maintained
- [ ] Database constraints are respected

## 📚 Additional Considerations

1. **Data Validation:** Validate input data before database operations
2. **SQL Injection Prevention:** Use parameterized queries
3. **CORS:** Add CORS middleware if needed for frontend testing
4. **Logging:** Consider adding request logging
5. **Documentation:** Document your API endpoints

## 🎓 Learning Objectives Achieved

By completing this project, you will:
- Understand REST API design principles
- Master Node.js and Express framework
- Learn SQLite database management
- Practice SQL queries and relationships
- Implement CRUD operations
- Handle errors and edge cases
- Test API endpoints effectively

## 🚨 Common Pitfalls to Avoid

1. Don't forget to handle foreign key constraints
2. Always validate input data
3. Test deletion operations carefully (cascade effects)
4. Remember to close database connections properly
5. Handle async operations correctly
6. Don't expose sensitive error information

## 📖 Resources

- [Express.js Documentation](https://expressjs.com/)
- [SQLite3 Node.js Documentation](https://github.com/mapbox/node-sqlite3)
- [REST API Best Practices](https://restfulapi.net/)

Good luck with your implementation! 🚀