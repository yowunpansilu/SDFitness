"""
SDFitness ML Service — Food Database

This contains the 20 core foods with full nutritional data.
In production, this would be loaded from MongoDB. For the ML model
training and inference, we keep a local copy as a CSV/dict for speed.
"""

import pandas as pd
import os

FOODS_DB = [
    {"foodId": "chicken_breast", "name": "Chicken Breast", "category": "protein",
     "calories": 165, "protein": 31, "carbs": 0, "fat": 3.6, "fiber": 0,
     "default_price_per_gram": 1.45, "is_vegetarian": False, "is_vegan": False, "is_gluten_free": True, "is_dairy_free": True},

    {"foodId": "eggs", "name": "Eggs", "category": "protein",
     "calories": 155, "protein": 13, "carbs": 1.1, "fat": 11, "fiber": 0,
     "default_price_per_gram": 0.75, "is_vegetarian": True, "is_vegan": False, "is_gluten_free": True, "is_dairy_free": True},

    {"foodId": "brown_rice", "name": "Brown Rice", "category": "carbs",
     "calories": 370, "protein": 7.9, "carbs": 77, "fat": 2.9, "fiber": 3.5,
     "default_price_per_gram": 0.38, "is_vegetarian": True, "is_vegan": True, "is_gluten_free": True, "is_dairy_free": True},

    {"foodId": "white_rice", "name": "White Rice", "category": "carbs",
     "calories": 365, "protein": 7.1, "carbs": 80, "fat": 0.7, "fiber": 1.3,
     "default_price_per_gram": 0.29, "is_vegetarian": True, "is_vegan": True, "is_gluten_free": True, "is_dairy_free": True},

    {"foodId": "oats", "name": "Oats", "category": "carbs",
     "calories": 389, "protein": 16.9, "carbs": 66, "fat": 6.9, "fiber": 10.6,
     "default_price_per_gram": 0.62, "is_vegetarian": True, "is_vegan": True, "is_gluten_free": False, "is_dairy_free": True},

    {"foodId": "red_lentils", "name": "Red Lentils (Dhal)", "category": "protein",
     "calories": 352, "protein": 25, "carbs": 63, "fat": 1.1, "fiber": 10.7,
     "default_price_per_gram": 0.55, "is_vegetarian": True, "is_vegan": True, "is_gluten_free": True, "is_dairy_free": True},

    {"foodId": "spinach", "name": "Spinach", "category": "vegetable",
     "calories": 23, "protein": 2.9, "carbs": 3.6, "fat": 0.4, "fiber": 2.2,
     "default_price_per_gram": 0.28, "is_vegetarian": True, "is_vegan": True, "is_gluten_free": True, "is_dairy_free": True},

    {"foodId": "broccoli", "name": "Broccoli", "category": "vegetable",
     "calories": 34, "protein": 2.8, "carbs": 7, "fat": 0.4, "fiber": 2.6,
     "default_price_per_gram": 0.75, "is_vegetarian": True, "is_vegan": True, "is_gluten_free": True, "is_dairy_free": True},

    {"foodId": "sweet_potato", "name": "Sweet Potato", "category": "carbs",
     "calories": 86, "protein": 1.6, "carbs": 20, "fat": 0.1, "fiber": 3,
     "default_price_per_gram": 0.32, "is_vegetarian": True, "is_vegan": True, "is_gluten_free": True, "is_dairy_free": True},

    {"foodId": "banana", "name": "Banana", "category": "fruit",
     "calories": 89, "protein": 1.1, "carbs": 23, "fat": 0.3, "fiber": 2.6,
     "default_price_per_gram": 0.18, "is_vegetarian": True, "is_vegan": True, "is_gluten_free": True, "is_dairy_free": True},

    {"foodId": "whole_milk", "name": "Whole Milk", "category": "dairy",
     "calories": 61, "protein": 3.2, "carbs": 4.8, "fat": 3.3, "fiber": 0,
     "default_price_per_gram": 0.32, "is_vegetarian": True, "is_vegan": False, "is_gluten_free": True, "is_dairy_free": False},

    {"foodId": "yogurt", "name": "Plain Yogurt", "category": "dairy",
     "calories": 59, "protein": 10, "carbs": 3.6, "fat": 0.4, "fiber": 0,
     "default_price_per_gram": 0.44, "is_vegetarian": True, "is_vegan": False, "is_gluten_free": True, "is_dairy_free": False},

    {"foodId": "tofu", "name": "Tofu", "category": "protein",
     "calories": 76, "protein": 8, "carbs": 1.9, "fat": 4.8, "fiber": 0.3,
     "default_price_per_gram": 0.48, "is_vegetarian": True, "is_vegan": True, "is_gluten_free": True, "is_dairy_free": True},

    {"foodId": "canned_tuna", "name": "Canned Tuna", "category": "protein",
     "calories": 116, "protein": 26, "carbs": 0, "fat": 1, "fiber": 0,
     "default_price_per_gram": 2.11, "is_vegetarian": False, "is_vegan": False, "is_gluten_free": True, "is_dairy_free": True},

    {"foodId": "bread_wholemeal", "name": "Wholemeal Bread", "category": "carbs",
     "calories": 247, "protein": 13, "carbs": 41, "fat": 3.4, "fiber": 7,
     "default_price_per_gram": 0.56, "is_vegetarian": True, "is_vegan": True, "is_gluten_free": False, "is_dairy_free": True},

    {"foodId": "olive_oil", "name": "Olive Oil", "category": "fats",
     "calories": 884, "protein": 0, "carbs": 0, "fat": 100, "fiber": 0,
     "default_price_per_gram": 2.80, "is_vegetarian": True, "is_vegan": True, "is_gluten_free": True, "is_dairy_free": True},

    {"foodId": "coconut_oil", "name": "Coconut Oil", "category": "fats",
     "calories": 862, "protein": 0, "carbs": 0, "fat": 100, "fiber": 0,
     "default_price_per_gram": 0.68, "is_vegetarian": True, "is_vegan": True, "is_gluten_free": True, "is_dairy_free": True},

    {"foodId": "chicken_thigh", "name": "Chicken Thigh", "category": "protein",
     "calories": 209, "protein": 26, "carbs": 0, "fat": 10.9, "fiber": 0,
     "default_price_per_gram": 1.20, "is_vegetarian": False, "is_vegan": False, "is_gluten_free": True, "is_dairy_free": True},

    {"foodId": "carrot", "name": "Carrot", "category": "vegetable",
     "calories": 41, "protein": 0.9, "carbs": 10, "fat": 0.2, "fiber": 2.8,
     "default_price_per_gram": 0.35, "is_vegetarian": True, "is_vegan": True, "is_gluten_free": True, "is_dairy_free": True},

    {"foodId": "peanut_butter", "name": "Peanut Butter", "category": "fats",
     "calories": 588, "protein": 25, "carbs": 20, "fat": 50, "fiber": 6,
     "default_price_per_gram": 2.38, "is_vegetarian": True, "is_vegan": True, "is_gluten_free": True, "is_dairy_free": True},
]


def get_foods_dataframe():
    """Return the food database as a pandas DataFrame."""
    return pd.DataFrame(FOODS_DB)


def get_foods_by_dietary(is_vegetarian=False, is_vegan=False, is_gluten_free=False, is_dairy_free=False):
    """Filter foods by dietary constraints."""
    df = get_foods_dataframe()
    if is_vegan:
        df = df[df['is_vegan'] == True]
    elif is_vegetarian:
        df = df[df['is_vegetarian'] == True]
    if is_gluten_free:
        df = df[df['is_gluten_free'] == True]
    if is_dairy_free:
        df = df[df['is_dairy_free'] == True]
    return df


if __name__ == '__main__':
    df = get_foods_dataframe()
    print(f"Total foods: {len(df)}")
    print(f"\nBy category:")
    print(df.groupby('category').size())
    print(f"\nVegan options: {len(get_foods_by_dietary(is_vegan=True))}")
    print(f"Vegetarian options: {len(get_foods_by_dietary(is_vegetarian=True))}")
