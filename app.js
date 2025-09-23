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

// CORS middleware (if needed for frontend testing)
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

// Request logging middleware
app.use((req, res, next) => {
    console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/recipes', recipeRoutes);
app.use('/api/cuisines', cuisineRoutes);
app.use('/api/ingredients', ingredientRoutes);

// Home route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Recipe Website API',
        version: '1.0.0',
        description: 'Backend API for managing recipes, cuisines, and ingredients',
        endpoints: {
            recipes: '/api/recipes',
            cuisines: '/api/cuisines',
            ingredients: '/api/ingredients'
        },
        documentation: {
            postman: 'Import the Postman collection to test all endpoints',
            guide: 'See RecipeWebsite_Student_Guide.md for complete implementation guide'
        }
    });
});

// Help route
app.get('/help', (req, res) => {
    res.json({
        success: true,
        message: 'Recipe Website API - Help & Contact',
        endpoints: {
            'GET /': 'API information and available endpoints',
            'GET /help': 'This help page',
            'GET /api/recipes': 'Get all recipes',
            'GET /api/recipes/:id': 'Get recipe by ID',
            'GET /api/recipes/cuisine/:cuisineId': 'Get recipes by cuisine',
            'GET /api/recipes/no-allergens/:allergyId': 'Get recipes without allergen',
            'GET /api/recipes/goal/:goalId': 'Get recipes by goal',
            'POST /api/recipes': 'Create new recipe',
            'PUT /api/recipes/:id/title': 'Update recipe title',
            'DELETE /api/recipes/:id': 'Delete recipe'
        },
        contact: {
            developer: 'Recipe Website API Student Project',
            course: 'Backend Development with NodeJS - IUT MMI',
            documentation: 'See project guide for complete API documentation'
        },
        status: 'Under development - TODO items need implementation'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl,
        availableEndpoints: [
            'GET /',
            'GET /help',
            'GET /api/recipes',
            'GET /api/cuisines',
            'GET /api/ingredients'
        ]
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('🚀 Recipe Website API Server Started');
    console.log(`📡 Server running on port ${port}`);
    console.log(`🌐 API URL: http://localhost:${port}`);
    console.log(`📖 API documentation: http://localhost:${port}/`);
    console.log(`❓ Help page: http://localhost:${port}/help`);
    console.log('');
    console.log('📋 Available endpoints:');
    console.log(`   GET  http://localhost:${port}/api/recipes`);
    console.log(`   GET  http://localhost:${port}/api/cuisines`);
    console.log(`   GET  http://localhost:${port}/api/ingredients`);
    console.log('');
    console.log('⚠️  Note: Most endpoints return TODO messages - implement logic in controllers and models');
});

module.exports = app;