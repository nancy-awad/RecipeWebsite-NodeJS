-- ============================================
-- RECIPE WEBSITE DATABASE SCHEMA
-- ============================================

-- Table "Cuisines" (Cuisines)
CREATE TABLE Cuisines (
    cuisine_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

-- Table "Goals" (Objectifs)
CREATE TABLE Goals (
    goal_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

-- Table "DietaryInformation" (Informations Dietetiques)
CREATE TABLE DietaryInformation (
    diet_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

-- Table "AllergiesInformation" (Informations sur les Allergies)
CREATE TABLE AllergiesInformation (
    allergy_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

-- Table "Ingredients" (Ingredients)
CREATE TABLE Ingredients (
    ingredient_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    unit TEXT
);

-- Table "Users" (Utilisateurs)
CREATE TABLE Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_admin INTEGER DEFAULT 0
);

-- Table "Recipes" (Recettes)
CREATE TABLE Recipes (
    recipe_id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    cuisine_id INTEGER,
    user_id INTEGER,
    average_rating REAL DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    FOREIGN KEY (cuisine_id) REFERENCES Cuisines(cuisine_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

-- Table "RecipeIngredients" (Table de liaison pour les ingredients de la recette)
CREATE TABLE RecipeIngredients (
    recipe_id INTEGER,
    ingredient_id INTEGER,
    quantity REAL,
    PRIMARY KEY (recipe_id, ingredient_id),
    FOREIGN KEY (recipe_id) REFERENCES Recipes(recipe_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients(ingredient_id)
);

-- Table "RecipeInstructions" (Instructions de la Recette)
CREATE TABLE RecipeInstructions (
    instruction_id INTEGER PRIMARY KEY,
    recipe_id INTEGER,
    step_number INTEGER,
    description TEXT,
    ingredient_id INTEGER,
    FOREIGN KEY (recipe_id) REFERENCES Recipes(recipe_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients(ingredient_id)
);

-- Table "IngredientAllergies" (Junction: Ingredients <-> Allergies)
CREATE TABLE IngredientAllergies (
    ingredient_id INTEGER,
    allergy_id INTEGER,
    PRIMARY KEY (ingredient_id, allergy_id),
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients(ingredient_id) ON DELETE CASCADE,
    FOREIGN KEY (allergy_id) REFERENCES AllergiesInformation(allergy_id) ON DELETE CASCADE
);

-- Table "RecipeDietary" (Junction: Recipes <-> DietaryInformation)
CREATE TABLE RecipeDietary (
    recipe_id INTEGER,
    diet_id INTEGER,
    PRIMARY KEY (recipe_id, diet_id),
    FOREIGN KEY (recipe_id) REFERENCES Recipes(recipe_id) ON DELETE CASCADE,
    FOREIGN KEY (diet_id) REFERENCES DietaryInformation(diet_id) ON DELETE CASCADE
);

-- Table "RecipeGoals" (Junction: Recipes <-> Goals)
CREATE TABLE RecipeGoals (
    recipe_id INTEGER,
    goal_id INTEGER,
    PRIMARY KEY (recipe_id, goal_id),
    FOREIGN KEY (recipe_id) REFERENCES Recipes(recipe_id) ON DELETE CASCADE,
    FOREIGN KEY (goal_id) REFERENCES Goals(goal_id) ON DELETE CASCADE
);

-- Table "UserFavorites" (Recettes Favorites des Utilisateurs)
CREATE TABLE UserFavorites (
    user_id INTEGER,
    recipe_id INTEGER,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, recipe_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES Recipes(recipe_id) ON DELETE CASCADE
);

-- Table "RecipeRatings" (Evaluations des Recettes)
CREATE TABLE RecipeRatings (
    rating_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    recipe_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, recipe_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES Recipes(recipe_id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_recipe_cuisine ON Recipes(cuisine_id);
CREATE INDEX idx_recipe_user ON Recipes(user_id);
CREATE INDEX idx_recipe_ratings ON RecipeRatings(recipe_id);
CREATE INDEX idx_user_favorites ON UserFavorites(user_id);
CREATE INDEX idx_ingredient_allergies_allergy ON IngredientAllergies(allergy_id);
CREATE INDEX idx_recipe_dietary_diet ON RecipeDietary(diet_id);
CREATE INDEX idx_recipe_goals_goal ON RecipeGoals(goal_id);
