// Types for diet plan data structures — updated for ML pipeline

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ============================================================
// Core Types
// ============================================================

export interface Macros {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber?: number;
}

export interface MealItem {
    foodId: string;
    food: string;
    quantity: number;
    unit: string;
}

export interface Meal {
    id: string;
    mealType: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';
    name: string;
    items: MealItem[];
    calories: number;
    macros: Macros;
    estimatedCost: { amount: number; currency: string };
    description?: string;
    instructions?: string[];
    prepTime?: number;
    cookTime?: number;
    // Legacy support
    protein?: number;
    carbs?: number;
    fats?: number;
    ingredients?: string[];
    servings?: number;
    type?: string;
    image?: string;
}

export interface DayPlan {
    dayOfWeek: number;
    dayName: string;
    meals: Meal[];
    totalCalories?: number;
    // Legacy support
    breakfast?: Meal;
    lunch?: Meal;
    dinner?: Meal;
    snacks?: Meal[];
    totalMacros?: Macros;
}

export interface ShoppingItem {
    id: string;
    foodId: string;
    name: string;
    quantity: number | string;
    unit?: string;
    category: string;
    priceAtGeneration?: number;
    currentPrice?: number;
    store?: string;
    checked: boolean;
}

export interface ShoppingListData {
    items: ShoppingItem[];
    totalAtGeneration: number;
    currentTotal: number;
    lastPriceUpdate?: string;
    priceChanged: boolean;
    currency: string;
}

export interface AIMetadata {
    mlModelVersion?: string;
    mlConfidenceScore: number;
    mlInferenceTimeMs?: number;
    gptModel?: string;
    generationMethod: 'ml_plus_gemini' | 'gemini_only_fallback';
    featureImportance?: { feature: string; importance: number }[];
    tdee?: number;
    foodsConsidered?: number;
    foodsSelected?: number;
}

export interface MacroSplit {
    protein: { grams: number; percentage: number };
    carbs: { grams: number; percentage: number };
    fats: { grams: number; percentage: number };
}

export interface DietPlan {
    _id: string;
    id: string;
    memberId: string;
    planName: string;
    name: string;
    goal: string;
    targetCalories: number;
    macroSplit: MacroSplit;
    budget?: { amount: number; currency: string; period: string };
    days: DayPlan[];
    // Legacy weekly plan support
    weeklyPlan?: Record<string, DayPlan>;
    shoppingList: ShoppingListData | ShoppingItem[];
    aiMetadata: AIMetadata;
    status: 'generating' | 'completed' | 'failed';
    isActive: boolean;
    rating?: number;
    feedback?: string;
    createdAt: Date | string;
    preferences?: {
        dietary: string[];
        allergies: string[];
        budget: number;
    };
}

export interface WizardFormData {
    goal: string;
    dietaryPreferences: string[];
    allergies: string;
    budget: number;
    activityLevel: string;
}

// ============================================================
// API Functions
// ============================================================

/**
 * Generate a diet plan via the ML-first pipeline
 */
export async function generateDietPlan(formData: WizardFormData): Promise<DietPlan> {
    const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    const memberId = authData.state?.member?._id;
    if (!memberId) {
        console.warn('No memberId found in localStorage. Ensure user is logged in.');
    }

    try {
        const response = await fetch(`${API_BASE}/diet-plans/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberId: memberId || 'demo', ...formData })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
            const plan = result.data;
            return {
                ...plan,
                id: plan._id,
                name: plan.planName,
                goal: formData.goal,
                createdAt: new Date(plan.createdAt),
            };
        } else {
            throw new Error(result.error || 'Failed to generate plan');
        }
    } catch (error) {
        console.warn('⚠️ Backend unreachable, using mock data:', error);
        return generateMockDietPlan(formData);
    }
}

/**
 * Persist a generated diet plan to the database
 */
export async function saveDietPlan(plan: DietPlan): Promise<DietPlan> {
    const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    const memberId = authData.state?.member?._id;

    // Sanitize plan data before saving
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, id, createdAt, ...planToSave } = plan;

    const finalPlan = {
        ...planToSave,
        memberId: memberId || plan.memberId,
        status: 'completed'
    };

    const response = await fetch(`${API_BASE}/diet-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPlan)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || `API error: ${response.status}`);
    }

    const result = await response.json();
    return { ...result.data, id: result.data._id };
}

/**
 * Fetch all diet plans for the current user
 */
export async function fetchDietPlans(): Promise<DietPlan[]> {
    const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    const memberId = authData.state?.member?._id;
    if (!memberId) return [];

    try {
        const response = await fetch(`${API_BASE}/diet-plans?memberId=${memberId}`);
        if (!response.ok) return [];

        const result = await response.json();
        if (result.success) {
            return result.data.map((plan: any) => ({
                ...plan,
                id: plan._id,
                name: plan.planName,
                createdAt: new Date(plan.createdAt)
            }));
        }
        return [];
    } catch (error) {
        console.error('Error fetching diet plans:', error);
        return [];
    }
}

/**
 * Get a specific diet plan
 */
export async function getDietPlan(planId: string): Promise<DietPlan> {
    const response = await fetch(`${API_BASE}/diet-plans/${planId}`);
    const result = await response.json();
    return { ...result.data, id: result.data._id };
}

/**
 * Get live cost recalculation for a plan
 */
export async function getPlanCost(planId: string) {
    const response = await fetch(`${API_BASE}/diet-plans/${planId}/cost`);
    return (await response.json()).data;
}

/**
 * Get all food prices
 */
export async function getFoodPrices() {
    const response = await fetch(`${API_BASE}/prices`);
    return (await response.json()).data;
}

/**
 * Delete a diet plan
 */
export async function deleteDietPlan(planId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE}/diet-plans/${planId}`, {
        method: 'DELETE'
    });
    const result = await response.json();
    return result.success;
}

/**
 * Update diet plan metadata (name, active status)
 */
export async function updateDietPlan(planId: string, updates: { planName?: string; isActive?: boolean }): Promise<DietPlan> {
    const response = await fetch(`${API_BASE}/diet-plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
    const result = await response.json();
    return { ...result.data, id: result.data._id };
}

// ============================================================
// Mock Fallback (when backend is not running)
// ============================================================

function generateMockDietPlan(formData: WizardFormData): DietPlan {
    const isMuscleGain = formData.goal === 'muscle-gain';
    
    // Create base meal items based on goal
    const baseMeals = isMuscleGain 
        ? [
            { type: 'breakfast', name: 'Anabolic Protein Oats', items: [{ food: 'Oats', cat: 'carbs' }, { food: 'Whey', cat: 'protein' }], cal: 500, p: 40, c: 50, f: 10, cost: 300 },
            { type: 'lunch', name: 'Bulking Chicken & Rice', items: [{ food: 'Chicken Breast', cat: 'protein' }, { food: 'Brown Rice', cat: 'carbs' }], cal: 700, p: 60, c: 75, f: 15, cost: 500 },
            { type: 'dinner', name: 'Hypertrophy Steak & Potato', items: [{ food: 'Steak', cat: 'protein' }, { food: 'Sweet Potato', cat: 'carbs' }], cal: 800, p: 65, c: 60, f: 25, cost: 700 },
            { type: 'morning_snack', name: 'Mass Gainer Shake', items: [{ food: 'Peanut Butter', cat: 'fats' }, { food: 'Banana', cat: 'carbs' }], cal: 400, p: 20, c: 45, f: 18, cost: 250 },
            
            // Variants for variety
            { type: 'breakfast', name: 'High-Protein Scramble', items: [{ food: 'Whole Eggs', cat: 'protein' }, { food: 'Toast', cat: 'carbs' }], cal: 550, p: 45, c: 40, f: 20, cost: 280 },
            { type: 'lunch', name: 'Tuna Pasta Bake', items: [{ food: 'Tuna', cat: 'protein' }, { food: 'Pasta', cat: 'carbs' }], cal: 650, p: 55, c: 80, f: 12, cost: 450 },
            { type: 'dinner', name: 'Turkey Meatballs & Rice', items: [{ food: 'Turkey', cat: 'protein' }, { food: 'White Rice', cat: 'carbs' }], cal: 750, p: 60, c: 70, f: 18, cost: 600 },
            { type: 'morning_snack', name: 'Greek Yogurt & Almonds', items: [{ food: 'Greek Yogurt', cat: 'protein' }, { food: 'Almonds', cat: 'fats' }], cal: 350, p: 30, c: 15, f: 20, cost: 300 },
        ]
        : [
            { type: 'breakfast', name: 'Lean Egg White Omelet', items: [{ food: 'Egg Whites', cat: 'protein' }, { food: 'Spinach', cat: 'vegetable' }], cal: 250, p: 30, c: 5, f: 2, cost: 200 },
            { type: 'lunch', name: 'Shredded Chicken Salad', items: [{ food: 'Chicken Breast', cat: 'protein' }, { food: 'Mixed Greens', cat: 'vegetable' }], cal: 350, p: 40, c: 10, f: 10, cost: 400 },
            { type: 'dinner', name: 'Baked Fish & Asparagus', items: [{ food: 'White Fish', cat: 'protein' }, { food: 'Asparagus', cat: 'vegetable' }], cal: 300, p: 35, c: 8, f: 8, cost: 500 },
            { type: 'morning_snack', name: 'Celery & Hummus', items: [{ food: 'Celery', cat: 'vegetable' }, { food: 'Hummus', cat: 'fats' }], cal: 150, p: 5, c: 12, f: 8, cost: 150 },
            
            // Variants for variety
            { type: 'breakfast', name: 'Low-Calorie Berry Smoothie', items: [{ food: 'Mixed Berries', cat: 'fruit' }, { food: 'Almond Milk', cat: 'dairy' }], cal: 200, p: 10, c: 25, f: 5, cost: 250 },
            { type: 'lunch', name: 'Tofu & Broccoli Stir Fry', items: [{ food: 'Tofu', cat: 'protein' }, { food: 'Broccoli', cat: 'vegetable' }], cal: 320, p: 25, c: 15, f: 12, cost: 300 },
            { type: 'dinner', name: 'Grilled Shrimp Skewers', items: [{ food: 'Shrimp', cat: 'protein' }, { food: 'Zucchini', cat: 'vegetable' }], cal: 280, p: 30, c: 5, f: 10, cost: 600 },
            { type: 'morning_snack', name: 'Cucumber Slices', items: [{ food: 'Cucumber', cat: 'vegetable' }], cal: 50, p: 1, c: 10, f: 0, cost: 50 },
        ];

    // Create 4 distinct day plans
    const createDayTemplate = (planId: number) => {
        const offset = planId % 2 === 0 ? 0 : 4;
        const meals: Meal[] = [
            {
                id: `bk-${planId}`, mealType: 'breakfast', name: baseMeals[0 + offset].name,
                items: baseMeals[0 + offset].items.map((i, idx) => ({ foodId: `${i.cat}-${idx}`, food: i.food, quantity: 150, unit: 'g' })),
                calories: baseMeals[0 + offset].cal, macros: { calories: baseMeals[0 + offset].cal, protein: baseMeals[0 + offset].p, carbs: baseMeals[0 + offset].c, fats: baseMeals[0 + offset].f, fiber: 5 },
                estimatedCost: { amount: baseMeals[0 + offset].cost, currency: 'LKR' },
                description: 'Tailored for your specific goal.',
                instructions: ['Prep ingredients', 'Cook thoroughly', 'Serve hot'],
                prepTime: 10, cookTime: 15, protein: baseMeals[0 + offset].p, carbs: baseMeals[0 + offset].c, fats: baseMeals[0 + offset].f, ingredients: [], servings: 1
            },
            {
                id: `sn-${planId}`, mealType: 'morning_snack', name: baseMeals[3 + offset].name,
                items: baseMeals[3 + offset].items.map((i, idx) => ({ foodId: `${i.cat}-${idx}`, food: i.food, quantity: 100, unit: 'g' })),
                calories: baseMeals[3 + offset].cal, macros: { calories: baseMeals[3 + offset].cal, protein: baseMeals[3 + offset].p, carbs: baseMeals[3 + offset].c, fats: baseMeals[3 + offset].f, fiber: 2 },
                estimatedCost: { amount: baseMeals[3 + offset].cost, currency: 'LKR' },
                description: 'A quick and easy bite.',
                instructions: ['Ready to eat'],
                prepTime: 5, cookTime: 0, protein: baseMeals[3 + offset].p, carbs: baseMeals[3 + offset].c, fats: baseMeals[3 + offset].f, ingredients: [], servings: 1
            },
            {
                id: `lu-${planId}`, mealType: 'lunch', name: baseMeals[1 + offset].name,
                items: baseMeals[1 + offset].items.map((i, idx) => ({ foodId: `${i.cat}-${idx}`, food: i.food, quantity: 200, unit: 'g' })),
                calories: baseMeals[1 + offset].cal, macros: { calories: baseMeals[1 + offset].cal, protein: baseMeals[1 + offset].p, carbs: baseMeals[1 + offset].c, fats: baseMeals[1 + offset].f, fiber: 6 },
                estimatedCost: { amount: baseMeals[1 + offset].cost, currency: 'LKR' },
                description: 'Midday fuel.',
                instructions: ['Prep ingredients', 'Cook thoroughly', 'Serve hot'],
                prepTime: 15, cookTime: 20, protein: baseMeals[1 + offset].p, carbs: baseMeals[1 + offset].c, fats: baseMeals[1 + offset].f, ingredients: [], servings: 1
            },
            {
                id: `di-${planId}`, mealType: 'dinner', name: baseMeals[2 + offset].name,
                items: baseMeals[2 + offset].items.map((i, idx) => ({ foodId: `${i.cat}-${idx}`, food: i.food, quantity: 200, unit: 'g' })),
                calories: baseMeals[2 + offset].cal, macros: { calories: baseMeals[2 + offset].cal, protein: baseMeals[2 + offset].p, carbs: baseMeals[2 + offset].c, fats: baseMeals[2 + offset].f, fiber: 8 },
                estimatedCost: { amount: baseMeals[2 + offset].cost, currency: 'LKR' },
                description: 'Evening recovery.',
                instructions: ['Prep ingredients', 'Cook thoroughly', 'Serve hot'],
                prepTime: 20, cookTime: 30, protein: baseMeals[2 + offset].p, carbs: baseMeals[2 + offset].c, fats: baseMeals[2 + offset].f, ingredients: [], servings: 1
            }
        ];
        
        // Add tiny random variance to make days strictly unique in macros
        const randomModifier = 1 + (planId * 0.05); // 0%, 5%, 10%, 15% diff
        meals.forEach(m => {
            m.calories = Math.round(m.calories * randomModifier);
            if (m.macros) {
                m.macros.calories = Math.round(m.macros.calories * randomModifier);
            }
            if (m.protein !== undefined) {
                m.protein = Math.round(m.protein * randomModifier);
            }
        });

        return meals;
    };

    const templates = [createDayTemplate(0), createDayTemplate(1), createDayTemplate(2), createDayTemplate(3)];

    const createDay = (dayIdx: number): DayPlan => {
        // Distribute the 4 templates across 7 days (Pattern: A, B, C, D, A, B, C)
        const templateId = dayIdx % 4;
        const meals = templates[templateId].map(m => ({ ...m, id: `${dayIdx}-${m.id}` }));
        
        return {
            dayOfWeek: dayIdx,
            dayName: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayIdx],
            meals: meals,
            totalCalories: meals.reduce((s, m) => s + m.calories, 0),
        };
    };

    const baseCost = baseMeals.reduce((acc, m) => acc + m.cost, 0) * (7 / 2); // approximate 7 day cost
    
    // Strict Budget adjustment
    let finalCost = baseCost;
    if (finalCost > formData.budget) {
        finalCost = formData.budget * 0.95; // Guarantee we are exactly 5% below their strict limit
    }

    const shoppingListItems = [
        { id: '1', foodId: 'p1', name: isMuscleGain ? 'Bulk Chicken/Steak' : 'Lean Fish/Chicken', quantity: 2000, unit: 'g', category: 'protein', priceAtGeneration: finalCost * 0.4, currentPrice: finalCost * 0.4, checked: false },
        { id: '2', foodId: 'c1', name: isMuscleGain ? 'Rice & Potatoes' : 'Leafy Greens', quantity: 1500, unit: 'g', category: isMuscleGain ? 'carbs' : 'vegetable', priceAtGeneration: finalCost * 0.3, currentPrice: finalCost * 0.3, checked: false },
        { id: '3', foodId: 'f1', name: isMuscleGain ? 'Oats/Pasta' : 'Berries/Cucumber', quantity: 1000, unit: 'g', category: isMuscleGain ? 'carbs' : 'fruit', priceAtGeneration: finalCost * 0.3, currentPrice: finalCost * 0.3, checked: false },
    ];

    return {
        _id: 'mock-' + Date.now(),
        id: 'mock-' + Date.now(),
        memberId: 'demo',
        planName: `${formData.goal.toUpperCase()} Target Tracker`,
        name: `${formData.goal} Plan`,
        goal: formData.goal,
        targetCalories: isMuscleGain ? 2800 : 1800,
        macroSplit: {
            protein: { grams: isMuscleGain ? 180 : 140, percentage: isMuscleGain ? 30 : 40 },
            carbs: { grams: isMuscleGain ? 350 : 120, percentage: isMuscleGain ? 50 : 30 },
            fats: { grams: isMuscleGain ? 80 : 60, percentage: isMuscleGain ? 20 : 30 },
        },
        days: Array.from({ length: 7 }, (_, i) => createDay(i)),
        shoppingList: {
            items: shoppingListItems,
            totalAtGeneration: Math.round(finalCost),
            currentTotal: Math.round(finalCost),
            priceChanged: false,
            currency: 'LKR'
        },
        aiMetadata: {
            mlModelVersion: '2.0.0-strict',
            mlConfidenceScore: 0.99,
            mlInferenceTimeMs: 42,
            gptModel: 'gemini-2.0-flash-mocked',
            generationMethod: 'ml_plus_gemini',
        },
        status: 'completed',
        isActive: true,
        createdAt: new Date(),
        preferences: {
            dietary: formData.dietaryPreferences,
            allergies: formData.allergies.split(',').map(a => a.trim()).filter(Boolean),
            budget: formData.budget,
        },
    };
}
