# SDFitness Budget & Meal Planning Logic

This document details how the Machine Learning recommendation engine (`_build_meal_plan` in `recommender.py`) dynamically constructs meal plans while strictly honoring the user's weekly budget constraint.

## The Challenge

Initially, the ML service used a **"Per-Meal Micro-Budgeting"** approach. It would take a weekly budget (e.g., LKR 15,000), break it into a tiny allowance per meal slot (e.g., LKR 750 for lunch), and reject any food that cost more than that micro-budget. 

This model failed in real-world scenarios: buying exactly 132g of Salmon is impossible. You buy a 400g fillet. By analyzing foods purely on a per-meal cost rather than bulk cost, the system systematically filtered out all premium foods (Salmon, Beef) even on high budgets because the upfront cost of the single item exceeded the micro-budget of the single meal.

## The Solution: The "Virtual Pantry" System

To accurately model real-world grocery shopping, the logic was rewritten to use a **Dynamic Knapsack Algorithm** supported by a Virtual Pantry.

### 1. The Master Wallet
Instead of dividing the budget per meal, the overall weekly budget (e.g., **LKR 15,000**) is placed into a "Master Wallet" (`weekly_budget_remaining`) at the beginning of the generation loop.

### 2. Logical Bulk Purchasing
When the algorithm decides to use a food, it does not buy the exact milligram required for that single plate. It enforces **Real-World Minimum Buy Sizes**:
- `protein`: 400g minimum
- `carbs`: 1000g minimum
- `vegetables/fruits/dairy`: 500g minimum
- `fats`: 250g minimum

### 3. Inventory Tracking (The Pantry)
The generation loop mimics human behavior:

1.  **Check Pantry:** The AI needs 150g of Chicken for Monday Lunch. It checks the `pantry` dictionary.
2.  **Purchase (If Empty):** If there is no Chicken, it "purchases" the minimum bulk amount (400g) using the Master Wallet. If the purchase exceeds the remaining Master Wallet budget, the item is skipped for a cheaper alternative.
3.  **Stock & Consume:** It adds 400g of Chicken to the Pantry, immediately consumes 150g for Lunch, leaving 250g in the Virtual Pantry.
4.  **Reuse:** When Tuesday Dinner rolls around and the AI wants Chicken again, it checks the Pantry, finds 250g, and uses it. The cost to the Master Wallet for Tuesday Dinner's chicken is **LKR 0** (because it was already paid for on Monday).

### 4. Safety Fail-Safes

To prevent the algorithm from returning zero meals if the user provides an impossibly tight budget (e.g., LKR 500/week), the algorithm bypasses the strict filter for the **3 absolute cheapest ingredients** in the global database (usually staples like White Rice or Lentils). For these extreme budget scenarios, the algorithm is permitted to buy exactly the grams needed rather than adhering to the bulk minimums, ensuring the user still receives a viable survival plan.

## Expected Outcomes

Because of this systemic shift:
*   **High Budgets (LKR 15,000+)**: Successfully trigger the bulk purchase of premium meats (Salmon, Beef) and spread them intelligently across the week.
*   **Low Budgets (LKR ~2,500)**: Strictly cap the Master Wallet, forcing the algorithm to rely exclusively on cheap bulk staples (Lentils, Rice, Eggs).
*   **Shopping Lists**: Output beautiful, round numbers (e.g., 400g Salmon, 1000g Rice) reflecting how humans actually shop in supermarkets.
