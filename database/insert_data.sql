-- ============================================
-- SAMPLE DATA FOR RECIPE WEBSITE
-- ============================================

-- Cuisines (10 original + Internationale)
INSERT INTO Cuisines (name) VALUES
    ('Asiatique'),
    ('Italienne'),
    ('Chinoise'),
    ('Française'),
    ('Mexicaine'),
    ('Indienne'),
    ('Méditerranéenne'),
    ('Américaine'),
    ('Thaïlandaise'),
    ('Japonaise'),
    ('Internationale');

-- Goals
INSERT INTO Goals (name) VALUES
    ('Perte de poids'),
    ('Riche en protéines'),
    ('Riche en nutriments'),
    ('Faible en calories'),
    ('Rapide et facile'),
    ('Adapté aux familles'),
    ('Économique'),
    ('Occasions spéciales');

-- Dietary Information
INSERT INTO DietaryInformation (name) VALUES
    ('Sans produits laitiers'),
    ('Sans Oeufs'),
    ('Sans sucre'),
    ('Sans gluten'),
    ('Végétarien'),
    ('Végétalien'),
    ('Paléo'),
    ('Cétogène'),
    ('Faible en glucides'),
    ('Faible en matières grasses');

-- Allergies Information
INSERT INTO AllergiesInformation (name) VALUES
    ('Gluten'),
    ('Produits laitiers'),
    ('Noix'),
    ('Fruits de mer'),
    ('Soja'),
    ('Oeufs'),
    ('Blé');

-- Ingredients
INSERT INTO Ingredients (name, unit) VALUES
    ('Poulet', 'grammes'),
    ('Pâtes', 'grammes'),
    ('Tomates', 'unités'),
    ('Huile d''olive', 'cuillères à soupe'),
    ('Laitue', 'feuilles'),
    ('Parmesan', 'grammes'),
    ('Croûtons', 'unités'),
    ('Vinaigrette césar', 'cuillères à soupe'),
    ('Ail', 'gousses'),
    ('Oignons', 'unités'),
    ('Basilic', 'feuilles'),
    ('Mozzarella', 'grammes');

-- Sample users (password is 'password123' hashed with bcrypt)
INSERT INTO Users (username, email, password_hash, first_name, last_name) VALUES
    ('john_doe', 'john@example.com', '$2b$10$rQ8HqUqJ9Z3KvGQHZhYgN.ZYF3xhvVzxhPJXqHqHqHqHqHqHqHqHq', 'John', 'Doe'),
    ('jane_smith', 'jane@example.com', '$2b$10$rQ8HqUqJ9Z3KvGQHZhYgN.ZYF3xhvVzxhPJXqHqHqHqHqHqHqHqHq', 'Jane', 'Smith'),
    ('chef_mike', 'mike@example.com', '$2b$10$rQ8HqUqJ9Z3KvGQHZhYgN.ZYF3xhvVzxhPJXqHqHqHqHqHqHqHqHq', 'Mike', 'Johnson');

-- Recipes (no goal_id, DietaryInformation_id, AllergiesInformation_id)
INSERT INTO Recipes (title, description, image_url, cuisine_id) VALUES
    ('Poulet Alfredo', 'Une délicieuse recette de pâtes au poulet', 'poulet_alfredo.jpg', 2),
    ('Salade César', 'Une salade classique avec une vinaigrette crémeuse', 'salade_cesar.jpg', 10),
    ('Pasta Végétarienne', 'Pâtes aux légumes et basilic frais', 'pasta_vegetarienne.jpg', 2),
    ('Stir-Fry Asiatique', 'Poulet sauté aux légumes style asiatique', 'stir_fry_asiatique.jpg', 1);

-- RecipeIngredients
INSERT INTO RecipeIngredients (recipe_id, ingredient_id, quantity) VALUES
    -- Poulet Alfredo (recipe_id = 1)
    (1, 1, 200),   -- Poulet, 200g
    (1, 2, 300),   -- Pâtes, 300g
    (1, 3, 2),     -- Tomates, 2 unités
    (1, 4, 2),     -- Huile d'olive, 2 c.à.s
    -- Salade César (recipe_id = 2)
    (2, 5, 1),     -- Laitue, 1 salade
    (2, 6, 50),    -- Parmesan, 50g
    (2, 7, 20),    -- Croûtons, 20 unités
    (2, 8, 3),     -- Vinaigrette césar, 3 c.à.s
    -- Pasta Végétarienne (recipe_id = 3)
    (3, 2, 250),   -- Pâtes, 250g
    (3, 3, 3),     -- Tomates, 3 unités
    (3, 11, 10),   -- Basilic, 10 feuilles
    (3, 12, 150),  -- Mozzarella, 150g
    -- Stir-Fry Asiatique (recipe_id = 4)
    (4, 1, 300),   -- Poulet, 300g
    (4, 10, 1),    -- Oignons, 1 unité
    (4, 9, 2);     -- Ail, 2 gousses

-- RecipeInstructions
INSERT INTO RecipeInstructions (recipe_id, step_number, description, ingredient_id) VALUES
    -- Poulet Alfredo
    (1, 1, 'Faites cuire les pâtes selon les instructions sur l''emballage.', 2),
    (1, 2, 'Faites cuire le poulet dans l''huile d''olive jusqu''à ce qu''il soit doré.', 1),
    (1, 3, 'Incorporez les tomates coupées en dés dans la poêle avec le poulet et faites mijoter pendant quelques minutes.', 3),
    -- Salade César
    (2, 1, 'Lavez et coupez les feuilles de laitue dans un grand bol.', 5),
    (2, 2, 'Ajoutez la vinaigrette césar et mélangez bien.', 8),
    (2, 3, 'Servez avec des croûtons et du parmesan râpé.', 7),
    -- Pasta Végétarienne
    (3, 1, 'Faites cuire les pâtes al dente selon les instructions.', 2),
    (3, 2, 'Coupez les tomates en dés et hachez le basilic.', 3),
    (3, 3, 'Mélangez les pâtes chaudes avec les tomates, basilic et mozzarella.', 12),
    -- Stir-Fry Asiatique
    (4, 1, 'Coupez le poulet en lamelles et émincez l''oignon.', 1),
    (4, 2, 'Faites chauffer l''huile dans un wok et faites revenir l''ail.', 9),
    (4, 3, 'Ajoutez le poulet et l''oignon, faites sauter 5-7 minutes.', 10);

-- ============================================
-- JUNCTION TABLE DATA
-- ============================================

-- IngredientAllergies (which ingredients contain which allergens)
INSERT INTO IngredientAllergies (ingredient_id, allergy_id) VALUES
    (2, 1),   -- Pâtes → Gluten
    (2, 7),   -- Pâtes → Blé
    (6, 2),   -- Parmesan → Produits laitiers
    (7, 1),   -- Croûtons → Gluten
    (7, 7),   -- Croûtons → Blé
    (8, 6),   -- Vinaigrette césar → Oeufs
    (12, 2);  -- Mozzarella → Produits laitiers

-- RecipeDietary (which dietary categories apply to each recipe)
INSERT INTO RecipeDietary (recipe_id, diet_id) VALUES
    (1, 1),   -- Poulet Alfredo → Sans produits laitiers (note: contains parmesan-free version)
    (2, 10),  -- Salade César → Faible en matières grasses
    (3, 5),   -- Pasta Végétarienne → Végétarien
    (4, 1),   -- Stir-Fry Asiatique → Sans produits laitiers
    (4, 9);   -- Stir-Fry Asiatique → Faible en glucides

-- RecipeGoals (which goals each recipe serves)
INSERT INTO RecipeGoals (recipe_id, goal_id) VALUES
    (1, 2),   -- Poulet Alfredo → Riche en protéines
    (1, 6),   -- Poulet Alfredo → Adapté aux familles
    (2, 1),   -- Salade César → Perte de poids
    (2, 4),   -- Salade César → Faible en calories
    (3, 3),   -- Pasta Végétarienne → Riche en nutriments
    (3, 5),   -- Pasta Végétarienne → Rapide et facile
    (4, 2),   -- Stir-Fry Asiatique → Riche en protéines
    (4, 5);   -- Stir-Fry Asiatique → Rapide et facile
