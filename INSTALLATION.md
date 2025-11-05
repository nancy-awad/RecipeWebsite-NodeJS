# Installation Guide

## Prerequisites
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **SQLite3** - [Download](https://www.sqlite.org/download.html)
- **Git** (optional, for version control)

Check installations:
```bash
node --version   # Should show v14.x.x or higher
npm --version    # Should show 6.x.x or higher
sqlite3 --version # Should show 3.x.x
```

## Step-by-Step Installation

### 1. Create Project Directory
```bash
mkdir RecipeWebsite-Project
cd RecipeWebsite-Project
```

### 2. Initialize Node.js Project
```bash
npm init -y
```

This creates a `package.json` file with default values.

### 3. Install Required Dependencies

#### Core Dependencies
```bash
npm install express sqlite3 dotenv
```

- **express** (^4.18.2) - Web framework for Node.js
- **sqlite3** (^5.1.6) - SQLite database driver
- **dotenv** (^16.3.1) - Environment variable management

#### User Authentication Dependencies (Optional but Recommended)
```bash
npm install jsonwebtoken bcryptjs
```

- **jsonwebtoken** (^9.0.2) - JWT token generation and verification
- **bcryptjs** (^2.4.3) - Password hashing

#### Development Dependencies (Optional)
```bash
npm install --save-dev nodemon
```

- **nodemon** (^3.0.1) - Auto-restart server on file changes

### 4. Complete package.json

Your `package.json` should look like this:

```json
{
  "name": "recipewebsite-project",
  "version": "1.0.0",
  "description": "Recipe Website Backend API with Node.js, Express, and SQLite",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["recipe", "api", "express", "sqlite", "jwt"],
  "author": "Your Name",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.6",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### 5. Install All Dependencies at Once
Alternatively, you can create the `package.json` manually with the content above, then run:

```bash
npm install
```

This will install all dependencies listed in package.json.

### 6. Create Environment Variables File
Create a `.env` file in the project root:

```bash
touch .env
```

Add the following content:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-use-a-long-random-string

# Database Configuration (optional if using defaults)
DB_PATH=./database/recettes.db
```

**Important**: Add `.env` to your `.gitignore` file to avoid committing secrets!

### 7. Create .gitignore File
```bash
touch .gitignore
```

Add the following content:
```
# Dependencies
node_modules/

# Environment variables
.env
.env.local
.env.production

# Database
*.db
*.sqlite
*.sqlite3

# Logs
logs/
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
```

### 8. Setup Project Structure
Create the necessary directories:

```bash
mkdir database config middleware models controllers routes tests utils
```

### 9. Setup Database

#### Create database directory (if not exists)
```bash
mkdir -p database
```

#### Run SQL scripts
```bash
# Create main tables
sqlite3 database/recettes.db < database/create_tables.sql

# Add user functionality (optional)
sqlite3 database/recettes.db < database/user_tables.sql

# Insert sample data (if available)
sqlite3 database/recettes.db < database/insertion.sql
```

#### Verify database
```bash
sqlite3 database/recettes.db

# Inside SQLite shell:
.tables                          # List all tables
.schema Recipes                  # Show Recipes table structure
.schema Users                    # Show Users table structure
SELECT * FROM Cuisines;          # View sample data
.quit                            # Exit SQLite
```

### 10. Run the Application

#### Development mode (with auto-restart)
```bash
npm run dev
```

#### Production mode
```bash
npm start
```

You should see:
```
🚀 Recipe Website API Server Started
📡 Server running on port 3000
🌐 API URL: http://localhost:3000
📖 API documentation: http://localhost:3000/
❓ Help page: http://localhost:3000/help
```

### 11. Test the API

#### Using Browser
Open your browser and visit:
- http://localhost:3000/ - API home page
- http://localhost:3000/help - API help page
- http://localhost:3000/api/recipes - Get all recipes
- http://localhost:3000/api/cuisines - Get all cuisines

#### Using cURL
```bash
# Get all recipes
curl http://localhost:3000/api/recipes

# Register a new user
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User"
  }'

# Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Dependency Details

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | Web application framework |
| sqlite3 | ^5.1.6 | SQLite database driver |
| dotenv | ^16.3.1 | Load environment variables from .env file |
| jsonwebtoken | ^9.0.2 | Generate and verify JWT tokens |
| bcryptjs | ^2.4.3 | Hash and compare passwords securely |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| nodemon | ^3.0.1 | Auto-restart server on code changes |

## Troubleshooting

### Issue: `sqlite3` installation fails

**Solution**: Install build tools
- **Windows**: `npm install --global windows-build-tools`
- **Mac**: Install Xcode Command Line Tools: `xcode-select --install`
- **Linux**: `sudo apt-get install build-essential`

Then retry: `npm install sqlite3`

### Issue: Port 3000 already in use

**Solution**: Change port in `.env` file
```env
PORT=3001
```

Or kill the process using port 3000:
```bash
# Find process
lsof -i :3000        # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>        # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

### Issue: JWT_SECRET not found

**Solution**: Make sure `.env` file exists and is loaded
```javascript
// Add at the top of app.js
require('dotenv').config();
```

### Issue: Database file not found

**Solution**: Check database path
```bash
# Verify file exists
ls -la database/recettes.db

# Create database if missing
sqlite3 database/recettes.db < database/create_tables.sql
```

### Issue: CORS errors in browser

**Solution**: Already handled in `app.js` with CORS middleware

### Issue: Module not found errors

**Solution**: Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

## Quick Start Commands

```bash
# Clone or navigate to project
cd RecipeWebsite-Project

# Install all dependencies
npm install

# Setup database
sqlite3 database/recettes.db < database/create_tables.sql
sqlite3 database/recettes.db < database/user_tables.sql

# Create .env file
echo "PORT=3000
JWT_SECRET=your-secret-key
NODE_ENV=development" > .env

# Start development server
npm run dev
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Setup database
3. ✅ Configure environment variables
4. ✅ Start server
5. 📝 Test API endpoints with Postman/cURL
6. 📝 Implement remaining controller logic
7. 📝 Add validation to all endpoints
8. 📝 Write unit tests
9. 📝 Deploy to production

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [JWT.io](https://jwt.io/) - JWT debugger
- [Postman](https://www.postman.com/) - API testing tool
- [Thunder Client](https://www.thunderclient.com/) - VS Code API client
- [MDN Web Docs](https://developer.mozilla.org/) - Web development reference

## Support

For issues or questions:
1. Check the documentation files (PROJECT_DOCUMENTATION.md, USER_FUNCTIONALITY.md)
2. Review error messages in console
3. Verify all dependencies are installed
4. Check that database tables are created
5. Ensure environment variables are set

Happy coding! 🚀
