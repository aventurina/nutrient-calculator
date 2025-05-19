/**
 * @fileoverview This file contains the functions to fetch food nutrients data
 * from the USDA API. It also fetches meal suggestions data from the THEMEALDB API.
 *
 * @author Aimee Venturina
 * @version 1.0.0
 * @date 2025-05-19
 */

// Different measurement units that can be converted to grams
const measureToGrams = {
    "cup": 240, "tablespoon": 15, "tbsp": 15, "teaspoon": 5, "tsp": 5,
    "slice": 30, "slices": 30, "piece": 50, "pieces": 50, "oz": 28,
    "ounces": 28, "pound": 454, "lb": 454, "g": 1, "gram": 1, "grams": 1
};

/**
 * Fetches the nutrition data from the USDA API based on one specific food item
 *
 * @param {string} foodName - The food item to search the nutrition data for
 * @returns {object} - The food data result from the API
 */
async function fetchNutritionData(foodName) {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(foodName)}&pageSize=1&api_key=${USDA_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    // No results returned from the API
    if (!data.foods || data.foods.length === 0) {
        throw new Error("Food not found");
    }

    // Only use the first returned result
    console.log(data.foods[0]);
    return data.foods[0];
}

/**
 * Extracts the nutrients from the data's food item
 *
 * @param {object} foodItem - The food item to extract the nutrients for
 * @returns {object} - The nutrients object that contains the calories, protein, carbs & fat
 */
function extractNutrients(foodItem) {
    const nutrients = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
    };

    foodItem.foodNutrients.forEach(n => {
        switch (n.nutrientName) {
            case "Energy":
                nutrients.calories = n.value;
                break;
            case "Protein":
                nutrients.protein = n.value;
                break;
            case "Carbohydrate, by difference":
                nutrients.carbs = n.value;
                break;
            case "Total lipid (fat)":
                nutrients.fat = n.value;
                break;
        }
    });

    return nutrients;
}

/**
 * Estimates the grams from specified quantity and measurement unit
 *
 * @param {string} measure - The quantity and measurement unit
 * @returns {number} - The converted measurement in grams
 */
function estimateGramsFromMeasure(measure) {
    if (!measure) {
        return 100;
    }

    const cleaned = measure.trim().toLowerCase();

    // Search for format of measurement quantity & unit (e.g. 1 cup, 1/2 tbsp, etc...)
    const match = cleaned.match(/^([\d./]+)\s*([a-zA-Z]+)/);

    if (!match) {
        return 100;
    }

    // console.log("Match: " + match);
    let quantity = match[1];
    const unit = match[2];

    if (quantity.includes("/")) {
        const parts = quantity.split("/");
        quantity = parseFloat(parts[0]) / parseFloat(parts[1]);
    } else {
        quantity = parseFloat(quantity);
    }

    const gramsPerUnit = measureToGrams[unit] || 100;

    return quantity * gramsPerUnit;
}

/**
 * Displays the nutrients on a specific food item
 *
 * @param {object} nutrients - The object that contains the nutrients values
 * @param {number} quantity - The quantity of the food item in grams
 */
function displayNutrients(nutrients, quantity) {
    const scale = quantity / 100;

    document.getElementById("calories").textContent = (nutrients.calories * scale).toFixed(1);
    document.getElementById("protein").textContent = (nutrients.protein * scale).toFixed(1);
    document.getElementById("carbs").textContent = (nutrients.carbs * scale).toFixed(1);
    document.getElementById("fat").textContent = (nutrients.fat * scale).toFixed(1);
}

/**
 * Calculates the nutrients on the food item entered
 * and fetches meal suggestions as well
 */
async function calculate() {
    resetResults();

    const foodName = document.getElementById("food").value.trim();
    const quantity = parseFloat(document.getElementById("quantity").value);

    // Validate input values
    if (!foodName || isNaN(quantity) || quantity <= 0) {
        return alert("Enter valid food and quantity.");
    }

    try {
        const foodItem = await fetchNutritionData(foodName);
        const nutrients = extractNutrients(foodItem);
        displayNutrients(nutrients, quantity);
        fetchMealSuggestions(foodName);
    } catch (err) {
        console.error(err);
        alert("Error fetching nutrition info!");
    }
}

/**
 * Reset the results on the display areas
 */
function resetResults() {
    document.getElementById("calories").textContent = "0";
    document.getElementById("protein").textContent = "0";
    document.getElementById("carbs").textContent = "0";
    document.getElementById("fat").textContent = "0";
    document.getElementById("suggestions").innerHTML = "";
}

/**
 * Fetches the meal suggestions based on the food item entered
 * and displays on the page
 *
 * @param {string} query - The food item to search the meals for
 */
async function fetchMealSuggestions(query) {
    try {
        // THEMEALDB API Developer test key = 1 for free API calls
        const res = await fetch(`https://www.themealdb.com/api/json/v1/${THEMEALDB_API_KEY}/search.php?s=${encodeURIComponent(query)}`);
        const data = await res.json();
        const meals = data.meals || [];
        const maxNumMeals = 10;

        if (meals.length === 0) {
            document.getElementById("suggestions").innerHTML = "<p>No meal suggestions found.</p>";
            return;
        }

        const suggestionsDiv = document.getElementById("suggestions");
        suggestionsDiv.innerHTML = "<h4>Meal Suggestions:</h4>";

        console.log(meals);

        meals.slice(0, maxNumMeals).forEach(meal => {
            const mealCard = document.createElement("div");
            mealCard.className = "card meal-card shadow";
            mealCard.innerHTML = `
                <a href="${meal.strSource}" target="_blank" style="text-decoration: none;">
                    <div class="row g-0">
                    <div class="col-md-4">
                        <img src="${meal.strMealThumb}" class="img-fluid rounded-start" alt="${meal.strMeal}">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                        <h5 class="card-title">${meal.strMeal}</h5>
                        <p class="card-text"><small class="text-muted">${meal.strArea} | ${meal.strCategory}</small></p>
                        <div class="card-text">
                            <p>Estimated Nutrition:</p>
                            <ul class="list-unstyled mb-0">
                            <li>Calories: <span id="meal-calories-${meal.idMeal}">Loading...</span></li>
                            <li>Protein: <span id="meal-protein-${meal.idMeal}">–</span> g</li>
                            <li>Carbs: <span id="meal-carbs-${meal.idMeal}">–</span> g</li>
                            <li>Fat: <span id="meal-fat-${meal.idMeal}">–</span> g</li>
                            </ul>
                        </div>
                        </div>
                    </div>
                    </div>
                </a>
            `;

            suggestionsDiv.appendChild(mealCard);
            estimateMealNutrition(meal);
        });
    } catch (err) {
        console.error("Error fetching meal suggestions", err);
    }
}

/**
 * Estimates the meal nutrition per ingredient
 *
 * @param {object} meal - The meal to estimate the meal nutrition for
 */
async function estimateMealNutrition(meal) {
    const maxNumIngredients = 20;
    const totals = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
    };

    /* Go through each ingredient and extract nutrients.
    *  Max number of ingredients to iterate through is 20.
    */
    for (let i = 1; i <= maxNumIngredients; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];

        if (!ingredient || ingredient.trim() === "") {
            continue;
        }

        try {
            const res = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(ingredient)}&pageSize=1&api_key=${USDA_API_KEY}`);
            const data = await res.json();

            if (data.foods && data.foods[0]) {
                const foodItem = data.foods[0];
                const nutrients = extractNutrients(foodItem);
                const grams = estimateGramsFromMeasure(measure);
                const scale = grams / 100;

                totals.calories += (nutrients.calories || 0) * scale;
                totals.protein += (nutrients.protein || 0) * scale;
                totals.carbs += (nutrients.carbs || 0) * scale;
                totals.fat += (nutrients.fat || 0) * scale;
            }
        } catch (err) {
            console.warn(`Failed for ${ingredient}:`, err);
        }
    }

    // Display the meal nutrients on each meal card
    const id = meal.idMeal;
    document.getElementById(`meal-calories-${id}`).textContent = totals.calories.toFixed(0) + " kcal";
    document.getElementById(`meal-protein-${id}`).textContent = totals.protein.toFixed(1);
    document.getElementById(`meal-carbs-${id}`).textContent = totals.carbs.toFixed(1);
    document.getElementById(`meal-fat-${id}`).textContent = totals.fat.toFixed(1);
}