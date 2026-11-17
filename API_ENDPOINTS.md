# Liste des APIs

## Recettes

| Methode | URL | Description | Acces |
|---------|-----|-------------|-------|
| GET | `/api/recipes` | Recuperer toutes les recettes avec cuisine, categories dietetiques et objectifs | Public |
| GET | `/api/recipes/:id` | Recuperer une recette avec ses ingredients, etapes, dietetique, objectifs et allergenes | Public |
| GET | `/api/recipes/cuisine/:cuisineId` | Recuperer les recettes d'une cuisine donnee | Public |
| GET | `/api/recipes/goal/:goalId` | Recuperer les recettes correspondant a un objectif | Public |
| GET | `/api/recipes/no-allergens/:allergyId` | Recuperer les recettes ne contenant pas un allergene donne | Public |
| GET | `/api/recipes/my-recipes` | Recuperer les recettes creees par l'utilisateur connecte | Authentifie |
| POST | `/api/recipes` | Creer une nouvelle recette | Authentifie |
| PUT | `/api/recipes/:id/title` | Modifier le titre d'une recette | Proprietaire |
| DELETE | `/api/recipes/:id` | Supprimer une recette et toutes ses donnees associees | Proprietaire |

## Ingredients d'une recette

| Methode | URL | Description | Acces |
|---------|-----|-------------|-------|
| POST | `/api/recipes/:id/ingredients` | Ajouter un ingredient a une recette | Proprietaire |
| DELETE | `/api/recipes/:recipeId/ingredients/:ingredientId` | Retirer un ingredient d'une recette | Proprietaire |

## Etapes de preparation

| Methode | URL | Description | Acces |
|---------|-----|-------------|-------|
| POST | `/api/recipes/:id/instructions` | Ajouter une etape de preparation | Proprietaire |
| PUT | `/api/recipes/:id/instructions/:stepId` | Modifier la description d'une etape | Proprietaire |
| DELETE | `/api/recipes/:id/instructions/:stepId` | Supprimer une etape de preparation | Proprietaire |

## Categories dietetiques d'une recette

| Methode | URL | Description | Acces |
|---------|-----|-------------|-------|
| POST | `/api/recipes/:id/dietary` | Associer une categorie dietetique a une recette | Proprietaire |
| DELETE | `/api/recipes/:id/dietary/:dietId` | Retirer une categorie dietetique d'une recette | Proprietaire |

## Objectifs d'une recette

| Methode | URL | Description | Acces |
|---------|-----|-------------|-------|
| POST | `/api/recipes/:id/goals` | Associer un objectif a une recette | Proprietaire |
| DELETE | `/api/recipes/:id/goals/:goalId` | Retirer un objectif d'une recette | Proprietaire |

## Evaluations (notes et avis)

| Methode | URL | Description | Acces |
|---------|-----|-------------|-------|
| GET | `/api/recipes/:id/ratings` | Voir toutes les notes et avis d'une recette | Public |
| POST | `/api/recipes/:id/ratings` | Noter une recette (1 a 5 etoiles) avec un commentaire optionnel | Authentifie |
| PUT | `/api/recipes/:id/ratings` | Modifier sa propre note | Authentifie |
| DELETE | `/api/recipes/:id/ratings` | Supprimer sa propre note | Authentifie |

## Cuisines

| Methode | URL | Description | Acces |
|---------|-----|-------------|-------|
| GET | `/api/cuisines` | Recuperer toutes les cuisines | Public |
| GET | `/api/cuisines/:id` | Recuperer une cuisine avec ses recettes associees | Public |
| POST | `/api/cuisines` | Creer une nouvelle cuisine | Admin |
| PUT | `/api/cuisines/:id` | Modifier le nom d'une cuisine | Admin |
| DELETE | `/api/cuisines/:id` | Supprimer une cuisine (recettes reassignees a "Internationale") | Admin |

## Ingredients

| Methode | URL | Description | Acces |
|---------|-----|-------------|-------|
| GET | `/api/ingredients` | Recuperer tous les ingredients | Public |
| GET | `/api/ingredients/:id` | Recuperer un ingredient avec ses recettes et allergenes | Public |
| POST | `/api/ingredients` | Creer un nouvel ingredient | Authentifie |
| PUT | `/api/ingredients/:id` | Modifier un ingredient | Authentifie |
| DELETE | `/api/ingredients/:id` | Supprimer un ingredient (echoue s'il est utilise dans une recette) | Authentifie |

## Allergenes des ingredients

| Methode | URL | Description | Acces |
|---------|-----|-------------|-------|
| GET | `/api/ingredients/:id/allergies` | Voir les allergenes d'un ingredient | Public |
| POST | `/api/ingredients/:id/allergies` | Associer un allergene a un ingredient | Admin |
| DELETE | `/api/ingredients/:id/allergies/:allergyId` | Retirer un allergene d'un ingredient | Admin |

## Utilisateurs

| Methode | URL | Description | Acces |
|---------|-----|-------------|-------|
| POST | `/api/users/register` | Creer un compte utilisateur | Public |
| POST | `/api/users/login` | Se connecter (cree une session avec cookie) | Public |
| POST | `/api/users/logout` | Se deconnecter (detruit la session) | Authentifie |
| GET | `/api/users/profile` | Voir son profil | Authentifie |
| PUT | `/api/users/profile` | Modifier son profil (nom, email, etc.) | Authentifie |
| PUT | `/api/users/password` | Changer son mot de passe | Authentifie |
| DELETE | `/api/users/profile` | Supprimer son compte | Authentifie |

## Favoris

| Methode | URL | Description | Acces |
|---------|-----|-------------|-------|
| GET | `/api/users/favorites` | Voir ses recettes favorites | Authentifie |
| POST | `/api/users/favorites/:recipeId` | Ajouter une recette aux favoris | Authentifie |
| DELETE | `/api/users/favorites/:recipeId` | Retirer une recette des favoris | Authentifie |

## Evaluations de l'utilisateur

| Methode | URL | Description | Acces |
|---------|-----|-------------|-------|
| GET | `/api/users/ratings` | Voir toutes les notes que l'on a donnees | Authentifie |

---

## Niveaux d'acces

| Niveau | Description |
|--------|-------------|
| **Public** | Aucune connexion requise |
| **Authentifie** | L'utilisateur doit etre connecte |
| **Proprietaire** | L'utilisateur doit etre connecte ET etre le createur de la recette (les admins peuvent tout modifier) |
| **Admin** | L'utilisateur doit etre connecte ET avoir le role administrateur (`is_admin = 1`) |
