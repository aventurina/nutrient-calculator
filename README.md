# 🥗 Nutrient Calculator

A web-based Nutrient Calculator that lets users search for food items and view their nutritional information using the USDA FoodData Central API. It also fetches meal suggestions based on the food item entered using THEMEALDB API.

<img width="650" alt="nutrient-calculator-ui" src="https://github.com/user-attachments/assets/d5e3c0d2-9899-4c14-beed-a72d417b2766" />

## 🔧 Technologies Used

- **HTML5**
- **CSS3**
- **Bootstrap 5**
- **JavaScript (Vanilla)**
- **USDA FoodData Central API**
- **THEMEALDB API**

## 📌 Features

- Search for food items using the USDA API
- Display nutritional data (calories, protein, fat & carbs)
- Responsive design using Bootstrap

## 🚀 How to Use

1. Clone or download the repository.
2. Open `nutrient-calculator.html` in your browser.
3. Enter a food item and quantity in grams in the search section of the app to get the nutrition info.

## 📄 Setup

1. Get a free API key from [USDA FoodData Central](https://fdc.nal.usda.gov/api-key-signup.html).
2. Replace the `USDA_API_KEY` placeholder in your JavaScript code with your actual key.
3. For the THEMEALDB API, the developer test key of 1 is used for the API calls.

```javascript
const USDA_API_KEY = "YOUR_API_KEY_HERE";
