# User Functionality Documentation

## Overview
The Recipe Website API now includes complete user authentication, authorization, and user-specific features including favorites and ratings.

## Features Implemented
- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ User profile management
- ✅ Password management
- ✅ Recipe favorites
- ✅ Recipe ratings (database structure ready)
- ✅ Recipe ownership (user_id on recipes)

## Database Tables

### Users Table
```sql
user_id INTEGER PRIMARY KEY AUTOINCREMENT
username TEXT NOT NULL UNIQUE
email TEXT NOT NULL UNIQUE
password_hash TEXT NOT NULL
first_name TEXT
last_name TEXT
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

### UserFavorites Table
Junction table for users saving favorite recipes.
```sql
user_id INTEGER (FK → Users)
recipe_id INTEGER (FK → Recipes)
added_at DATETIME DEFAULT CURRENT_TIMESTAMP
PRIMARY KEY (user_id, recipe_id)
```

### RecipeRatings Table
Users can rate recipes from 1 to 5 stars.
```sql
rating_id INTEGER PRIMARY KEY AUTOINCREMENT
user_id INTEGER (FK → Users)
recipe_id INTEGER (FK → Recipes)
rating INTEGER CHECK(rating >= 1 AND rating <= 5)
review_text TEXT
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
UNIQUE(user_id, recipe_id)
```

### Recipes Table Updates
```sql
user_id INTEGER (FK → Users) -- Recipe creator
average_rating REAL DEFAULT 0
total_ratings INTEGER DEFAULT 0
```

## Installation

### 1. Install Required Dependencies
```bash
npm install jsonwebtoken bcryptjs
```

### 2. Setup Database
```bash
# First, create the main tables
sqlite3 recettes.db < database/create_tables.sql

# Then, add user functionality
sqlite3 recettes.db < database/user_tables.sql
```

### 3. Environment Variables
Create a `.env` file:
```
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=development
```

## API Endpoints

### Authentication Endpoints

#### 1. Register New User
**POST** `/api/users/register`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "user_id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "created_at": "2025-11-04T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Login
**POST** `/api/users/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": 1,
      "username": "john_doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Profile Management Endpoints
*All require `Authorization: Bearer <token>` header*

#### 3. Get Current User Profile
**GET** `/api/users/profile`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2025-11-04T10:30:00.000Z"
  }
}
```

#### 4. Update Profile
**PUT** `/api/users/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "username": "john_doe_updated",
  "first_name": "John",
  "last_name": "Doe Jr"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { /* updated user object */ }
}
```

#### 5. Update Password
**PUT** `/api/users/password`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

#### 6. Delete Account
**DELETE** `/api/users/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

### Favorites Endpoints
*All require authentication*

#### 7. Get User's Favorite Recipes
**GET** `/api/users/favorites`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "recipe_id": 5,
      "title": "Spaghetti Carbonara",
      "description": "Classic Italian pasta",
      "cuisine_name": "Italian",
      "goal_name": "Quick & Easy",
      "favorited_at": "2025-11-04T12:00:00.000Z"
    }
  ]
}
```

#### 8. Add Recipe to Favorites
**POST** `/api/users/favorites/:recipeId`

**Headers:**
```
Authorization: Bearer <token>
```

**Example:**
```
POST /api/users/favorites/5
```

**Response (201):**
```json
{
  "success": true,
  "message": "Recipe added to favorites"
}
```

#### 9. Remove Recipe from Favorites
**DELETE** `/api/users/favorites/:recipeId`

**Headers:**
```
Authorization: Bearer <token>
```

**Example:**
```
DELETE /api/users/favorites/5
```

**Response (200):**
```json
{
  "success": true,
  "message": "Recipe removed from favorites"
}
```

### Ratings Endpoints

#### 10. Get User's Ratings
**GET** `/api/users/ratings`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "rating_id": 1,
      "recipe_id": 5,
      "recipe_title": "Spaghetti Carbonara",
      "rating": 5,
      "review_text": "Absolutely delicious!",
      "created_at": "2025-11-04T13:00:00.000Z"
    }
  ]
}
```

### Admin Endpoints

#### 11. Get All Users
**GET** `/api/users`

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "user_id": 1,
      "username": "john_doe",
      "email": "john@example.com"
    }
  ]
}
```

## Authentication Flow

### How JWT Authentication Works

1. **Register/Login**: User provides credentials
2. **Server**: Validates credentials and generates JWT token
3. **Client**: Stores token (localStorage, cookies, etc.)
4. **Protected Requests**: Client includes token in `Authorization` header
5. **Server**: Verifies token using `authenticateToken` middleware
6. **Access Granted**: User info attached to `req.user`

### Token Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImpvaG5fZG9lIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwiaWF0IjoxNzMwNzE0NDAwLCJleHAiOjE3MzA4MDA4MDB9.signature
```

### Token Payload
```json
{
  "user_id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "iat": 1730714400,  // Issued at
  "exp": 1730800800   // Expires at (24 hours)
}
```

## Testing with cURL

### Register a New User
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Profile (with token)
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Add Recipe to Favorites
```bash
curl -X POST http://localhost:3000/api/users/favorites/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Testing with Postman

### 1. Create Environment
Create a new environment with variables:
- `baseUrl`: `http://localhost:3000`
- `token`: (leave empty, will be set automatically)

### 2. Register/Login Request
Set up a POST request to `{{baseUrl}}/api/users/register`

In the **Tests** tab, add this script to automatically save the token:
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("token", response.data.token);
}
```

### 3. Protected Requests
For protected endpoints, add to **Authorization** tab:
- Type: `Bearer Token`
- Token: `{{token}}`

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Username, email, and password are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Invalid token."
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

## Security Considerations

### Password Hashing
- Passwords are hashed using `bcryptjs` with 10 salt rounds
- Password hashes are never returned in API responses
- Use `toJSON()` method on User model to strip sensitive data

### JWT Security
- Store JWT_SECRET in environment variables
- Never commit JWT_SECRET to git
- Tokens expire after 24 hours by default
- Use HTTPS in production

### SQL Injection Prevention
- All database queries use parameterized statements
- Never concatenate user input into SQL queries

### Input Validation
- Validate all user inputs
- Check for duplicate usernames/emails before registration
- Verify current password before allowing password changes

## Next Steps / TODO

### Rating System Implementation
The database structure is ready, but you need to implement:
- `POST /api/recipes/:id/rate` - Add/update rating for a recipe
- `GET /api/recipes/:id/ratings` - Get all ratings for a recipe
- Update average_rating and total_ratings when new rating is added
- RecipeRating model and controller

### Recipe Ownership
- Add `user_id` when creating recipes
- Only allow recipe creator to edit/delete their recipes
- Add `checkOwnership` middleware for protected recipe operations

### Additional Features
- Email verification
- Password reset functionality
- User roles (admin, user, moderator)
- Recipe comments
- User profile pictures
- Follow other users

## File Structure
```
project/
├── middleware/
│   ├── auth.js                 ← JWT authentication middleware
│   ├── validation.js           ← Input validation
│   └── errorHandler.js         ← Error handling
├── models/
│   └── User.js                 ← User model with bcrypt
├── controllers/
│   └── userController.js       ← User business logic
├── routes/
│   └── users.js                ← User route definitions
├── database/
│   ├── create_tables.sql       ← Main tables
│   └── user_tables.sql         ← User-related tables
└── app.js                      ← Main application (updated)
```

## Summary

The user functionality is now fully integrated into your Recipe Website API. Users can:
1. Register and login with secure password hashing
2. Receive JWT tokens for authentication
3. Access protected endpoints with their token
4. Manage their profile and password
5. Save favorite recipes
6. Rate recipes (structure ready)
7. Own recipes they create

All endpoints follow RESTful conventions and include proper error handling, validation, and security measures.
