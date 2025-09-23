-- Inserer des cuisines
INSERT INTO Cuisines (name) VALUES
    ('Asiatique'),
    ('Italienne'),
    ('Chinoise'),
    ('Française');

-- Inserer des objectifs (goals)
INSERT INTO Goals (name) VALUES
    ('Perte de poids'),
    ('Riche en protéines'),
    ('Riche en nutriments'),
    ('Faible en calories');

-- Inserer des catégories diététiques (Dietary Information)
INSERT INTO DietaryInformation (name) VALUES
    ('Sans gluten'),
    ('Sans lactose'),
    ('Végétarien'),
    ('Végétalien');

-- Inserer des catégories d'allergies (Allergies Information)
INSERT INTO AllergiesInformation (name) VALUES
    ('Gluten'),
    ('Lactose'),
    ('Arachides'),
    ('Fruits de mer');

-- Inserer des ingrédients (Ingredients)
INSERT INTO Ingredients (name, quantity, unit) VALUES
    ('Poulet', 200, 'grammes'),
    ('Pâtes', 150, 'grammes'),
    ('Tomates', 3, 'unités'),
    ('Huile d''olive', 2, 'cuillères à soupe'); -- Notez le doublement des apostrophes ici

-- Inserer des recettes (Recipes)
INSERT INTO Recipes (title, description, image_url, cuisine_id, goal_id, DietaryInformation_id, AllergiesInformation_id) VALUES
    ('Poulet Alfredo', 'Une délicieuse recette de pâtes au poulet', 'url_image_1.jpg', 2, 3, 1, NULL),
    ('Salade César', 'Une salade classique avec une vinaigrette crémeuse', 'url_image_2.jpg', 2, 4, 3, 2);

-- Inserer des étapes d'instructions (RecipeInstructions)
-- Pour la recette "Poulet Alfredo"
INSERT INTO RecipeInstructions (recipe_id, step_number, description, ingredient_id, quantity, unit) VALUES
    (1, 1, 'Faites cuire les pâtes selon les instructions sur l''emballage.', 2, NULL, NULL),
    (1, 2, 'Faites cuire le poulet dans l''huile d''olive jusqu''à ce qu''il soit doré.', 1, 200, 'grammes'),
    (1, 3, 'Incorporez les tomates coupées en dés dans la poêle avec le poulet et faites mijoter pendant quelques minutes.', 3, 3, 'unités');

-- Pour la recette "Salade César"
INSERT INTO RecipeInstructions (recipe_id, step_number, description, ingredient_id, quantity, unit) VALUES
    (2, 1, 'Mélangez les feuilles de laitue dans un grand bol.', NULL, NULL, NULL),
    (2, 2, 'Ajoutez la vinaigrette césar et mélangez bien.', NULL, NULL, NULL),
    (2, 3, 'Servez avec des croûtons et du parmesan râpé.', NULL, NULL, NULL);