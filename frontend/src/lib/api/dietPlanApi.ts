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
    _id?: string;
    mealType: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';
    name: string;
    items: MealItem[];
    calories: number;
    macros: Macros;
    estimatedCost: { amount: number; currency: string };
    description?: string;
    instructions?: string[];
    essentialIngredients?: string[];
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
    isEssential?: boolean;
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
    const { member } = useAuthStore.getState();
    const memberId = member?._id;

    if (!memberId) {
        throw new Error('No member profile found. Please complete your profile first.');
    }

    const response = await api.post('/diet-plans/generate', {
        ...formData,
        memberId
    });

    if (response.data.success) {
        const plan = response.data.data;
        return {
            ...plan,
            id: plan._id,
            name: plan.planName || 'AI Diet Plan',
            goal: formData.goal,
            createdAt: plan.createdAt ? new Date(plan.createdAt) : new Date(),
        };
    } else {
        throw new Error(response.data.error || 'Failed to generate plan');
    }
}

/**
 * Persist a generated diet plan to the database (create)
 */
export async function saveDietPlan(plan: DietPlan): Promise<DietPlan> {
    const response = await api.post('/diet-plans', plan);
    return { ...response.data.data, id: response.data.data._id };
}

/**
 * Update an existing diet plan
 */
export async function updateDietPlan(planId: string, updates: Partial<DietPlan>): Promise<DietPlan> {
    const response = await api.put(`/diet-plans/${planId}`, updates);
    return { ...response.data.data, id: response.data.data._id };
}

/**
 * Fetch all diet plans for the current user
 */
export async function fetchDietPlans(memberId?: string): Promise<DietPlan[]> {
    const response = await api.get('/diet-plans', { params: { memberId } });
    if (response.data.success) {
        return response.data.data.map((plan: any) => ({
            ...plan,
            id: plan._id,
            name: plan.planName || 'AI Diet Plan',
            createdAt: plan.createdAt ? new Date(plan.createdAt) : new Date()
        }));
    }
    return [];
}

/**
 * Get a specific diet plan
 */
export async function getDietPlan(planId: string): Promise<DietPlan> {
    const response = await api.get(`/diet-plans/${planId}`);
    return { ...response.data.data, id: response.data.data._id };
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
