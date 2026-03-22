// Types for diet plan data structures — updated for ML pipeline
import api from './axios';
import { useAuthStore } from '../stores/authStore';

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
    try {
        const memberId = useAuthStore.getState().user?.memberId;
        if (!memberId) throw new Error('User is not a registered member');

        const response = await api.post('/diet-plans/generate', {
            memberId,
            ...formData
        });

        const plan = response.data.data;
        return {
            ...plan,
            id: plan._id,
            name: plan.planName,
            goal: formData.goal,
            createdAt: new Date(plan.createdAt),
        };
    } catch (error) {
        console.warn('⚠️ Backend error, using mock data for now:', error);
        return generateMockDietPlan(formData);
    }
}

/**
 * Get all diet plans for the current member
 */
export async function getDietPlans(): Promise<DietPlan[]> {
    const memberId = useAuthStore.getState().user?.memberId;
    if (!memberId) {
        console.warn('⚠️ User has no memberId, returning empty diet plans');
        return [];
    }

    const response = await api.get(`/diet-plans?memberId=${memberId}`);
    return response.data.data;
}

/**
 * Get a specific diet plan
 */
export async function getDietPlan(planId: string): Promise<DietPlan> {
    const response = await api.get(`/diet-plans/${planId}`);
    const result = response.data;
    return { ...result.data, id: result.data._id };
}

/**
 * Get live cost recalculation for a plan
 */
export async function getPlanCost(planId: string) {
    const response = await api.get(`/diet-plans/${planId}/cost`);
    return response.data.data;
}

/**
 * Get all food prices
 */
export async function getFoodPrices() {
    const response = await api.get('/prices');
    return response.data.data;
}

// ============================================================
// Mock Fallback (when backend is not running)
// ============================================================

function generateMockDietPlan(formData: WizardFormData): DietPlan {
    const mockMeals: Meal[] = [
        {
            id: '1', mealType: 'breakfast', name: 'Protein Oatmeal Bowl',
            items: [{ foodId: 'oats', food: 'Oats', quantity: 100, unit: 'g' }, { foodId: 'banana', food: 'Banana', quantity: 120, unit: 'g' }],
            calories: 350, macros: { calories: 350, protein: 25, carbs: 45, fats: 8, fiber: 5 },
            estimatedCost: { amount: 180, currency: 'LKR' },
            description: 'Hearty oatmeal packed with protein and fiber',
            instructions: ['Cook oats with water', 'Stir in protein powder', 'Top with sliced banana'],
            prepTime: 10, cookTime: 5, protein: 25, carbs: 45, fats: 8, ingredients: ['100g oats', '1 banana'], servings: 1
        },
        {
            id: '2', mealType: 'lunch', name: 'Chicken & Rice Bowl',
            items: [{ foodId: 'chicken_breast', food: 'Chicken Breast', quantity: 200, unit: 'g' }, { foodId: 'brown_rice', food: 'Brown Rice', quantity: 150, unit: 'g' }],
            calories: 550, macros: { calories: 550, protein: 55, carbs: 50, fats: 12, fiber: 3 },
            estimatedCost: { amount: 420, currency: 'LKR' },
            description: 'Classic muscle-building lunch',
            instructions: ['Grill chicken breast', 'Cook brown rice', 'Serve together with steamed vegetables'],
            prepTime: 15, cookTime: 20, protein: 55, carbs: 50, fats: 12, ingredients: ['200g chicken breast', '150g brown rice'], servings: 1
        },
        {
            id: '3', mealType: 'dinner', name: 'Lentil & Spinach Curry',
            items: [{ foodId: 'red_lentils', food: 'Red Lentils', quantity: 100, unit: 'g' }, { foodId: 'spinach', food: 'Spinach', quantity: 200, unit: 'g' }],
            calories: 400, macros: { calories: 400, protein: 28, carbs: 55, fats: 5, fiber: 12 },
            estimatedCost: { amount: 250, currency: 'LKR' },
            description: 'Protein-rich Sri Lankan dhal curry',
            instructions: ['Cook lentils until soft', 'Sauté spinach with garlic', 'Combine and season with turmeric'],
            prepTime: 10, cookTime: 25, protein: 28, carbs: 55, fats: 5, ingredients: ['100g red lentils', '200g spinach'], servings: 1
        },
        {
            id: '4', mealType: 'morning_snack', name: 'Yogurt & Banana',
            items: [{ foodId: 'yogurt', food: 'Plain Yogurt', quantity: 150, unit: 'g' }, { foodId: 'banana', food: 'Banana', quantity: 100, unit: 'g' }],
            calories: 180, macros: { calories: 180, protein: 15, carbs: 25, fats: 2, fiber: 3 },
            estimatedCost: { amount: 120, currency: 'LKR' },
            description: 'Light protein snack', instructions: ['Mix yogurt with sliced banana'],
            prepTime: 2, cookTime: 0, protein: 15, carbs: 25, fats: 2, ingredients: ['150g yogurt', '1 banana'], servings: 1
        },
    ];

    const createDay = (dayIdx: number): DayPlan => ({
        dayOfWeek: dayIdx,
        dayName: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayIdx],
        meals: mockMeals.map(m => ({ ...m, id: `${dayIdx}-${m.id}` })),
        totalCalories: mockMeals.reduce((s, m) => s + m.calories, 0),
    });

    return {
        _id: 'mock-' + Date.now(),
        id: 'mock-' + Date.now(),
        memberId: 'demo',
        planName: `${formData.goal} Plan`,
        name: `${formData.goal} Plan`,
        goal: formData.goal,
        targetCalories: 2200,
        macroSplit: {
            protein: { grams: 120, percentage: 30 },
            carbs: { grams: 175, percentage: 35 },
            fats: { grams: 70, percentage: 35 },
        },
        days: Array.from({ length: 7 }, (_, i) => createDay(i)),
        shoppingList: {
            items: [
                { id: '1', foodId: 'oats', name: 'Oats', quantity: 700, unit: 'g', category: 'carbs', priceAtGeneration: 434, currentPrice: 434, checked: false },
                { id: '2', foodId: 'chicken_breast', name: 'Chicken Breast', quantity: 1400, unit: 'g', category: 'protein', priceAtGeneration: 2030, currentPrice: 2030, checked: false },
                { id: '3', foodId: 'brown_rice', name: 'Brown Rice', quantity: 1050, unit: 'g', category: 'carbs', priceAtGeneration: 399, currentPrice: 399, checked: false },
                { id: '4', foodId: 'red_lentils', name: 'Red Lentils', quantity: 700, unit: 'g', category: 'protein', priceAtGeneration: 385, currentPrice: 385, checked: false },
                { id: '5', foodId: 'spinach', name: 'Spinach', quantity: 1400, unit: 'g', category: 'vegetable', priceAtGeneration: 392, currentPrice: 392, checked: false },
                { id: '6', foodId: 'banana', name: 'Banana', quantity: 1540, unit: 'g', category: 'fruit', priceAtGeneration: 277, currentPrice: 277, checked: false },
                { id: '7', foodId: 'yogurt', name: 'Plain Yogurt', quantity: 1050, unit: 'g', category: 'dairy', priceAtGeneration: 462, currentPrice: 462, checked: false },
            ],
            totalAtGeneration: 4379,
            currentTotal: 4379,
            priceChanged: false,
            currency: 'LKR'
        },
        aiMetadata: {
            mlModelVersion: '1.0.0',
            mlConfidenceScore: 0.85,
            mlInferenceTimeMs: 22,
            gptModel: 'gemini-2.0-flash',
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
