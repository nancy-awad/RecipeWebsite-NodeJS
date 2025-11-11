# Recipe Website API - Student Setup Guide

Complete guide for setting up and running the Recipe Website API project.

---

## 📋 Table of Contents

1. [Required Files](#required-files)
2. [Prerequisites](#prerequisites)
3. [Installation Steps](#installation-steps)
4. [Database Setup](#database-setup)
5. [Starting the Server](#starting-the-server)
6. [Testing the API](#testing-the-api)
7. [Troubleshooting](#troubleshooting)

---

## 📁 Required Files

Make sure you have received ALL of the following files and folders:

### Root Files
```
recipe-website-api/
├── app.js                      # Main application entry point (REQUIRED)
├── package.json                # Dependencies and scripts (REQUIRED)
├── .env.example               # Environment variables template (REQUIRED)
├── .gitignore                 # Git ignore file (optional)
└── README.md                  # Project overview (optional)
```

### Folders and Their Contents

#### `/config` - Database Configuration
```
config/
└── database.js                # Database connection setup (REQUIRED)
```

#### `/database` - Database Files
```
database/
├── setup-database.js          # Database initialization script (REQUIRED)
├── create_tables.sql          # Base table schemas (REQUIRED)
├── user_tables.sql            # User-related tables (REQUIRED)
└── insert_data.sql            # Sample data (REQUIRED)
```

#### `/middleware` - Authentication & Validation
```
middleware/
├── auth.js                    # Authentication middleware (REQUIRED)
├── errorHandler.js            # Error handling (REQUIRED)
└── validation.js              # Input validation (optional)
```

#### `/models` - Data Models
```
models/
└── User.js                    # User model (REQUIRED)
```
**Note:** Other models (Recipe.js, Cuisine.js, Ingredient.js) are NOT used in the current implementation.

#### `/routes` - API Routes
```
routes/
├── recipes.js                 # Recipe endpoints (REQUIRED)
├── cuisines.js                # Cuisine endpoints (REQUIRED)
├── ingredients.js             # Ingredient endpoints (REQUIRED)
└── users.js                   # User/auth endpoints (REQUIRED)
```

#### `/controllers` - Business Logic
```
controllers/
└── userController.js          # User operations (REQUIRED)
```
**Note:** Other controllers are NOT used in the current implementation.

#### Documentation (Optional but Recommended)
```
docs/
├── POSTMAN_TESTING_GUIDE.md      # Detailed API testing guide
├── POSTMAN_COLLECTION_SETUP.md   # Postman collection setup
├── STUDENT_SETUP_GUIDE.md        # This file
└── Recipe_Website_API.postman_collection.json  # Postman collection
```

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:

### 1. Node.js
- **Version:** 16.0.0 or higher
- **Check version:**
  ```bash
  node --version
  ```
- **Download:** https://nodejs.org/

### 2. npm (comes with Node.js)
- **Check version:**
  ```bash
  npm --version
  ```

### 3. SQLite3 (Optional - Node.js package includes it)
- **Check if available:**
  ```bash
  sqlite3 --version
  ```

### 4. Code Editor (Recommended)
- Visual Studio Code, Sublime Text, or your preferred editor

### 5. Postman (for API testing)
- **Download:** https://www.postman.com/downloads/

---

## 🚀 Installation Steps

### Step 1: Extract Project Files

Extract all files to a directory, for example:
```
/Users/yourname/recipe-website-api/
```

### Step 2: Open Terminal

Navigate to the project directory:
```bash
cd /path/to/recipe-website-api
```

### Step 3: Verify All Files Are Present

Check that you have all required files:
```bash
ls -la
```

You should see:
- `app.js`
- `package.json`
- Folders: `config/`, `database/`, `middleware/`, `models/`, `routes/`

### Step 4: Create Environment File

Copy the example environment file:
```bash
cp .env.example .env
```

Or create `.env` manually with this content:
```env
NODE_ENV=development
PORT=3000
DATABASE_PATH=./database/recettes.db
SESSION_SECRET=your-secret-key-change-in-production
```

**Important:** Never commit `.env` to Git (it's in `.gitignore`)

### Step 5: Install Dependencies

Install all required npm packages:
```bash
npm install
```

**This will install:**
- express (web framework)
- sqlite3 (database)
- bcryptjs (password hashing)
- express-session (session management)
- dotenv (environment variables)

**Wait for completion** - you should see:
```
added XXX packages in XXs
```

### Step 6: Verify Installation

Check that `node_modules/` folder was created:
```bash
ls -la
```

---

## 💾 Database Setup

### Step 1: Navigate to Database Folder

```bash
cd database
```

### Step 2: Run Database Setup Script

```bash
node setup-database.js
```

**Expected Output:**
```
Existing database deleted.

=== Starting Database Setup ===

Connected to SQLite database.
✓ Base tables created successfully.
✓ User tables created successfully.
✓ Sample data inserted successfully.

=== Database Tables Created ===
  - AllergiesInformation
  - Cuisines
  - DietaryInformation
  - Goals
  - Ingredients
  - RecipeIngredients
  - RecipeInstructions
  - RecipeRatings
  - Recipes
  - UserFavorites
  - Users
  - sqlite_sequence

✓ Database setup completed successfully!
✓ Database file: /path/to/database/recettes.db
```

### Step 3: Verify Database Was Created

```bash
ls -lh recettes.db
```

You should see a file that's around 80-100KB.

### Step 4: Return to Project Root

```bash
cd ..
```

---

## 🎯 Starting the Server

### Option 1: Production Mode

```bash
npm start
```

### Option 2: Development Mode (Auto-restart on changes)

```bash
npm run dev
```

**Expected Output:**
```
Recipe Website API Server Started
Server running on port 3000
API URL: http://localhost:3000
API documentation: http://localhost:3000/
Help page: http://localhost:3000/help

Available endpoints:
   GET  http://localhost:3000/api/recipes
   GET  http://localhost:3000/api/cuisines
   GET  http://localhost:3000/api/ingredients
   POST http://localhost:3000/api/users/register
   POST http://localhost:3000/api/users/login

Connected to SQLite database
```

### Verify Server is Running

Open your browser and go to:
```
http://localhost:3000
```

You should see JSON output with API information.

---

## 🧪 Testing the API

### Method 1: Using Postman (Recommended)

1. **Import the Collection**
   - Open Postman
   - Click "Import"
   - Select `Recipe_Website_API.postman_collection.json`

2. **Set Up Environment**
   - Create environment: "Recipe API Local"
   - Add variable: `base_url` = `http://localhost:3000`

3. **Start Testing**
   - See `POSTMAN_TESTING_GUIDE.md` for detailed instructions

### Method 2: Using cURL (Command Line)

#### Test 1: Check Server is Running
```bash
curl http://localhost:3000
```

#### Test 2: Get All Recipes
```bash
curl http://localhost:3000/api/recipes
```

#### Test 3: Register a User
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

#### Test 4: Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Test 5: Get My Recipes (Authenticated)
```bash
curl http://localhost:3000/api/recipes/my-recipes \
  -b cookies.txt
```

### Method 3: Using Browser

For GET requests, you can use your browser:
- http://localhost:3000/api/recipes
- http://localhost:3000/api/cuisines
- http://localhost:3000/api/ingredients
- http://localhost:3000/api/recipes/1

---

## 📚 API Endpoints Overview

### Public Endpoints (No Authentication)

**Recipes**
- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/:id` - Get recipe by ID
- `GET /api/recipes/cuisine/:cuisineId` - Get recipes by cuisine
- `GET /api/recipes/goal/:goalId` - Get recipes by goal
- `GET /api/recipes/no-allergens/:allergyId` - Get recipes without allergen
- `GET /api/recipes/:id/ratings` - Get ratings for recipe

**Cuisines**
- `GET /api/cuisines` - Get all cuisines
- `GET /api/cuisines/:id` - Get cuisine by ID

**Ingredients**
- `GET /api/ingredients` - Get all ingredients
- `GET /api/ingredients/:id` - Get ingredient by ID

**Users**
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users` - Get all users (for testing)

### Protected Endpoints (Authentication Required)

**Recipes**
- `GET /api/recipes/my-recipes` - Get my recipes
- `POST /api/recipes` - Create recipe
- `POST /api/recipes/:id/ingredients` - Add ingredient
- `PUT /api/recipes/:id/title` - Update title
- `PUT /api/recipes/:id/allergy` - Update allergy info
- `PUT /api/recipes/:id/instructions/:stepId` - Update instruction
- `DELETE /api/recipes/:id` - Delete recipe
- `DELETE /api/recipes/:id/ingredients/:ingredientId` - Remove ingredient

**Recipe Ratings**
- `POST /api/recipes/:id/ratings` - Add rating
- `PUT /api/recipes/:id/ratings` - Update rating
- `DELETE /api/recipes/:id/ratings` - Delete rating

**Ingredients**
- `POST /api/ingredients` - Create ingredient
- `PUT /api/ingredients/:id` - Update ingredient
- `DELETE /api/ingredients/:id` - Delete ingredient

**User Profile**
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Change password
- `DELETE /api/users/profile` - Delete account
- `POST /api/users/logout` - Logout

### Admin-Only Endpoints

**Cuisines**
- `POST /api/cuisines` - Create cuisine
- `PUT /api/cuisines/:id` - Update cuisine
- `DELETE /api/cuisines/:id` - Delete cuisine

---

## 🧪 Quick Testing Workflow

### 1. Register and Login

**Register a regular user:**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "username": "student1",
    "email": "student1@test.com",
    "password": "password123"
  }'
```

**Register an admin user:**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -c admin-cookies.txt \
  -d '{
    "username": "admin",
    "email": "admin@test.com",
    "password": "admin123",
    "is_admin": true
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "student1@test.com",
    "password": "password123"
  }'
```

### 2. Test Public Endpoints

```bash
# Get all recipes
curl http://localhost:3000/api/recipes

# Get all cuisines
curl http://localhost:3000/api/cuisines

# Get all ingredients
curl http://localhost:3000/api/ingredients
```

### 3. Test Protected Endpoints

```bash
# Get my recipes
curl http://localhost:3000/api/recipes/my-recipes -b cookies.txt

# Create a recipe
curl -X POST http://localhost:3000/api/recipes \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "My Test Recipe",
    "description": "A delicious test recipe",
    "image_url": "test.jpg",
    "cuisine_id": 1,
    "goal_id": 1
  }'
```

### 4. Test Admin Endpoints

```bash
# Create a cuisine (must be admin)
curl -X POST http://localhost:3000/api/cuisines \
  -H "Content-Type: application/json" \
  -b admin-cookies.txt \
  -d '{
    "name": "Test Cuisine"
  }'
```

---

## ❌ Troubleshooting

### Problem 1: "Cannot find module 'express'"

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Problem 2: "Port 3000 is already in use"

**Solution:**
```bash
# Find and kill process using port 3000
# On Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Or change port in .env file:
PORT=3001
```

### Problem 3: "SQLITE_ERROR: no such table: Recipes"

**Solution:**
```bash
# Recreate database
cd database
rm recettes.db
node setup-database.js
cd ..
npm start
```

### Problem 4: "Access denied. Please login to continue."

**Solution:**
- You need to login first
- Make sure you're sending the session cookie
- In Postman: Check "Cookies" are being sent
- In cURL: Use `-c cookies.txt` to save and `-b cookies.txt` to send

### Problem 5: "Forbidden. Admin access required."

**Solution:**
- You need admin privileges
- Register a new user with `"is_admin": true`
- Login with admin account
- Try the request again

### Problem 6: Database file is empty (0 bytes)

**Solution:**
```bash
cd database
node setup-database.js
```

### Problem 7: "npm start" does nothing

**Solution:**
```bash
# Check if Node.js is installed
node --version

# Check package.json exists
ls -la package.json

# Try running directly
node app.js
```

---

## 🔍 Verifying Your Setup

Run this checklist to ensure everything is working:

### ✅ Installation Checklist

- [ ] Node.js installed (v16+)
- [ ] All project files extracted
- [ ] `.env` file created
- [ ] `npm install` completed successfully
- [ ] `node_modules/` folder exists

### ✅ Database Checklist

- [ ] `database/recettes.db` file exists
- [ ] Database file is NOT empty (check file size)
- [ ] Setup script ran without errors

### ✅ Server Checklist

- [ ] Server starts without errors
- [ ] "Connected to SQLite database" message appears
- [ ] Browser shows API info at `http://localhost:3000`

### ✅ API Checklist

- [ ] `GET /api/recipes` returns data
- [ ] `GET /api/cuisines` returns data
- [ ] `POST /api/users/register` creates user
- [ ] `POST /api/users/login` returns success
- [ ] Protected endpoints work after login

---

## 📊 Sample Data Included

The database setup script includes sample data:

- **Cuisines:** Italian, Japanese, Asian, French, etc.
- **Ingredients:** Tomato, Flour, Chicken, etc.
- **Goals:** Weight Loss, Healthy Eating, etc.
- **Recipes:** 4 sample recipes with ingredients and instructions

You can view this data using:
```bash
curl http://localhost:3000/api/recipes
curl http://localhost:3000/api/cuisines
curl http://localhost:3000/api/ingredients
```

---

## 🎓 Learning Resources

### Understanding the Code

1. **Start with `app.js`** - Main entry point
2. **Check `routes/`** - See all API endpoints
3. **Read `middleware/auth.js`** - Understand authentication
4. **Explore `database/create_tables.sql`** - See database schema

### Documentation Files

- `POSTMAN_TESTING_GUIDE.md` - Complete API testing guide
- `POSTMAN_COLLECTION_SETUP.md` - Postman collection setup
- `README.md` - Project overview
- `SESSION_AUTHENTICATION_GUIDE.md` - Authentication details

### Recommended Testing Order

1. Test public endpoints (no auth)
2. Register and login
3. Test authenticated endpoints
4. Test admin endpoints
5. Test error cases (invalid data, unauthorized access)

---

## 📝 Important Notes

### Session-Based Authentication

- This API uses **session cookies**, not JWT tokens
- After login, session cookie is automatically sent with requests
- Session lasts 24 hours
- Logout destroys the session

### Admin Users

- Regular users: `"is_admin": false` (default)
- Admin users: `"is_admin": true` (must be set during registration)
- Only admins can create/update/delete cuisines

### Database

- SQLite database (single file)
- Located at `database/recettes.db`
- Can be deleted and recreated anytime
- No separate database server needed

### Error Responses

All errors return JSON:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## 🆘 Getting Help

If you encounter issues:

1. **Check the console** - Server logs show detailed errors
2. **Read error messages** - They usually explain the problem
3. **Review documentation** - See other .md files in the project
4. **Test step by step** - Isolate the problem
5. **Ask for help** - Provide error messages and steps to reproduce

---

## 🎉 Success!

If you can:
- ✅ Start the server
- ✅ Access http://localhost:3000
- ✅ Get data from `/api/recipes`
- ✅ Register and login
- ✅ Create a recipe

**Congratulations! Your setup is complete! 🚀**

Now you can:
- Import the Postman collection
- Test all endpoints systematically
- Build your own features
- Learn by experimenting

---

**Happy Coding! 💻**
