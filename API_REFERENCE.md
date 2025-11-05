# Complete API & Middleware Reference

## Table of Contents
1. [Middleware List](#middleware-list)
2. [Recipe Endpoints](#recipe-endpoints)
3. [Cuisine Endpoints](#cuisine-endpoints)
4. [Ingredient Endpoints](#ingredient-endpoints)
5. [User Endpoints](#user-endpoints-optional)
6. [Navigation Endpoints](#navigation-endpoints)
7. [Implementation Checklist](#implementation-checklist)

---

## Middleware List

### Built-in Express Middleware
- ✅ `express.json()` - Parse JSON request bodies
- ✅ `express.urlencoded({ extended: true })` - Parse URL-encoded bodies

### Custom Application Middleware
- ✅ **CORS Middleware** (`app.js:20-30`) - Handle cross-origin requests
- ✅ **Request Logging** (`app.js:33-36`) - Log all incoming requests
- ✅ **404 Handler** (`app.js:89-102`) - Catch undefined routes
- ✅ **Error Handler** (`middleware/errorHandler.js`) - Centralized error handling

### Authentication Middleware
- ✅ `authenticateToken` (`middleware/auth.js`) - Verify JWT token (required)
- ✅ `optionalAuth` (`middleware/auth.js`) - Attach user if token present
- ✅ `generateToken` (`middleware/auth.js`) - Create JWT tokens
- ✅ `checkOwnership` (`middleware/auth.js`) - Verify resource ownership

### Validation Middleware
- ✅ `validateRecipe` (`middleware/validation.js`) - Validate recipe creation
- ✅ `validateRecipeUpdate` (`middleware/validation.js`) - Validate recipe updates
- ✅ `validateCuisine` (`middleware/validation.js`) - Validate cuisine data
- ✅ `validateIngredient` (`middleware/validation.js`) - Validate ingredient data

### TODO: Additional Validation Middleware
- ⬜ `validateDietaryInformation` - Validate dietary info
- ⬜ `validateAllergiesInformation` - Validate allergy info
- ⬜ `validateGoals` - Validate goals
- ⬜ `validateRecipeIngredients` - Validate recipe-ingredient relationships
- ⬜ `validateRecipeInstructions` - Validate cooking instructions

---

## Recipe Endpoints

### GET - Read Operations

#### 1. Get All Recipes
- **Endpoint**: `GET /api/recipes`
- **Description**: Return all recipes with related information
- **Authentication**: Optional
- **Response**: Array of recipes with cuisine, goal, diet, allergy info
- **Status**: ⬜ TODO - Implement in `recipeController.js`

#### 2. Get Recipe by ID
- **Endpoint**: `GET /api/recipes/:id`
- **Description**: Return single recipe with all information (ingredients, instructions, cuisine, allergens, dietary info, image)
- **Authentication**: Optional
- **Parameters**: `id` (recipe_id)
- **Response**: Complete recipe object with all related data
- **Status**: ⬜ TODO - Implement in `recipeController.js`

#### 3. Get Recipes by Cuisine
- **Endpoint**: `GET /api/recipes/cuisine/:cuisineId`
- **Description**: Return all recipes from a specific cuisine
- **Authentication**: Optional
- **Parameters**: `cuisineId` (cuisine_id)
- **Response**: Array of recipes matching cuisine
- **Status**: ⬜ TODO - Implement in `recipeController.js`

#### 4. Get Recipes Without Allergens
- **Endpoint**: `GET /api/recipes/no-allergens/:allergyId`
- **Description**: Return recipes that do NOT contain specific allergens
- **Authentication**: Optional
- **Parameters**: `allergyId` (allergy_id)
- **Response**: Array of safe recipes
- **Status**: ⬜ TODO - Implement in `recipeController.js`

#### 5. Get Recipes by Goal
- **Endpoint**: `GET /api/recipes/goal/:goalId`
- **Description**: Return recipes matching a specific goal (weight loss, high protein, etc.)
- **Authentication**: Optional
- **Parameters**: `goalId` (goal_id)
- **Response**: Array of recipes matching goal
- **Status**: ⬜ TODO - Implement in `recipeController.js`

### POST - Create Operations

#### 6. Create Recipe
- **Endpoint**: `POST /api/recipes`
- **Description**: Add a new recipe with all information
- **Authentication**: Required (optional - can be public)
- **Middleware**: `validateRecipe` (optional: `authenticateToken`)
- **Body**:
  ```json
  {
    "title": "Recipe Name",
    "description": "Recipe description",
    "image_url": "https://...",
    "cuisine_id": 1,
    "goal_id": 1,
    "DietaryInformation_id": 1,
    "AllergiesInformation_id": 1,
    "user_id": 1
  }
  ```
- **Status**: ⬜ TODO - Implement in `recipeController.js`

#### 7. Add Ingredient to Recipe
- **Endpoint**: `POST /api/recipes/:recipeId/ingredients`
- **Description**: Add an ingredient to an existing recipe
- **Authentication**: Optional
- **Parameters**: `recipeId` (recipe_id)
- **Body**:
  ```json
  {
    "ingredient_id": 1,
    "quantity": 2.5
  }
  ```
- **Status**: ⬜ TODO - Implement in `recipeController.js`

### PUT/PATCH - Update Operations

#### 8. Update Recipe Title
- **Endpoint**: `PUT /api/recipes/:id/title`
- **Description**: Update a recipe's title/name
- **Authentication**: Optional (recommended with ownership check)
- **Middleware**: `validateRecipeUpdate`
- **Parameters**: `id` (recipe_id)
- **Body**: `{ "title": "New Title" }`
- **Status**: ⬜ TODO - Implement in `recipeController.js`

#### 9. Update Recipe Allergy Information
- **Endpoint**: `PUT /api/recipes/:id/allergy`
- **Description**: Update the allergy information for a recipe
- **Authentication**: Optional
- **Parameters**: `id` (recipe_id)
- **Body**: `{ "AllergiesInformation_id": 2 }`
- **Status**: ⬜ TODO - Implement in `recipeController.js`

#### 10. Update Recipe Instruction Step
- **Endpoint**: `PUT /api/recipes/:id/instructions/:stepId`
- **Description**: Update the description of a specific recipe step
- **Authentication**: Optional
- **Parameters**: `id` (recipe_id), `stepId` (instruction_id)
- **Body**: `{ "description": "Updated instruction text" }`
- **Status**: ⬜ TODO - Implement in `recipeController.js`

### DELETE - Delete Operations

#### 11. Delete Recipe
- **Endpoint**: `DELETE /api/recipes/:id`
- **Description**: Delete a recipe
- **Authentication**: Optional (recommended with ownership check)
- **Parameters**: `id` (recipe_id)
- **Status**: ⬜ TODO - Implement in `recipeController.js`

#### 12. Remove Ingredient from Recipe
- **Endpoint**: `DELETE /api/recipes/:recipeId/ingredients/:ingredientId`
- **Description**: Remove an ingredient from a recipe
- **Authentication**: Optional
- **Parameters**: `recipeId`, `ingredientId`
- **Status**: ⬜ TODO - Implement in `recipeController.js`

---

## Cuisine Endpoints

### GET Operations

#### 13. Get All Cuisines
- **Endpoint**: `GET /api/cuisines`
- **Description**: Return all cuisine types
- **Authentication**: No
- **Response**: Array of cuisines
- **Status**: ⬜ TODO - Implement in `cuisineController.js`

#### 14. Get Cuisine by ID
- **Endpoint**: `GET /api/cuisines/:id`
- **Description**: Return specific cuisine details
- **Authentication**: No
- **Parameters**: `id` (cuisine_id)
- **Status**: ⬜ TODO - Implement in `cuisineController.js`

### POST Operations

#### 15. Create Cuisine
- **Endpoint**: `POST /api/cuisines`
- **Description**: Add a new cuisine type
- **Authentication**: Optional
- **Middleware**: `validateCuisine`
- **Body**: `{ "name": "Cuisine Name" }`
- **Status**: ⬜ TODO - Implement in `cuisineController.js`

### PUT Operations

#### 16. Update Cuisine
- **Endpoint**: `PUT /api/cuisines/:id`
- **Description**: Update cuisine name
- **Authentication**: Optional
- **Middleware**: `validateCuisine`
- **Parameters**: `id` (cuisine_id)
- **Body**: `{ "name": "Updated Name" }`
- **Status**: ⬜ TODO - Implement in `cuisineController.js`

### DELETE Operations

#### 17. Delete Cuisine
- **Endpoint**: `DELETE /api/cuisines/:id`
- **Description**: Delete a cuisine (set all recipes with this cuisine to "International")
- **Authentication**: Optional
- **Parameters**: `id` (cuisine_id)
- **Note**: Must update all recipes using this cuisine before deletion
- **Status**: ⬜ TODO - Implement in `cuisineController.js`

---

## Ingredient Endpoints

### GET Operations

#### 18. Get All Ingredients
- **Endpoint**: `GET /api/ingredients`
- **Description**: Return all ingredients
- **Authentication**: No
- **Status**: ⬜ TODO - Implement in `ingredientController.js`

#### 19. Get Ingredient by ID
- **Endpoint**: `GET /api/ingredients/:id`
- **Description**: Return specific ingredient
- **Authentication**: No
- **Parameters**: `id` (ingredient_id)
- **Status**: ⬜ TODO - Implement in `ingredientController.js`

### POST Operations

#### 20. Create Ingredient
- **Endpoint**: `POST /api/ingredients`
- **Description**: Add a new ingredient
- **Authentication**: Optional
- **Middleware**: `validateIngredient`
- **Body**:
  ```json
  {
    "name": "Ingredient Name",
    "unit": "grams"
  }
  ```
- **Status**: ⬜ TODO - Implement in `ingredientController.js`

### PUT Operations

#### 21. Update Ingredient
- **Endpoint**: `PUT /api/ingredients/:id`
- **Description**: Update ingredient details
- **Authentication**: Optional
- **Parameters**: `id` (ingredient_id)
- **Status**: ⬜ TODO - Implement in `ingredientController.js`

### DELETE Operations

#### 22. Delete Ingredient
- **Endpoint**: `DELETE /api/ingredients/:id`
- **Description**: Delete an ingredient
- **Authentication**: Optional
- **Parameters**: `id` (ingredient_id)
- **Status**: ⬜ TODO - Implement in `ingredientController.js`

---

## User Endpoints (Optional)

### Public Authentication Endpoints

#### 23. Register User
- **Endpoint**: `POST /api/users/register`
- **Description**: Register a new user account
- **Authentication**: No
- **Body**:
  ```json
  {
    "username": "user123",
    "email": "user@example.com",
    "password": "password123",
    "first_name": "First",
    "last_name": "Last"
  }
  ```
- **Response**: User object + JWT token
- **Status**: ✅ IMPLEMENTED in `userController.js`

#### 24. Login User
- **Endpoint**: `POST /api/users/login`
- **Description**: Login and receive JWT token
- **Authentication**: No
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: User object + JWT token
- **Status**: ✅ IMPLEMENTED in `userController.js`

#### 25. Get All Users
- **Endpoint**: `GET /api/users`
- **Description**: Get all users (for testing/admin)
- **Authentication**: No (should be admin-only in production)
- **Status**: ✅ IMPLEMENTED in `userController.js`

### Protected Profile Endpoints

#### 26. Get User Profile
- **Endpoint**: `GET /api/users/profile`
- **Description**: Get current user's profile
- **Authentication**: Required
- **Middleware**: `authenticateToken`
- **Status**: ✅ IMPLEMENTED in `userController.js`

#### 27. Update User Profile
- **Endpoint**: `PUT /api/users/profile`
- **Description**: Update user profile information
- **Authentication**: Required
- **Middleware**: `authenticateToken`
- **Body**: `{ "username": "...", "email": "...", "first_name": "...", "last_name": "..." }`
- **Status**: ✅ IMPLEMENTED in `userController.js`

#### 28. Update Password
- **Endpoint**: `PUT /api/users/password`
- **Description**: Change user password
- **Authentication**: Required
- **Middleware**: `authenticateToken`
- **Body**: `{ "currentPassword": "...", "newPassword": "..." }`
- **Status**: ✅ IMPLEMENTED in `userController.js`

#### 29. Delete User Account
- **Endpoint**: `DELETE /api/users/profile`
- **Description**: Delete user account
- **Authentication**: Required
- **Middleware**: `authenticateToken`
- **Status**: ✅ IMPLEMENTED in `userController.js`

### Protected Favorites Endpoints

#### 30. Get User Favorites
- **Endpoint**: `GET /api/users/favorites`
- **Description**: Get user's favorite recipes
- **Authentication**: Required
- **Middleware**: `authenticateToken`
- **Status**: ✅ IMPLEMENTED in `userController.js`

#### 31. Add Recipe to Favorites
- **Endpoint**: `POST /api/users/favorites/:recipeId`
- **Description**: Add a recipe to favorites
- **Authentication**: Required
- **Middleware**: `authenticateToken`
- **Parameters**: `recipeId` (recipe_id)
- **Status**: ✅ IMPLEMENTED in `userController.js`

#### 32. Remove Recipe from Favorites
- **Endpoint**: `DELETE /api/users/favorites/:recipeId`
- **Description**: Remove recipe from favorites
- **Authentication**: Required
- **Middleware**: `authenticateToken`
- **Parameters**: `recipeId` (recipe_id)
- **Status**: ✅ IMPLEMENTED in `userController.js`

### Protected Ratings Endpoints

#### 33. Get User Ratings
- **Endpoint**: `GET /api/users/ratings`
- **Description**: Get all ratings by user
- **Authentication**: Required
- **Middleware**: `authenticateToken`
- **Status**: ✅ IMPLEMENTED in `userController.js`

#### 34. Rate a Recipe (TODO)
- **Endpoint**: `POST /api/recipes/:recipeId/rate`
- **Description**: Add or update rating for a recipe
- **Authentication**: Required
- **Middleware**: `authenticateToken`
- **Body**: `{ "rating": 5, "review_text": "Excellent!" }`
- **Status**: ⬜ TODO - Need to implement

#### 35. Get Recipe Ratings (TODO)
- **Endpoint**: `GET /api/recipes/:recipeId/ratings`
- **Description**: Get all ratings for a specific recipe
- **Authentication**: No
- **Status**: ⬜ TODO - Need to implement

---

## Navigation Endpoints

#### 36. Home Page
- **Endpoint**: `GET /`
- **Description**: API information and available endpoints
- **Authentication**: No
- **Status**: ✅ IMPLEMENTED in `app.js`

#### 37. Help Page
- **Endpoint**: `GET /help`
- **Description**: Help and contact information
- **Authentication**: No
- **Status**: ✅ IMPLEMENTED in `app.js`

---

## Implementation Checklist

### Phase 1: Core Recipe Functionality (Required)
- ⬜ Implement Recipe Model methods (Recipe.js)
  - ⬜ `findAll()` - Get all recipes
  - ⬜ `findById(id)` - Get recipe by ID
  - ⬜ `findByCuisine(cuisineId)` - Get recipes by cuisine
  - ⬜ `findByGoal(goalId)` - Get recipes by goal
  - ⬜ `findWithoutAllergen(allergyId)` - Get safe recipes
  - ⬜ `create(data)` - Create new recipe
  - ⬜ `update(id, data)` - Update recipe
  - ⬜ `delete(id)` - Delete recipe
  - ⬜ `addIngredient(recipeId, ingredientId, quantity)` - Add ingredient
  - ⬜ `removeIngredient(recipeId, ingredientId)` - Remove ingredient

- ⬜ Implement Recipe Controller methods (recipeController.js)
  - ⬜ `getAllRecipes` - Endpoint 1
  - ⬜ `getRecipeById` - Endpoint 2
  - ⬜ `getRecipesByCuisine` - Endpoint 3
  - ⬜ `getRecipesWithoutAllergen` - Endpoint 4
  - ⬜ `getRecipesByGoal` - Endpoint 5
  - ⬜ `createRecipe` - Endpoint 6
  - ⬜ `addIngredientToRecipe` - Endpoint 7
  - ⬜ `updateRecipeTitle` - Endpoint 8
  - ⬜ `updateRecipeAllergy` - Endpoint 9
  - ⬜ `updateRecipeInstruction` - Endpoint 10
  - ⬜ `deleteRecipe` - Endpoint 11
  - ⬜ `removeIngredientFromRecipe` - Endpoint 12

### Phase 2: Cuisine Management (Required)
- ⬜ Implement Cuisine Model methods (Cuisine.js)
  - ⬜ `findAll()` - Get all cuisines
  - ⬜ `findById(id)` - Get cuisine by ID
  - ⬜ `create(data)` - Create cuisine
  - ⬜ `update(id, data)` - Update cuisine
  - ⬜ `delete(id)` - Delete cuisine (with recipe update)

- ⬜ Implement Cuisine Controller methods (cuisineController.js)
  - ⬜ `getAllCuisines` - Endpoint 13
  - ⬜ `getCuisineById` - Endpoint 14
  - ⬜ `createCuisine` - Endpoint 15
  - ⬜ `updateCuisine` - Endpoint 16
  - ⬜ `deleteCuisine` - Endpoint 17

### Phase 3: Ingredient Management (Required)
- ⬜ Implement Ingredient Model methods (Ingredient.js)
  - ⬜ `findAll()` - Get all ingredients
  - ⬜ `findById(id)` - Get ingredient by ID
  - ⬜ `create(data)` - Create ingredient
  - ⬜ `update(id, data)` - Update ingredient
  - ⬜ `delete(id)` - Delete ingredient

- ⬜ Implement Ingredient Controller methods (ingredientController.js)
  - ⬜ `getAllIngredients` - Endpoint 18
  - ⬜ `getIngredientById` - Endpoint 19
  - ⬜ `createIngredient` - Endpoint 20
  - ⬜ `updateIngredient` - Endpoint 21
  - ⬜ `deleteIngredient` - Endpoint 22

### Phase 4: User System (Optional/Bonus)
- ✅ User Model - COMPLETE
- ✅ User Controller - COMPLETE
- ✅ User Routes - COMPLETE
- ✅ Authentication Middleware - COMPLETE
- ⬜ Recipe Rating System - TODO
  - ⬜ `POST /api/recipes/:recipeId/rate` - Rate recipe
  - ⬜ `GET /api/recipes/:recipeId/ratings` - Get ratings
  - ⬜ Update average_rating and total_ratings

### Phase 5: Testing & Documentation
- ⬜ Write unit tests for models
- ⬜ Write integration tests for controllers
- ⬜ Test all endpoints with Postman
- ⬜ Create Postman collection
- ⬜ Add error handling to all endpoints
- ⬜ Validate all user inputs

---

## Quick Reference Table

| # | Method | Endpoint | Auth | Status |
|---|--------|----------|------|--------|
| 1 | GET | /api/recipes | No | ⬜ TODO |
| 2 | GET | /api/recipes/:id | No | ⬜ TODO |
| 3 | GET | /api/recipes/cuisine/:cuisineId | No | ⬜ TODO |
| 4 | GET | /api/recipes/no-allergens/:allergyId | No | ⬜ TODO |
| 5 | GET | /api/recipes/goal/:goalId | No | ⬜ TODO |
| 6 | POST | /api/recipes | Optional | ⬜ TODO |
| 7 | POST | /api/recipes/:recipeId/ingredients | No | ⬜ TODO |
| 8 | PUT | /api/recipes/:id/title | No | ⬜ TODO |
| 9 | PUT | /api/recipes/:id/allergy | No | ⬜ TODO |
| 10 | PUT | /api/recipes/:id/instructions/:stepId | No | ⬜ TODO |
| 11 | DELETE | /api/recipes/:id | Optional | ⬜ TODO |
| 12 | DELETE | /api/recipes/:recipeId/ingredients/:ingredientId | No | ⬜ TODO |
| 13 | GET | /api/cuisines | No | ⬜ TODO |
| 14 | GET | /api/cuisines/:id | No | ⬜ TODO |
| 15 | POST | /api/cuisines | No | ⬜ TODO |
| 16 | PUT | /api/cuisines/:id | No | ⬜ TODO |
| 17 | DELETE | /api/cuisines/:id | No | ⬜ TODO |
| 18 | GET | /api/ingredients | No | ⬜ TODO |
| 19 | GET | /api/ingredients/:id | No | ⬜ TODO |
| 20 | POST | /api/ingredients | No | ⬜ TODO |
| 21 | PUT | /api/ingredients/:id | No | ⬜ TODO |
| 22 | DELETE | /api/ingredients/:id | No | ⬜ TODO |
| 23 | POST | /api/users/register | No | ✅ DONE |
| 24 | POST | /api/users/login | No | ✅ DONE |
| 25 | GET | /api/users | No | ✅ DONE |
| 26 | GET | /api/users/profile | Yes | ✅ DONE |
| 27 | PUT | /api/users/profile | Yes | ✅ DONE |
| 28 | PUT | /api/users/password | Yes | ✅ DONE |
| 29 | DELETE | /api/users/profile | Yes | ✅ DONE |
| 30 | GET | /api/users/favorites | Yes | ✅ DONE |
| 31 | POST | /api/users/favorites/:recipeId | Yes | ✅ DONE |
| 32 | DELETE | /api/users/favorites/:recipeId | Yes | ✅ DONE |
| 33 | GET | /api/users/ratings | Yes | ✅ DONE |
| 34 | POST | /api/recipes/:recipeId/rate | Yes | ⬜ TODO |
| 35 | GET | /api/recipes/:recipeId/ratings | No | ⬜ TODO |
| 36 | GET | / | No | ✅ DONE |
| 37 | GET | /help | No | ✅ DONE |

---

## Summary

### Total Endpoints: 37
- **Required (Core Project)**: 22 endpoints (1-22)
- **Optional (User System)**: 15 endpoints (23-37)

### Implementation Status
- ✅ **Complete**: 13 endpoints (all user system + navigation)
- ⬜ **TODO**: 24 endpoints (recipes, cuisines, ingredients, ratings)

### Middleware Status
- ✅ **Complete**: 8 middleware functions
- ⬜ **TODO**: 5 validation middleware functions

---

**Last Updated**: 2025-11-04
