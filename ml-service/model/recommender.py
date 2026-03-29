"""
SDFitness ML Service — Recommender (Inference)

Given a user profile and live food prices, uses the trained model to:
  1. Filter foods by dietary constraints
  2. Score every food for this user
  3. Select top foods per meal slot
  4. Build a 7-day meal plan with portions, macros, and costs
  5. Return structured JSON for GPT formatting

This file is used by app.py (Flask API).
"""

import os
import json
import numpy as np
import pandas as pd
import joblib
import time

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data.foods_db import get_foods_dataframe, get_foods_by_dietary

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'diet_model.pkl')
METRICS_PATH = os.path.join(os.path.dirname(__file__), 'training_metrics.json')

# Meal slot structure per day
MEAL_SLOTS = [
    {'type': 'breakfast', 'calorie_share': 0.25, 'foods_count': 2},
    {'type': 'morning_snack', 'calorie_share': 0.10, 'foods_count': 1},
    {'type': 'lunch', 'calorie_share': 0.30, 'foods_count': 3},
    {'type': 'afternoon_snack', 'calorie_share': 0.10, 'foods_count': 1},
    {'type': 'dinner', 'calorie_share': 0.25, 'foods_count': 2},
]

DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']


class DietRecommender:
    def __init__(self):
        self.model = None
        self.feature_names = None
        self.version = None
        self.metrics = None
        self.load_model()

    def load_model(self):
        """Load the trained model from disk."""
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found at {MODEL_PATH}. Run 'python model/train.py' first."
            )

        data = joblib.load(MODEL_PATH)
        self.model = data['model']
        self.feature_names = data['feature_names']
        self.version = data.get('version', 'unknown')

        if os.path.exists(METRICS_PATH):
            with open(METRICS_PATH, 'r') as f:
                self.metrics = json.load(f)

        print(f"✅ Model loaded (v{self.version})")

    def _calculate_tdee(self, user):
        """Calculate TDEE from user profile."""
        weight = user.get('weight_kg', 70)
        height = user.get('height_cm', 170)
        age = user.get('age', 30)
        gender = user.get('gender', 'male')

        activity_map = {
            'sedentary': 1.2,
            'lightly_active': 1.375,
            'moderately_active': 1.55,
            'very_active': 1.725,
            'extremely_active': 1.9
        }
        activity = activity_map.get(user.get('activity_level', 'moderately_active'), 1.55)

        # Mifflin-St Jeor
        if gender == 'male':
            bmr = 10 * weight + 6.25 * height - 5 * age + 5
        else:
            bmr = 10 * weight + 6.25 * height - 5 * age - 161

        return bmr * activity

    def _get_macro_targets(self, user, tdee):
        """Calculate macro targets based on goals."""
        goal = user.get('goal', 'general_fitness')

        goal_map = {
            'weight_loss': {'cal_mult': 0.8, 'protein_mult': 1.4},
            'muscle_gain': {'cal_mult': 1.15, 'protein_mult': 2.0},
            'endurance': {'cal_mult': 1.0, 'protein_mult': 1.4},
            'general_fitness': {'cal_mult': 1.0, 'protein_mult': 1.4},
            'strength': {'cal_mult': 1.1, 'protein_mult': 1.8},
        }
        params = goal_map.get(goal, goal_map['general_fitness'])
        weight = user.get('weight_kg', 70)

        target_cal = tdee * params['cal_mult']
        target_protein = weight * params['protein_mult']
        target_fat = target_cal * 0.25 / 9
        target_carbs = (target_cal - target_protein * 4 - target_fat * 9) / 4

        return {
            'calories': round(target_cal),
            'protein': round(target_protein),
            'carbs': round(target_carbs),
            'fat': round(target_fat)
        }

    def _score_foods(self, user_features, foods_df, live_prices):
        """Use the trained model to score all candidate foods for this user."""
        scores = []

        # Map goal string to numeric
        goal_map = {'weight_loss': 0, 'muscle_gain': 1, 'endurance': 2,
                     'general_fitness': 2, 'strength': 1, 'flexibility': 2,
                     'athletic_performance': 1}
        goal_numeric = goal_map.get(user_features.get('goal', 'general_fitness'), 2)

        for _, food in foods_df.iterrows():
            # Use live price if available, else default
            price = live_prices.get(food['foodId'], {}).get('pricePerGram', food['default_price_per_gram'])

            feature_vector = {
                'age': user_features.get('age', 30),
                'weight_kg': user_features.get('weight_kg', 70),
                'height_cm': user_features.get('height_cm', 170),
                'gender': 1 if user_features.get('gender', 'male') == 'male' else 0,
                'activity_level': {'sedentary': 1.2, 'lightly_active': 1.375, 'moderately_active': 1.55,
                                   'very_active': 1.725, 'extremely_active': 1.9}.get(
                    user_features.get('activity_level', 'moderately_active'), 1.55),
                'goal': goal_numeric,
                'budget_per_day_lkr': user_features.get('budget_per_day_lkr', 800),
                'target_calories': user_features.get('target_calories', 2000),
                'target_protein': user_features.get('target_protein', 100),
                'target_carbs': user_features.get('target_carbs', 250),
                'target_fat': user_features.get('target_fat', 55),
                'food_calories': food['calories'],
                'food_protein': food['protein'],
                'food_carbs': food['carbs'],
                'food_fat': food['fat'],
                'food_fiber': food['fiber'],
                'food_price_per_gram': price,
                'food_category_protein': 1 if food['category'] == 'protein' else 0,
                'food_category_carbs': 1 if food['category'] == 'carbs' else 0,
                'food_category_vegetable': 1 if food['category'] == 'vegetable' else 0,
                'food_category_fruit': 1 if food['category'] == 'fruit' else 0,
                'food_category_dairy': 1 if food['category'] == 'dairy' else 0,
                'food_category_fats': 1 if food['category'] == 'fats' else 0,
            }

            X = pd.DataFrame([feature_vector])[self.feature_names]
            pred_score = self.model.predict(X)[0]

            # --- Budget Enforcement Logic (Senior SE Fix) ---
            # If food is expensive relative to the daily budget, penalize the score.
            # We estimate the cost to get ~25% of daily calories from this food.
            daily_budget = user_features.get('budget_per_day_lkr', 800)
            target_calories = user_features.get('target_calories', 2000)
            
            if food['calories'] > 0:
                # Cost for 1/4 of daily calorie target using this food
                estimated_slot_cost = (price / food['calories']) * (target_calories / 4)
                slot_budget_allowance = daily_budget / 4
                
                if estimated_slot_cost > slot_budget_allowance:
                    # Penalize score proportionally to budget overrun
                    # A 2x over-budget item gets a significant penalty
                    penalty = (estimated_slot_cost / slot_budget_allowance) - 1.0
                    pred_score -= penalty * 0.5 # Adjustment factor
            # ------------------------------------------------

            scores.append({
                'foodId': food['foodId'],
                'name': food['name'],
                'category': food['category'],
                'score': float(pred_score),
                'calories': food['calories'],
                'protein': food['protein'],
                'carbs': food['carbs'],
                'fat': food['fat'],
                'fiber': food['fiber'],
                'price_per_gram': price
            })

        # Sort by score descending
        scores.sort(key=lambda x: x['score'], reverse=True)
        return scores

    def _build_meal_plan(self, scored_foods, macro_targets, budget_per_day, days=7):
        """
        Build a 7-day meal plan from scored foods.
        Uses greedy selection with variety constraints.
        """
        plan_days = []
        total_cost = 0
        shopping_items = {}  # foodId → total grams needed

        # --- Bulk Buying & Virtual Pantry (Senior SE Fix) ---
        weekly_budget_remaining = budget_per_day * days
        pantry = {} # foodId -> grams available
        
        # Define minimum bulk buy chunks to simulate real shopping
        min_buy_grams = {
            'protein': 400,
            'carbs': 1000,
            'vegetable': 500,
            'fruit': 500,
            'dairy': 500,
            'fats': 250
        }
        # ----------------------------------------------------

        for day_idx in range(days):
            day_meals = []
            day_calories = 0
            used_today = set()  # prevent same food twice in a day

            for slot in MEAL_SLOTS:
                slot_calories = macro_targets['calories'] * slot['calorie_share']
                meal_items = []
                meal_calories = 0
                meal_macros = {'protein': 0, 'carbs': 0, 'fats': 0, 'fiber': 0}
                meal_cost = 0

                # Pick top foods not used today
                candidates = [f for f in scored_foods if f['foodId'] not in used_today]

                # Add variety: rotate which foods are prioritized per day
                offset = day_idx * 2
                
                # If we have items in our pantry, prioritize finishing them so they don't go to waste
                pantry_items = [f for f in candidates if pantry.get(f['foodId'], 0) > 0]
                non_pantry_items = [f for f in candidates if pantry.get(f['foodId'], 0) == 0]
                
                rotated = pantry_items + non_pantry_items[offset:] + non_pantry_items[:offset]

                foods_selected_for_slot = 0
                
                for food in rotated:
                    if foods_selected_for_slot >= slot['foods_count']:
                        break # We have enough foods for this slot
                        
                    # Calculate portion to fill calorie target for this slot
                    if food['calories'] > 0:
                        portion_g = round((slot_calories / slot['foods_count']) / food['calories'] * 100)
                        portion_g = max(30, min(portion_g, 400))  # clamp 30g-400g
                    else:
                        portion_g = 100

                    grams_needed = portion_g
                    in_pantry = pantry.get(food['foodId'], 0)
                    
                    purchase_cost = 0
                    buy_amount = 0

                    if in_pantry < grams_needed:
                        # We need to buy more. Simulate a bulk purchase.
                        buy_amount = max(grams_needed - in_pantry, min_buy_grams.get(food['category'], 300))
                        purchase_cost = buy_amount * food['price_per_gram']
                        
                        # Affordability check against the remaining WEEKLY budget!
                        # We allow a tiny 5% buffer on the weekly budget for rounding leniency
                        if purchase_cost > (weekly_budget_remaining * 1.05):
                            # Too expensive to buy in bulk. 
                            cheapest_prices = sorted([f['price_per_gram'] for f in scored_foods])[:3]
                            if food['price_per_gram'] not in cheapest_prices:
                                continue # Skip this food entirely, cannot afford the bulk buy
                                
                            # If it's a staple (rice/lentils), buy exactly what's needed as a fallback, overriding bulk rules
                            buy_amount = grams_needed - in_pantry
                            purchase_cost = buy_amount * food['price_per_gram']
                            
                        # Execute purchase block
                        weekly_budget_remaining -= purchase_cost
                        pantry[food['foodId']] = in_pantry + buy_amount
                        
                        # Update the master shopping list with what we just put in the cart
                        if food['foodId'] in shopping_items:
                            shopping_items[food['foodId']]['quantity'] += buy_amount
                        else:
                            shopping_items[food['foodId']] = {
                                'foodId': food['foodId'],
                                'name': food['name'],
                                'quantity': buy_amount,
                                'unit': 'g',
                                'category': food['category'],
                                'price_per_gram': food['price_per_gram']
                            }

                    # Now that the pantry is stocked, deduct what we eat for this meal
                    pantry[food['foodId']] -= portion_g
                    
                    # Compute value of the meal on the plate (not the bulk purchase cost)
                    value_on_plate = food['price_per_gram'] * portion_g
                    item_cal = food['calories'] * portion_g / 100

                    # Accept the food into the meal
                    foods_selected_for_slot += 1

                    meal_items.append({
                        'foodId': food['foodId'],
                        'food': food['name'],
                        'quantity': portion_g,
                        'unit': 'g'
                    })

                    meal_calories += item_cal
                    meal_macros['protein'] += food['protein'] * portion_g / 100
                    meal_macros['carbs'] += food['carbs'] * portion_g / 100
                    meal_macros['fats'] += food['fat'] * portion_g / 100
                    meal_macros['fiber'] += food['fiber'] * portion_g / 100
                    meal_cost += value_on_plate
                    used_today.add(food['foodId'])

                day_meals.append({
                    'mealType': slot['type'],
                    'items': meal_items,
                    'calories': round(meal_calories),
                    'macros': {k: round(v, 1) for k, v in meal_macros.items()},
                    'estimatedCost': {'amount': round(meal_cost, 2), 'currency': 'LKR'}
                })

                day_calories += meal_calories
                total_cost += meal_cost

            plan_days.append({
                'dayOfWeek': day_idx,
                'dayName': DAY_NAMES[day_idx],
                'meals': day_meals,
                'totalCalories': round(day_calories),
            })

        # Build shopping list
        shopping_list = []
        shopping_total = 0
        for item in shopping_items.values():
            cost = round(item['price_per_gram'] * item['quantity'], 2)
            shopping_list.append({
                'foodId': item['foodId'],
                'name': item['name'],
                'quantity': round(item['quantity']),
                'unit': item['unit'],
                'category': item['category'],
                'priceAtGeneration': cost,
                'currentPrice': cost,
                'store': 'Best Price'
            })
            shopping_total += cost

        return plan_days, shopping_list, round(shopping_total, 2)

    def recommend(self, user_profile, live_prices=None):
        """
        Main entry point. Returns a structured diet plan recommendation.

        Args:
            user_profile: dict with user metrics, goals, dietary prefs
            live_prices: dict of { foodId: { pricePerGram: float } } from MongoDB

        Returns:
            dict with days, shopping list, macros, cost, confidence
        """
        start_time = time.time()
        if live_prices is None:
            live_prices = {}

        # 1. Calculate targets
        tdee = self._calculate_tdee(user_profile)
        macros = self._get_macro_targets(user_profile, tdee)

        # Add targets to user profile for scoring
        user_profile['target_calories'] = macros['calories']
        user_profile['target_protein'] = macros['protein']
        user_profile['target_carbs'] = macros['carbs']
        user_profile['target_fat'] = macros['fat']

        # Budget calculation
        diet_budget = user_profile.get('diet_budget', {})
        budget_amount = diet_budget.get('amount', 7000)
        budget_period = diet_budget.get('period', 'weekly')
        if budget_period == 'weekly':
            budget_per_day = budget_amount / 7
        elif budget_period == 'monthly':
            budget_per_day = budget_amount / 30
        else:
            budget_per_day = budget_amount
        user_profile['budget_per_day_lkr'] = budget_per_day

        # 2. Filter foods
        dietary_prefs = user_profile.get('dietary_preferences', [])
        foods_df = get_foods_by_dietary(
            is_vegetarian='vegetarian' in dietary_prefs,
            is_vegan='vegan' in dietary_prefs,
            is_gluten_free='gluten_free' in dietary_prefs,
            is_dairy_free='dairy_free' in dietary_prefs
        )

        # 3. Score all foods
        scored_foods = self._score_foods(user_profile, foods_df, live_prices)

        # 4. Build meal plan
        days, shopping_list, shopping_total = self._build_meal_plan(
            scored_foods, macros, budget_per_day
        )

        inference_time = round((time.time() - start_time) * 1000, 1)

        # 5. Calculate confidence (based on how well we hit targets)
        avg_daily_cal = sum(d['totalCalories'] for d in days) / 7
        cal_accuracy = 1.0 - abs(avg_daily_cal - macros['calories']) / macros['calories']
        budget_compliance = 1.0 if shopping_total / 7 <= budget_per_day else budget_per_day / (shopping_total / 7)
        confidence = round(min(cal_accuracy * 0.6 + budget_compliance * 0.4, 1.0), 3)

        # Top features for explainability
        top_features = []
        if self.metrics and 'feature_names' in self.metrics:
            importances = self.model.feature_importances_
            sorted_idx = np.argsort(importances)[::-1][:5]
            for idx in sorted_idx:
                top_features.append({
                    'feature': self.metrics['feature_names'][idx],
                    'importance': round(float(importances[idx]), 4)
                })

        return {
            'days': days,
            'targetCalories': macros['calories'],
            'macroSplit': {
                'protein': {'grams': macros['protein'], 'percentage': round(macros['protein'] * 4 / macros['calories'] * 100)},
                'carbs': {'grams': macros['carbs'], 'percentage': round(macros['carbs'] * 4 / macros['calories'] * 100)},
                'fats': {'grams': macros['fat'], 'percentage': round(macros['fat'] * 9 / macros['calories'] * 100)}
            },
            'shoppingList': {
                'items': shopping_list,
                'totalAtGeneration': shopping_total,
                'currentTotal': shopping_total,
                'currency': 'LKR'
            },
            'aiMetadata': {
                'mlModelVersion': self.version,
                'mlConfidenceScore': confidence,
                'mlInferenceTimeMs': inference_time,
                'generationMethod': 'ml_plus_gpt',
                'featureImportance': top_features,
                'tdee': round(tdee),
                'foodsConsidered': len(foods_df),
                'foodsSelected': len(set(
                    item['foodId'] for day in days for meal in day['meals'] for item in meal['items']
                ))
            }
        }


# Quick test
if __name__ == '__main__':
    recommender = DietRecommender()

    test_user = {
        'age': 25,
        'weight_kg': 75,
        'height_cm': 178,
        'gender': 'male',
        'activity_level': 'moderately_active',
        'goal': 'muscle_gain',
        'dietary_preferences': [],
        'diet_budget': {'amount': 7000, 'currency': 'LKR', 'period': 'weekly'}
    }

    result = recommender.recommend(test_user)
    print(f"\n🎯 Target: {result['targetCalories']} cal/day")
    print(f"💰 Shopping total (7 days): LKR {result['shoppingList']['totalAtGeneration']}")
    print(f"🤖 Confidence: {result['aiMetadata']['mlConfidenceScore']}")
    print(f"⚡ Inference: {result['aiMetadata']['mlInferenceTimeMs']}ms")
    print(f"\n📅 Day 1:")
    for meal in result['days'][0]['meals']:
        foods = ', '.join([f"{i['food']} ({i['quantity']}g)" for i in meal['items']])
        print(f"   {meal['mealType']}: {foods} — {meal['calories']} cal, LKR {meal['estimatedCost']['amount']}")
