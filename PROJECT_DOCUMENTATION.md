# RecipeWebsite - Backend Project Documentation

## Project Overview
A REST API backend for a recipe website built with Node.js, Express, and SQLite. The goal is to create a fully functional backend without implementing the frontend HTML pages.

## Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Testing**: Browser/API testing tools (Postman, Thunder Client, cURL)

## Database Schema

### Tables Structure

#### 1. Cuisines
Stores different types of cuisine categories.
```sql
cuisine_id INTEGER PRIMARY KEY
name TEXT
```
Examples: Italian, Chinese, French, Mexican, Indian, Mediterranean, American, Thai, Japanese

#### 2. Goals
Stores recipe objectives/goals.
```sql
goal_id INTEGER PRIMARY KEY
name TEXT
```
Examples: Weight loss, High protein, Nutrient-rich, Low calorie, Quick & easy, Family-friendly, Budget-friendly, Special occasions

#### 3. DietaryInformation
Stores dietary category information.
```sql
diet_id INTEGER PRIMARY KEY
name TEXT
```
Examples: Dairy-free, Egg-free, Sugar-free, Gluten-free, Vegetarian, Vegan, Paleo, Ketogenic, Low-carb, Low-fat

#### 4. AllergiesInformation
Stores allergen information.
```sql
allergy_id INTEGER PRIMARY KEY
name TEXT
```
Examples: Gluten, Dairy, Nuts, Seafood, Soy, Eggs, Wheat

#### 5. Ingredients
Stores ingredient information.
```sql
ingredient_id INTEGER PRIMARY KEY
name TEXT
unit TEXT
```

#### 6. Recipes (Main Table)
Stores recipe main information with foreign keys to related tables.
```sql
recipe_id INTEGER PRIMARY KEY
title TEXT
description TEXT
image_url TEXT
cuisine_id INTEGER (FK → Cuisines)
goal_id INTEGER (FK → Goals)
DietaryInformation_id INTEGER (FK → DietaryInformation)
AllergiesInformation_id INTEGER (FK → AllergiesInformation)
```

#### 7. RecipeIngredients (Junction Table)
Many-to-many relationship between recipes and ingredients.
```sql
recipe_id INTEGER (FK → Recipes)
ingredient_id INTEGER (FK → Ingredients)
quantity REAL
PRIMARY KEY (recipe_id, ingredient_id)
```

#### 8. RecipeInstructions
Stores step-by-step cooking instructions.
```sql
instruction_id INTEGER PRIMARY KEY
recipe_id INTEGER (FK → Recipes)
step_number INTEGER
description TEXT
ingredient_id INTEGER (FK → Ingredients)
```

## User Functionality (Optional/Supplemental)

This project includes optional user authentication and user-specific features:
- **User Registration & Login** with JWT authentication
- **User Profile Management** (view, update, delete)
- **Recipe Favorites** - Users can save favorite recipes
- **Recipe Ratings** - Users can rate recipes 1-5 stars
- **Recipe Ownership** - Track who created each recipe

For complete user functionality documentation, see `USER_FUNCTIONALITY.md`

### Additional User Tables:
- **Users** - User accounts with authentication
- **UserFavorites** - Junction table for favorite recipes
- **RecipeRatings** - User ratings for recipes

## Required API Endpoints

### GET Endpoints (Read)
1. `GET /recipes` - Return all recipes
2. `GET /recipes/cuisine/:cuisineId` - Return recipes from a specific cuisine
3. `GET /recipes/no-allergen/:allergenId` - Return recipes without specific allergens
4. `GET /recipes/goal/:goalId` - Return recipes matching a specific goal
5. `GET /recipes/:id` - Return a single recipe with all related information (ingredients, cuisine, allergens, dietary info, description, image, instructions)
6. `GET /` - Home page route
7. `GET /help` - Help and contact page route

### POST Endpoints (Create)
8. `POST /recipes/:recipeId/ingredients` - Add an ingredient to a recipe
9. `POST /cuisines` - Add a new cuisine
10. `POST /recipes` - Add a new recipe with all corresponding information

### PUT/PATCH Endpoints (Update)
11. `PUT /recipes/:id/title` - Update a recipe's name
12. `PUT /recipes/:id/allergy` - Update allergy information for a recipe
13. `PUT /recipes/:id/instructions/:stepId` - Update description of a recipe step

### DELETE Endpoints (Delete)
14. `DELETE /recipes/:recipeId/ingredients/:ingredientId` - Remove an ingredient from a recipe
15. `DELETE /recipes/:id` - Delete a recipe
16. `DELETE /cuisines/:id` - Delete a cuisine (update all recipes with this cuisine to "International")

### User Endpoints (Optional/Supplemental)
17. `POST /users/register` - Register a new user
18. `POST /users/login` - Login and receive JWT token
19. `GET /users/profile` - Get current user profile (requires auth)
20. `PUT /users/profile` - Update user profile (requires auth)
21. `PUT /users/password` - Update password (requires auth)
22. `DELETE /users/profile` - Delete account (requires auth)
23. `GET /users/favorites` - Get user's favorite recipes (requires auth)
24. `POST /users/favorites/:recipeId` - Add recipe to favorites (requires auth)
25. `DELETE /users/favorites/:recipeId` - Remove from favorites (requires auth)
26. `GET /users/ratings` - Get user's ratings (requires auth)

## Project Setup Instructions

### 1. Initialize Project
```bash
npm init
npm install express sqlite3

# Optional: Install user authentication dependencies
npm install jsonwebtoken bcryptjs dotenv
```

### 2. Create Database
```bash
# Create main database tables
sqlite3 recettes.db < database/create_tables.sql

# Optional: Add user functionality
sqlite3 recettes.db < database/user_tables.sql

# Insert sample data
sqlite3 recettes.db < database/insertion.sql
```

### 3. Verify Database Structure
```bash
sqlite3 recettes.db
sqlite> PRAGMA table_info(Recipes);
sqlite> .quit
```

### 4. Project File Structure
```
RecipeWebsite-Project/
├── database/
│   ├── create_tables.sql
│   ├── user_tables.sql        ← User functionality SQL
│   ├── insertion.sql
│   ├── initializeDB.js
│   └── recettes.db
├── config/
│   └── database.js
├── middleware/
│   ├── auth.js                ← JWT authentication
│   ├── validation.js
│   └── errorHandler.js
├── models/
│   ├── Recipe.js
│   ├── Cuisine.js
│   ├── Ingredient.js
│   └── User.js                ← User model
├── controllers/
│   ├── recipeController.js
│   ├── cuisineController.js
│   ├── ingredientController.js
│   └── userController.js      ← User controller
├── routes/
│   ├── recipes.js
│   ├── cuisines.js
│   ├── ingredients.js
│   └── users.js               ← User routes
├── tests/
│   ├── recipes.test.js
│   └── database.test.js
├── utils/
│   └── helpers.js
├── .env                        ← Environment variables
├── app.js
├── package.json
├── PROJECT_DOCUMENTATION.md
├── USER_FUNCTIONALITY.md       ← User features docs
└── MIDDLEWARE_DOCUMENTATION.md ← Middleware docs
```

## Best Practices to Implement

### Error Handling
- Implement proper error handling for all routes
- Return appropriate HTTP status codes
- Provide meaningful error messages

### RESTful Design
- Use proper HTTP methods (GET, POST, PUT/PATCH, DELETE)
- Use meaningful URL structures
- Return consistent JSON responses

### Security Considerations
- Implement authentication if necessary
- Validate all input data
- Use parameterized queries to prevent SQL injection
- Handle CORS appropriately

### Middleware
- Use `express.json()` for parsing JSON request bodies
- Consider adding logging middleware
- Add validation middleware for routes

## Testing Strategy
Test all endpoints using:
- Browser for GET requests
- Postman/Thunder Client/Insomnia for all request types
- Verify CRUD operations work correctly
- Test edge cases and error scenarios

## Additional Notes
- The project focuses on backend functionality only
- No HTML frontend implementation required
- Test endpoints directly via API tools or browser
- Ensure database integrity with foreign key constraints
- Handle cascade deletions appropriately (e.g., when deleting a cuisine)
