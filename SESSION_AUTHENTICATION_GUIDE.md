# Session-Based Authentication Guide

## Overview

This application uses **session-based authentication** with **bcrypt** for password hashing.

### Authentication Flow

```
User Register/Login
  ↓
Password verified with bcrypt
  ↓
Session created on server
  ↓
Session ID stored in cookie
  ↓
Cookie sent automatically with each request
  ↓
Server validates session
  ↓
User authenticated
```

---

## How It Works

### 1. Registration (POST /api/users/register)

**Request**:
```javascript
POST /api/users/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**What happens**:
1. Password is hashed using **bcrypt** (10 salt rounds)
2. User is created in database with hashed password
3. **Session is created** with user data
4. Session ID is sent in a cookie
5. User is automatically logged in

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "user_id": 1,
      "username": "john_doe",
      "email": "john@example.com"
    }
  }
}
```

**Cookie Set**: `connect.sid=s%3A...` (session ID)

---

### 2. Login (POST /api/users/login)

**Request**:
```javascript
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**What happens**:
1. User is found by email
2. Password is verified using **bcrypt.compare()**
3. If valid, **session is created** with user data
4. Session ID is sent in a cookie

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": 1,
      "username": "john_doe",
      "email": "john@example.com"
    }
  }
}
```

**Cookie Set**: `connect.sid=s%3A...`

---

### 3. Logout (POST /api/users/logout)

**Request**:
```javascript
POST /api/users/logout
Cookie: connect.sid=s%3A...
```

**What happens**:
1. Session is destroyed on the server
2. Session cookie is cleared
3. User must login again to access protected routes

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 4. Accessing Protected Routes

**Request**:
```javascript
GET /api/users/profile
Cookie: connect.sid=s%3A...  // Automatically sent by browser
```

**What happens**:
1. Browser automatically sends session cookie
2. `authenticateSession` middleware checks if session exists
3. If valid, `req.user` is set with user data
4. Route handler executes normally
5. If invalid, 401 error is returned

---

## Session Configuration (app.js)

```javascript
const session = require('express-session');

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true,  // Prevents XSS attacks
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
```

### Session Options Explained

| Option | Value | Why |
|--------|-------|-----|
| `secret` | Random string from env | Signs the session ID cookie |
| `resave` | false | Don't save session if unmodified |
| `saveUninitialized` | false | Don't create session until something stored |
| `cookie.secure` | true in production | Only send cookie over HTTPS |
| `cookie.httpOnly` | true | Can't access cookie via JavaScript (prevents XSS) |
| `cookie.maxAge` | 24 hours | Session expires after 1 day |

---

## Password Hashing with bcrypt

### During Registration (models/User.js)

```javascript
static async create(userData) {
    return new Promise(async (resolve, reject) => {
        try {
            // Hash password with 10 salt rounds
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const sql = `
                INSERT INTO Users (username, email, password_hash, first_name, last_name)
                VALUES (?, ?, ?, ?, ?)
            `;

            database.run(sql, [
                userData.username,
                userData.email,
                hashedPassword,  // Store hashed password, never plain text!
                userData.first_name || null,
                userData.last_name || null
            ], function (err) {
                // ...
            });
        } catch (error) {
            reject(error);
        }
    });
}
```

### During Login (models/User.js)

```javascript
async verifyPassword(password) {
    // Compare plain password with hashed password
    return await bcrypt.compare(password, this.password_hash);
}
```

---

## Authentication Middleware (middleware/auth.js)

```javascript
const authenticateSession = (req, res, next) => {
    // Check if session exists and has user data
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. Please login to continue.'
        });
    }

    // Attach user info to request object
    req.user = req.session.user;

    next(); // Continue to route handler
};
```

**Usage in routes**:
```javascript
router.get('/profile', authenticateSession, userController.getProfile);
//                     ↑ Checks session before accessing controller
```

---

## Session vs JWT Comparison

| Feature | Session-Based (This App) | JWT-Based |
|---------|-------------------------|-----------|
| **Storage** | Server (in memory or DB) | Client (localStorage/cookie) |
| **Stateful** | Yes (server tracks sessions) | No (token is self-contained) |
| **Logout** | Easy (destroy session) | Hard (can't invalidate token) |
| **Security** | Session ID in httpOnly cookie | Token exposed to JavaScript |
| **Scalability** | Harder (sessions shared across servers) | Easier (stateless) |
| **Cookie** | Required | Optional |
| **Best for** | Traditional web apps | APIs, mobile apps, microservices |

**Why Session-Based for this project?**
- Simpler to understand for students
- Easy logout implementation
- Better security (httpOnly cookies)
- Built-in with express-session

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }' \
  -c cookies.txt  # Save cookies to file
```

### Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' \
  -c cookies.txt  # Save session cookie
```

### Access Protected Route
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -b cookies.txt  # Send saved session cookie
```

### Logout
```bash
curl -X POST http://localhost:3000/api/users/logout \
  -b cookies.txt
```

---

## Testing with Postman

### 1. Enable Cookie Jar

In Postman settings:
- General → Enable "Automatically follow redirects"
- Enable cookie jar (cookies are saved automatically)

### 2. Register or Login

```
POST http://localhost:3000/api/users/login
Body (JSON):
{
  "email": "test@example.com",
  "password": "password123"
}
```

Postman will automatically save the session cookie.

### 3. Access Protected Routes

```
GET http://localhost:3000/api/users/profile
```

No need to manually add headers - Postman sends cookies automatically!

---

## Security Best Practices

### 1. Password Security
- Never store plain text passwords
- Always use bcrypt with at least 10 salt rounds
- Never log or display passwords

### 2. Session Security
- Use `httpOnly` cookies (prevents XSS)
- Use `secure: true` in production (HTTPS only)
- Set reasonable session expiration (24 hours)
- Use strong `SESSION_SECRET` in production

### 3. Environment Variables

**Create `.env` file**:
```
SESSION_SECRET=your-very-long-random-secret-key-here
NODE_ENV=development
PORT=3000
```

**Never commit `.env` to git!**

Add to `.gitignore`:
```
.env
.env.local
.env.production
```

---

## Common Issues

### Issue 1: "Access denied. Please login to continue."

**Cause**: Session expired or cookie not sent

**Solution**:
- Login again
- Check if cookies are enabled
- Verify session middleware is configured

### Issue 2: Session not persisting

**Cause**: Cookie not being saved or sent

**Solution in browser**:
- Check if cookies are blocked
- Enable third-party cookies (if using different domain)

**Solution in Postman**:
- Enable cookie jar in settings
- Make sure you're using the same workspace

### Issue 3: "Invalid email or password"

**Cause**: Wrong credentials or bcrypt comparison failing

**Debug**:
```javascript
// In userController.js login
console.log('User found:', user ? 'Yes' : 'No');
console.log('Password valid:', isPasswordValid);
```

---

## Installation

Install required packages:
```bash
npm install express-session bcryptjs
```

Already included in `package.json`:
```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "express-session": "^1.17.3"
  }
}
```

---

## Summary

### How to Use

1. **Register** → Creates user with hashed password + session
2. **Login** → Verifies password with bcrypt + creates session
3. **Access Protected Routes** → Session cookie sent automatically
4. **Logout** → Destroys session

### Key Components

- **bcrypt**: Hashes and verifies passwords
- **express-session**: Manages sessions on server
- **Cookies**: Store session ID in browser
- **Middleware**: Checks session validity

### Benefits

- Simple to understand
- Secure (httpOnly cookies)
- Easy logout
- Automatic cookie handling by browser

---

**Last Updated**: 2025-11-05
