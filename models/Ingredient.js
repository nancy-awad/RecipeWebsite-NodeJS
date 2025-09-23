const database = require('../config/database');

class Ingredient {
    constructor(data) {
        this.ingredient_id = data.ingredient_id;
        this.name = data.name;
        this.quantity = data.quantity;
        this.unit = data.unit;
    }

    // TODO: Implement static method to get all ingredients
    static async findAll() {
        return new Promise((resolve, reject) => {
            // TODO: Implement SELECT query for all ingredients
            reject(new Error('Method not implemented yet'));
        });
    }

    // TODO: Implement static method to find ingredient by ID
    static async findById(id) {
        return new Promise((resolve, reject) => {
            // TODO: Implement SELECT query for specific ingredient
            reject(new Error('Method not implemented yet'));
        });
    }

    // TODO: Implement static method to create new ingredient
    static async create(data) {
        return new Promise((resolve, reject) => {
            // TODO: Implement INSERT query for new ingredient
            reject(new Error('Method not implemented yet'));
        });
    }

    // TODO: Implement static method to update ingredient
    static async update(id, data) {
        return new Promise((resolve, reject) => {
            // TODO: Implement UPDATE query for ingredient
            reject(new Error('Method not implemented yet'));
        });
    }

    // TODO: Implement static method to delete ingredient
    static async delete(id) {
        return new Promise((resolve, reject) => {
            // TODO: Implement DELETE query for ingredient
            // Note: Consider what happens to RecipeIngredients that reference this ingredient
            reject(new Error('Method not implemented yet'));
        });
    }

    // TODO: Implement method to check if ingredient name already exists
    static async existsByName(name) {
        return new Promise((resolve, reject) => {
            // TODO: Implement query to check if ingredient name exists
            reject(new Error('Method not implemented yet'));
        });
    }

    // TODO: Implement method to get recipes that use this ingredient
    async getRecipes() {
        return new Promise((resolve, reject) => {
            // TODO: Implement query to get recipes that use this ingredient
            reject(new Error('Method not implemented yet'));
        });
    }

    // TODO: Implement method to search ingredients by name
    static async searchByName(searchTerm) {
        return new Promise((resolve, reject) => {
            // TODO: Implement query to search ingredients by name (LIKE operator)
            reject(new Error('Method not implemented yet'));
        });
    }
}

module.exports = Ingredient;