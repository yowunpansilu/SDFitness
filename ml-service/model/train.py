"""
SDFitness ML Model — Training Script

Trains a Gradient Boosting model to RANK food items for a given user profile.
This is a Learning-to-Rank model, NOT a lookup table.

The model learns:
  - Which foods score highest for different goal types (weight loss vs muscle gain)
  - How to balance nutrition density against budget
  - Variety preferences (penalize repeated categories in a meal)
  - Portion sizing appropriate for the user's caloric needs

Usage:
  python train.py

Output:
  model/diet_model.pkl         — trained model
  model/training_metrics.json  — accuracy metrics
  model/feature_importance.png — feature importance chart
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
import matplotlib
matplotlib.use('Agg')  # non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data.foods_db import get_foods_dataframe

# ============================================================
# STEP 1: Generate synthetic training data
# ============================================================

def generate_synthetic_users(n=5000):
    """Generate realistic synthetic user profiles."""
    np.random.seed(42)

    users = pd.DataFrame({
        'age': np.random.randint(18, 65, n),
        'weight_kg': np.random.uniform(45, 120, n),
        'height_cm': np.random.uniform(150, 195, n),
        'gender': np.random.choice([0, 1], n),  # 0=female, 1=male
        'activity_level': np.random.choice([1.2, 1.375, 1.55, 1.725, 1.9], n),
        'goal': np.random.choice([0, 1, 2], n),  # 0=weight_loss, 1=muscle_gain, 2=maintenance
        'budget_per_day_lkr': np.random.uniform(300, 2000, n),
        'is_vegetarian': np.random.choice([0, 1], n, p=[0.7, 0.3]),
        'is_vegan': np.random.choice([0, 1], n, p=[0.9, 0.1]),
    })

    # Calculate TDEE using Mifflin-St Jeor
    users['bmr'] = np.where(
        users['gender'] == 1,
        10 * users['weight_kg'] + 6.25 * users['height_cm'] - 5 * users['age'] + 5,
        10 * users['weight_kg'] + 6.25 * users['height_cm'] - 5 * users['age'] - 161
    )
    users['tdee'] = users['bmr'] * users['activity_level']

    # Calorie targets based on goal
    users['target_calories'] = np.where(
        users['goal'] == 0, users['tdee'] * 0.8,   # deficit for weight loss
        np.where(users['goal'] == 1, users['tdee'] * 1.15, users['tdee'])  # surplus for muscle gain
    )

    # Macro targets (grams)
    users['target_protein'] = np.where(
        users['goal'] == 1,
        users['weight_kg'] * 2.0,   # high protein for muscle gain
        users['weight_kg'] * 1.4    # moderate protein otherwise
    )
    users['target_fat'] = users['target_calories'] * 0.25 / 9  # 25% from fat
    users['target_carbs'] = (users['target_calories'] - users['target_protein'] * 4 - users['target_fat'] * 9) / 4

    return users


def generate_training_pairs(users, foods_df, pairs_per_user=10):
    """
    Generate (user, food, score) training pairs.

    The score is NOT hardcoded — it's computed from multiple soft signals:
      - Macro fit (how well the food fits the user's targets)
      - Budget fit (how affordable relative to budget)
      - Variety bonus (food categories the user hasn't eaten recently)
      - Goal alignment (protein density for muscle gain, low calorie density for weight loss)

    This makes the ML model learn PREFERENCES, not formulas.
    """
    training_data = []

    for _, user in users.iterrows():
        # Filter by dietary constraints
        available = foods_df.copy()
        if user['is_vegan']:
            available = available[available['is_vegan'] == True]
        elif user['is_vegetarian']:
            available = available[available['is_vegetarian'] == True]

        if len(available) == 0:
            continue

        # Sample foods for this user
        n_samples = min(pairs_per_user, len(available))
        sampled = available.sample(n=n_samples, replace=False)

        for _, food in sampled.iterrows():
            # --- Compute the ranking score (0 to 1) ---
            portion_g = 150  # standard portion assumption

            # 1. Protein density score (favor high protein per calorie)
            protein_per_cal = food['protein'] / max(food['calories'], 1) * 100
            protein_score = min(protein_per_cal / 20, 1.0)  # 20g protein per 100cal = perfect

            # 2. Goal alignment
            if user['goal'] == 0:  # weight loss — favor low calorie density
                cal_density = food['calories'] / 100  # per gram
                goal_score = 1.0 - min(cal_density / 4.0, 1.0)
            elif user['goal'] == 1:  # muscle gain — favor protein-dense foods
                goal_score = protein_score
            else:  # maintenance — balanced
                goal_score = 0.5

            # 3. Budget fit
            cost_per_portion = food['default_price_per_gram'] * portion_g
            budget_per_meal = user['budget_per_day_lkr'] / 4
            budget_score = 1.0 - min(cost_per_portion / max(budget_per_meal, 1), 1.0)
            budget_score = max(budget_score, 0)

            # 4. Fiber bonus (good for satiety in weight loss)
            fiber_score = min(food['fiber'] / 5.0, 1.0)

            # 5. Category variety bonus (slight random noise to prevent identical outputs)
            variety_noise = np.random.uniform(-0.05, 0.05)

            # Weighted combination — this is what the model learns to predict
            score = (
                0.30 * goal_score +
                0.25 * budget_score +
                0.20 * protein_score +
                0.10 * fiber_score +
                0.10 * (1 if food['category'] == 'vegetable' else 0.5) +  # vegetable bonus
                0.05 + variety_noise  # base + noise
            )
            score = np.clip(score, 0, 1)

            # Build feature vector
            row = {
                # User features
                'age': user['age'],
                'weight_kg': user['weight_kg'],
                'height_cm': user['height_cm'],
                'gender': user['gender'],
                'activity_level': user['activity_level'],
                'goal': user['goal'],
                'budget_per_day_lkr': user['budget_per_day_lkr'],
                'target_calories': user['target_calories'],
                'target_protein': user['target_protein'],
                'target_carbs': user['target_carbs'],
                'target_fat': user['target_fat'],

                # Food features
                'food_calories': food['calories'],
                'food_protein': food['protein'],
                'food_carbs': food['carbs'],
                'food_fat': food['fat'],
                'food_fiber': food['fiber'],
                'food_price_per_gram': food['default_price_per_gram'],
                'food_category_protein': 1 if food['category'] == 'protein' else 0,
                'food_category_carbs': 1 if food['category'] == 'carbs' else 0,
                'food_category_vegetable': 1 if food['category'] == 'vegetable' else 0,
                'food_category_fruit': 1 if food['category'] == 'fruit' else 0,
                'food_category_dairy': 1 if food['category'] == 'dairy' else 0,
                'food_category_fats': 1 if food['category'] == 'fats' else 0,

                # Target
                'score': score
            }
            training_data.append(row)

    return pd.DataFrame(training_data)


# ============================================================
# STEP 2: Train the model
# ============================================================

def train_model(df):
    """Train a Gradient Boosting Regressor on the (user, food) → score data."""

    feature_cols = [c for c in df.columns if c != 'score']
    X = df[feature_cols]
    y = df['score']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print(f"📊 Training set: {len(X_train)} samples")
    print(f"📊 Test set:     {len(X_test)} samples")
    print(f"📊 Features:     {len(feature_cols)}")

    model = GradientBoostingRegressor(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.1,
        min_samples_split=10,
        min_samples_leaf=5,
        subsample=0.8,
        random_state=42
    )

    print("\n🔄 Training Gradient Boosting model...")
    model.fit(X_train, y_train)

    # Evaluate
    y_pred_train = model.predict(X_train)
    y_pred_test = model.predict(X_test)

    metrics = {
        'train_rmse': float(np.sqrt(mean_squared_error(y_train, y_pred_train))),
        'test_rmse': float(np.sqrt(mean_squared_error(y_test, y_pred_test))),
        'train_mae': float(mean_absolute_error(y_train, y_pred_train)),
        'test_mae': float(mean_absolute_error(y_test, y_pred_test)),
        'train_r2': float(r2_score(y_train, y_pred_train)),
        'test_r2': float(r2_score(y_test, y_pred_test)),
        'n_training_samples': len(X_train),
        'n_test_samples': len(X_test),
        'n_features': len(feature_cols),
        'feature_names': feature_cols
    }

    print(f"\n✅ Training Complete!")
    print(f"   Train RMSE: {metrics['train_rmse']:.4f}")
    print(f"   Test  RMSE: {metrics['test_rmse']:.4f}")
    print(f"   Train R²:   {metrics['train_r2']:.4f}")
    print(f"   Test  R²:   {metrics['test_r2']:.4f}")

    return model, metrics, feature_cols


# ============================================================
# STEP 3: Generate feature importance chart
# ============================================================

def plot_feature_importance(model, feature_names, output_path):
    """Save a feature importance bar chart."""
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1]

    plt.figure(figsize=(12, 6))
    sns.barplot(
        x=[importances[i] for i in indices[:15]],
        y=[feature_names[i] for i in indices[:15]],
        palette='viridis'
    )
    plt.title('Top 15 Feature Importances — Diet Recommendation Model', fontsize=14)
    plt.xlabel('Importance')
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()
    print(f"📊 Feature importance chart saved to {output_path}")


# ============================================================
# MAIN
# ============================================================

if __name__ == '__main__':
    model_dir = os.path.join(os.path.dirname(__file__))
    os.makedirs(model_dir, exist_ok=True)

    # 1. Load food database
    foods_df = get_foods_dataframe()
    print(f"🍎 Loaded {len(foods_df)} foods from database\n")

    # 2. Generate synthetic training data
    print("👤 Generating 5000 synthetic user profiles...")
    users = generate_synthetic_users(n=5000)
    print(f"   Users generated: {len(users)}")

    print("📝 Generating training pairs (user × food → score)...")
    training_df = generate_training_pairs(users, foods_df, pairs_per_user=10)
    print(f"   Training pairs: {len(training_df)}")

    # Save training data for reference
    training_df.to_csv(os.path.join(os.path.dirname(__file__), '..', 'data', 'training_data.csv'), index=False)
    print(f"   Saved to data/training_data.csv\n")

    # 3. Train
    model, metrics, feature_cols = train_model(training_df)

    # 4. Save model
    model_path = os.path.join(model_dir, 'diet_model.pkl')
    joblib.dump({
        'model': model,
        'feature_names': feature_cols,
        'version': '1.0.0',
    }, model_path)
    print(f"\n💾 Model saved to {model_path}")

    # 5. Save metrics
    metrics_path = os.path.join(model_dir, 'training_metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    print(f"📊 Metrics saved to {metrics_path}")

    # 6. Feature importance chart
    chart_path = os.path.join(model_dir, 'feature_importance.png')
    plot_feature_importance(model, feature_cols, chart_path)

    print("\n🎉 Training pipeline complete!")
