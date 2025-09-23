# TODO Implementation Guide

This guide shows you exactly where all the TODO comments are located and how to implement them step by step.

## 📍 **TODO Comments Location Map**

### 🎯 **Controllers** (Business Logic - START HERE!)

#### `controllers/recipeController.js` - 12 TODO items
```javascript
// TODO: Implement get all recipes logic
// TODO: Implement get recipe by ID logic
// TODO: Implement get recipes by cuisine logic
// TODO: Implement get recipes without allergen logic
// TODO: Implement get recipes by goal logic
// TODO: Implement create recipe logic
// TODO: Implement update recipe title logic
// TODO: Implement update recipe allergy logic
// TODO: Implement update recipe instruction logic
// TODO: Implement delete recipe logic
// TODO: Implement add ingredient to recipe logic
// TODO: Implement remove ingredient from recipe logic
```

#### `controllers/cuisineController.js` - 5 TODO items
```javascript
// TODO: Implement get all cuisines logic
// TODO: Implement get cuisine by ID logic
// TODO: Implement create cuisine logic
// TODO: Implement update cuisine logic
// TODO: Implement delete cuisine logic (update related recipes to "International")
```

#### `controllers/ingredientController.js` - 5 TODO items
```javascript
// TODO: Implement get all ingredients logic
// TODO: Implement get ingredient by ID logic
// TODO: Implement create ingredient logic
// TODO: Implement update ingredient logic
// TODO: Implement delete ingredient logic
```

### 🗄️ **Models** (Database Queries - IMPLEMENT SECOND!)

#### `models/Recipe.js` - 12 TODO items
```javascript
// TODO: Implement static method to get all recipes with joined data
// TODO: Implement static method to find recipe by ID
// TODO: Implement static method to find recipes by cuisine
// TODO: Implement static method to find recipes without specific allergen
// TODO: Implement static method to find recipes by goal
// TODO: Implement static method to create new recipe
// TODO: Implement static method to update recipe title
// TODO: Implement static method to update recipe allergy information
// TODO: Implement static method to delete recipe
// TODO: Implement method to get recipe ingredients
// TODO: Implement method to get recipe instructions
// TODO: Implement method to add ingredient to recipe
// TODO: Implement method to remove ingredient from recipe
```

#### `models/Cuisine.js` - 6 TODO items
```javascript
// TODO: Implement static method to get all cuisines
// TODO: Implement static method to find cuisine by ID
// TODO: Implement static method to create new cuisine
// TODO: Implement static method to update cuisine
// TODO: Implement static method to delete cuisine
// TODO: Implement method to check if cuisine name already exists
// TODO: Implement method to get recipes count for this cuisine
```

#### `models/Ingredient.js` - 8 TODO items
```javascript
// TODO: Implement static method to get all ingredients
// TODO: Implement static method to find ingredient by ID
// TODO: Implement static method to create new ingredient
// TODO: Implement static method to update ingredient
// TODO: Implement static method to delete ingredient
// TODO: Implement method to check if ingredient name already exists
// TODO: Implement method to get recipes that use this ingredient
// TODO: Implement method to search ingredients by name
```

### 🛠️ **Utilities & Support**

#### `utils/helpers.js` - 8 TODO items
```javascript
// TODO: Implement utility function to format recipe data for API response
// TODO: Implement utility function to validate foreign key existence
// TODO: Implement utility function to generate SQL WHERE clauses for filtering
// TODO: Implement utility function to handle pagination
// TODO: Implement utility function to sanitize user input
// TODO: Implement utility function to format error responses
// TODO: Implement utility function to validate recipe data completeness
// TODO: Implement utility function to convert database row to model instance
```

#### `middleware/validation.js` - 1 TODO item
```javascript
// TODO: Add more validation middlewares as needed
// - validateDietaryInformation
// - validateAllergiesInformation
// - validateGoals
// - validateRecipeIngredients
// - validateRecipeInstructions
```

### 🧪 **Tests** (Implement After Core Logic)

#### `tests/recipes.test.js` - 8 TODO items
```javascript
// TODO: Implement test for getting all recipes
// TODO: Implement test for getting recipe by ID
// TODO: Implement test for non-existent recipe
// TODO: Implement test for creating recipe
// TODO: Implement test for validation errors
// TODO: Implement test for updating recipe title
// TODO: Implement test for deleting recipe
// TODO: Add more tests for all endpoints
// TODO: Add test setup and teardown
```

#### `tests/database.test.js` - 8 TODO items
```javascript
// TODO: Implement database connection test
// TODO: Implement database close test
// TODO: Implement Recipe model tests
// TODO: Implement Recipe.findAll() test
// TODO: Implement Cuisine model tests
// TODO: Implement Ingredient model tests
// TODO: Add tests for database schema validation, foreign keys, etc.
// TODO: Setup test database
```

## 🚀 **Implementation Order & Strategy**

### **Phase 1: Database Foundation (Models)**
**Start Here - Priority 1**

1. **`models/Recipe.js`**
   ```javascript
   // Replace this:
   reject(new Error('Method not implemented yet'));

   // With actual SQLite queries:
   static async findAll() {
       return new Promise((resolve, reject) => {
           const sql = `SELECT r.*, c.name as cuisine_name FROM Recipes r LEFT JOIN Cuisines c ON r.cuisine_id = c.cuisine_id`;
           database.getDB().all(sql, [], (err, rows) => {
               if (err) reject(err);
               else resolve(rows.map(row => new Recipe(row)));
           });
       });
   }
   ```

2. **`models/Cuisine.js`** - Implement basic CRUD operations
3. **`models/Ingredient.js`** - Implement ingredient management

### **Phase 2: Business Logic (Controllers)**
**Priority 2 - After Models Work**

1. **`controllers/recipeController.js`**
   ```javascript
   // Replace this:
   res.json({ success: true, message: 'Get all recipes - TODO: Implement' });

   // With actual model calls:
   async getAllRecipes(req, res, next) {
       try {
           const recipes = await Recipe.findAll();
           res.json({ success: true, count: recipes.length, data: recipes });
       } catch (error) {
           next(error);
       }
   }
   ```

2. **`controllers/cuisineController.js`** - Connect cuisine models
3. **`controllers/ingredientController.js`** - Connect ingredient models

### **Phase 3: Testing & Enhancement**
**Priority 3 - After Core Features Work**

1. **`tests/recipes.test.js`** - Test all recipe endpoints
2. **`tests/database.test.js`** - Test database operations
3. **`utils/helpers.js`** - Add utility functions
4. **`middleware/validation.js`** - Add more validation

## 💡 **Implementation Examples**

### **Example 1: Recipe Model Implementation**
```javascript
// In models/Recipe.js - Replace TODO with:
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
```

### **Example 2: Controller Implementation**
```javascript
// In controllers/recipeController.js - Replace TODO with:
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
```

### **Example 3: Test Implementation**
```javascript
// In tests/recipes.test.js - Replace TODO with:
test('should get all recipes', async () => {
    const response = await request(app)
        .get('/api/recipes')
        .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
});
```

## 🎯 **Quick Start Checklist**

### **Week 1: Models (Database Layer)**
- [ ] Implement `Recipe.findAll()`
- [ ] Implement `Recipe.findById()`
- [ ] Implement `Recipe.create()`
- [ ] Test database connection works

### **Week 2: Controllers (Business Logic)**
- [ ] Implement `getAllRecipes()` controller
- [ ] Implement `getRecipeById()` controller
- [ ] Implement `createRecipe()` controller
- [ ] Test endpoints with Postman

### **Week 3: Complete Features**
- [ ] Implement all remaining recipe operations
- [ ] Implement cuisine operations
- [ ] Implement ingredient operations
- [ ] Add proper error handling

### **Week 4: Testing & Polish**
- [ ] Write unit tests
- [ ] Add validation logic
- [ ] Implement utility functions
- [ ] Final testing and documentation

## 🔧 **Development Tips**

1. **Start Small**: Implement one method at a time
2. **Test Frequently**: Use Postman after each implementation
3. **Use Console.log**: Debug SQL queries and data flow
4. **Check Database**: Verify data changes with SQLite commands
5. **Follow Patterns**: Copy successful patterns to similar methods

## 📚 **Reference Files**

- **Database Schema**: Check your `InsertionDB.sql` for table structure
- **Student Guide**: `RecipeWebsite_Student_Guide.md` for complete instructions
- **Postman Guide**: Section in student guide for testing endpoints
- **Package.json**: Run `npm run dev` for development mode

## 🆘 **Common Issues & Solutions**

1. **Database Connection Error**: Check `config/database.js` path
2. **SQL Syntax Error**: Test queries in SQLite command line first
3. **Foreign Key Issues**: Validate IDs exist before insertion
4. **JSON Parsing Error**: Check request body format in Postman
5. **Route Not Found**: Verify route definitions in `routes/` files

---

**Remember**: Each TODO comment is a specific task. Start with the easiest ones (like `findAll()`) and build up to complex operations. Good luck! 🚀