import os
import sys
import pandas as pd
from unittest.mock import MagicMock

# Add ml-service to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# --- MOCK SETUP ---
# We mock the database calls before importing the recommender to prevent Atlas connection demands
import data.foods_db

data.foods_db.get_foods_dataframe = MagicMock(return_value=pd.DataFrame([
    {'foodId': 'chicken', 'name': 'Chicken Breast', 'category': 'protein', 'calories': 165, 'protein': 31, 'carbs': 0, 'fat': 3.6, 'fiber': 0, 'default_price_per_gram': 2.5, 'is_vegetarian': False, 'is_vegan': False, 'is_gluten_free': True, 'is_dairy_free': True},
    {'foodId': 'salmon', 'name': 'Salmon', 'category': 'protein', 'calories': 208, 'protein': 20, 'carbs': 0, 'fat': 13, 'fiber': 0, 'default_price_per_gram': 8.0, 'is_vegetarian': False, 'is_vegan': False, 'is_gluten_free': True, 'is_dairy_free': True},
    {'foodId': 'beef', 'name': 'Beef Steak', 'category': 'protein', 'calories': 250, 'protein': 26, 'carbs': 0, 'fat': 17, 'fiber': 0, 'default_price_per_gram': 6.0, 'is_vegetarian': False, 'is_vegan': False, 'is_gluten_free': True, 'is_dairy_free': True},
    {'foodId': 'rice', 'name': 'White Rice', 'category': 'carbs', 'calories': 130, 'protein': 2.7, 'carbs': 28, 'fat': 0.3, 'fiber': 0.4, 'default_price_per_gram': 0.5, 'is_vegetarian': True, 'is_vegan': True, 'is_gluten_free': True, 'is_dairy_free': True},
    {'foodId': 'lentils', 'name': 'Lentils', 'category': 'protein', 'calories': 116, 'protein': 9, 'carbs': 20, 'fat': 0.4, 'fiber': 7.9, 'default_price_per_gram': 0.3, 'is_vegetarian': True, 'is_vegan': True, 'is_gluten_free': True, 'is_dairy_free': True},
    {'foodId': 'broccoli', 'name': 'Broccoli', 'category': 'vegetable', 'calories': 34, 'protein': 2.8, 'carbs': 6.6, 'fat': 0.4, 'fiber': 2.6, 'default_price_per_gram': 0.8, 'is_vegetarian': True, 'is_vegan': True, 'is_gluten_free': True, 'is_dairy_free': True},
]))

data.foods_db.get_live_prices_from_db = MagicMock(return_value={})
data.foods_db.get_foods_by_dietary = MagicMock(side_effect=lambda **kwargs: data.foods_db.get_foods_dataframe())

# Now import recommender safely
from model.recommender import DietRecommender

def test_budget_enforcement():
    """
    Test that supplying a low budget strictly constraints the recommender
    to avoid expensive foods (like salmon/beef) in favor of cheap foods (lentils/rice).
    """
    try:
        recommender = DietRecommender()
    except FileNotFoundError:
        print("⚠️  Model not found. Please train the model first by running `python model/train.py` from the ml-service directory.")
        return

    # Base profile for testing
    def get_profile(budget_amount):
        return {
            'age': 25,
            'weight_kg': 70,
            'height_cm': 170,
            'gender': 'male',
            'activity_level': 'moderately_active',
            'goal': 'general_fitness',
            'dietary_preferences': [],
            'diet_budget': {'amount': budget_amount, 'currency': 'LKR', 'period': 'weekly'}
        }

    # 1. Run with TIGHT Budget (LKR 2000/week)
    print("\n" + "="*50)
    print("Testing Low Budget: LKR 2,000 / week")
    print("="*50)
    result_low = recommender.recommend(get_profile(2000))
    cost_low = result_low['shoppingList']['totalAtGeneration']
    print(f"💰 Total Cost (Low Budget): LKR {cost_low:.2f}")

    # Check that high price items are avoided
    expensive_items = [i for i in result_low['shoppingList']['items'] if i['foodId'] in ['salmon', 'beef']]
    if not expensive_items:
        print("✅ Strict Budget Test Passed: Expensive items were filtered out.")
    else:
        print("❌ Strict Budget Test Failed: Expensive items were included despite low budget.")
        for item in expensive_items:
            print(f"   -> Included: {item['name']}")


    # 2. Run with HIGH Budget (LKR 15000/week)
    print("\n" + "="*50)
    print("Testing High Budget: LKR 15,000 / week")
    print("="*50)
    result_high = recommender.recommend(get_profile(15000))
    cost_high = result_high['shoppingList']['totalAtGeneration']
    print(f"💰 Total Cost (High Budget): LKR {cost_high:.2f}")
    
    # At high budget, model should pull in premium items if their nutrition score is high
    expensive_items_high = [i for i in result_high['shoppingList']['items'] if i['foodId'] in ['salmon', 'beef']]
    if expensive_items_high:
        print("✅ Premium Availability Test Passed: Expensive items successfully included for high budget.")
    else:
        print("⚠️  Warning: High budget did not trigger premium items. Check base nutrition scores.")
        
    print("\n--- High Budget Shopping List (Should be in round bulk quantities like 400g, 500g) ---")
    for item in result_high['shoppingList']['items']:
        print(f" - {item['name']}: {item['quantity']}{item['unit']} @ LKR {item['priceAtGeneration']:.2f}")


    # 3. Validation Summary
    print("\n" + "="*50)
    print("Summary:")
    if cost_low < cost_high:
        print("✅ Dynamic constraint scaling is working propertly!")
    else:
        print("❌ Dynamic constraint scaling failed (Low cost >= High cost).")

if __name__ == '__main__':
    test_budget_enforcement()
