# Postman Collection Setup Guide

Quick guide for importing and using the Recipe Website API Postman collection.

---

## Prerequisites

- [Postman](https://www.postman.com/downloads/) installed on your computer
- Server running on `http://localhost:3000`

---

## Step 1: Import the Collection

1. **Open Postman**
2. Click **"Import"** button (top left)
3. Drag and drop `Recipe_Website_API.postman_collection.json` or click **"Choose Files"**
4. Click **"Import"**

---

## Step 2: Import the Environment (if provided)

1. Click **"Import"** button again
2. Select `Recipe_Website_API.postman_environment.json`
3. Click **"Import"**
4. Select the environment from the dropdown in the top right corner

**Or manually create environment:**
1. Click the **eye icon** (top right) → **"Add"**
2. Name it: `Recipe API Local`
3. Add variable:
   - Variable: `base_url`
   - Initial Value: `http://localhost:3000`
   - Current Value: `http://localhost:3000`
4. Click **"Save"**
5. Select this environment from the dropdown

---

## Step 3: Start Your Server

```bash
cd /path/to/RecipeWebsite-Project
npm start
```

**Verify server is running:**
- Open browser: `http://localhost:3000`
- You should see API information

---

## Step 4: Test the Collection

### Quick Test Flow:

**1. Register a User**
- Folder: `Users`
- Request: `Register User`
- Click **"Send"**

**2. Login**
- Request: `Login User`
- **Important:** Session cookie is automatically saved!

**3. Test Public Endpoints**
- `GET All Recipes`
- `GET All Cuisines`
- `GET All Ingredients`

**4. Test Protected Endpoints**
- `Create Recipe` (must be logged in)
- `Get My Recipes` (must be logged in)
- `Add Rating to Recipe` (must be logged in)

**5. Test Admin Endpoints**
- First, register an admin user
- Login as admin
- `Create Cuisine` (admin only)
- `Update Cuisine` (admin only)
- `Delete Cuisine` (admin only)

---

## Understanding Session-Based Authentication

This API uses **session cookies** for authentication. Here's how it works:

### After Login:
- Postman automatically stores the session cookie
- All subsequent requests include this cookie
- No need to manually add tokens!

### Session Persistence:
- Session stays active until you logout
- Cookie is valid for 24 hours
- One session per user

### Testing Authentication:
1. **Login** → Session cookie stored
2. **Test protected endpoint** → Works!
3. **Logout** → Session destroyed
4. **Test protected endpoint again** → 401 Unauthorized

---

## Collection Organization

The collection is organized into folders:

### 📁 Users
- Register User
- Login User
- Get All Users
- Get Profile
- Update Profile
- Update Password
- Logout
- Delete Account
- User Favorites
- User Ratings

### 📁 Cuisines
- Get All Cuisines
- Get Cuisine by ID
- Create Cuisine (Admin)
- Update Cuisine (Admin)
- Delete Cuisine (Admin)

### 📁 Ingredients
- Get All Ingredients
- Get Ingredient by ID
- Create Ingredient
- Update Ingredient
- Delete Ingredient

### 📁 Recipes
- Get All Recipes
- Get Recipe by ID
- Get My Recipes
- Get Recipes by Cuisine
- Get Recipes by Goal
- Get Recipes Without Allergen
- Create Recipe
- Add Ingredient to Recipe
- Update Recipe Title
- Update Recipe Allergy
- Update Recipe Instruction
- Delete Recipe
- Remove Ingredient from Recipe

### 📁 Recipe Ratings
- Add Rating
- Update Rating
- Delete Rating
- Get All Ratings

---

## Common Issues & Solutions

### ❌ "Access denied. Please login to continue."
**Solution:** You're not logged in
1. Use `Login User` request
2. Check that session cookie is saved (Cookies tab)
3. Try the request again

### ❌ "Forbidden. Admin access required."
**Solution:** You need admin privileges
1. Register a new user with `"is_admin": true`
2. Login with that admin account
3. Try the request again

### ❌ "Cannot connect to server"
**Solution:** Server isn't running
1. Open terminal
2. Navigate to project directory
3. Run `npm start`
4. Wait for "Server running on port 3000" message

### ❌ Variables not working ({{base_url}})
**Solution:** Environment not selected
1. Check top-right dropdown
2. Select your environment
3. Try again

---

## Tips for Students

### 1. Check Example Responses
Each request has example responses saved. Click **"Examples"** to see them.

### 2. Use Pre-request Scripts
Some requests may have pre-request scripts that set up data automatically.

### 3. Test in Order
Follow the recommended testing order:
1. User registration & login
2. Public endpoints (GET requests)
3. Create operations (POST requests)
4. Update operations (PUT requests)
5. Delete operations (DELETE requests)

### 4. Experiment!
- Try invalid data to see error responses
- Test without logging in
- Test with different user types (regular vs admin)
- Check what happens when you try to modify someone else's recipe

### 5. Use the Console
Open Postman Console (bottom left) to see:
- Full request/response details
- Cookie information
- Debug information

---

## Testing Checklist

Use this checklist to verify all endpoints work:

### Users
- [ ] Register regular user
- [ ] Register admin user
- [ ] Login user
- [ ] Get user profile
- [ ] Update profile
- [ ] Change password
- [ ] Logout
- [ ] Delete account

### Cuisines
- [ ] Get all cuisines
- [ ] Get cuisine by ID
- [ ] Create cuisine (as admin)
- [ ] Update cuisine (as admin)
- [ ] Delete cuisine (as admin)

### Ingredients
- [ ] Get all ingredients
- [ ] Get ingredient by ID
- [ ] Create ingredient
- [ ] Update ingredient
- [ ] Delete ingredient

### Recipes
- [ ] Get all recipes
- [ ] Get recipe by ID
- [ ] Get my recipes
- [ ] Get recipes by cuisine
- [ ] Get recipes by goal
- [ ] Get recipes without allergen
- [ ] Create recipe
- [ ] Add ingredient to recipe
- [ ] Update recipe title
- [ ] Update recipe allergy info
- [ ] Update recipe instruction
- [ ] Delete recipe
- [ ] Remove ingredient from recipe

### Ratings
- [ ] Add rating to recipe
- [ ] Update own rating
- [ ] Delete own rating
- [ ] Get all ratings for recipe

---

## Additional Resources

- **Full API Documentation:** See `POSTMAN_TESTING_GUIDE.md`
- **Database Setup:** See `database/setup-database.js`
- **Authentication Guide:** See `SESSION_AUTHENTICATION_GUIDE.md`

---

## Need Help?

If you encounter issues:
1. Check the server console for error messages
2. Review the full documentation in `POSTMAN_TESTING_GUIDE.md`
3. Make sure database is properly initialized
4. Verify you're using the correct environment

---

**Happy Testing! 🚀**
