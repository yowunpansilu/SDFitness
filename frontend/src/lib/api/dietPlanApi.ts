// Types for diet plan data structures
export interface Macros {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

export interface Meal {
    id: string;
    name: string;
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    ingredients: string[];
    instructions: string[];
    prepTime: number;
    servings: number;
    image?: string;
}

export interface DayPlan {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks: Meal[];
    totalMacros: Macros;
}

export interface ShoppingItem {
    id: string;
    name: string;
    quantity: string;
    category: string;
    checked: boolean;
}

export interface DietPlan {
    id: string;
    name: string;
    goal: string;
    weeklyPlan: {
        monday: DayPlan;
        tuesday: DayPlan;
        wednesday: DayPlan;
        thursday: DayPlan;
        friday: DayPlan;
        saturday: DayPlan;
        sunday: DayPlan;
    };
    shoppingList: ShoppingItem[];
    createdAt: Date;
    preferences: {
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

// Mock meal database
const mockMeals: Meal[] = [
    {
        id: '1',
        name: 'Protein Oatmeal Bowl',
        type: 'breakfast',
        calories: 350,
        protein: 25,
        carbs: 45,
        fats: 8,
        ingredients: ['1 cup oats', '1 scoop protein powder', '1 banana', '1 tbsp almond butter', '1/2 cup almond milk'],
        instructions: [
            'Cook oats with almond milk according to package directions',
            'Stir in protein powder while hot',
            'Top with sliced banana and almond butter',
            'Optional: add cinnamon and honey'
        ],
        prepTime: 10,
        servings: 1,
    },
    {
        id: '2',
        name: 'Grilled Chicken Salad',
        type: 'lunch',
        calories: 420,
        protein: 45,
        carbs: 25,
        fats: 15,
        ingredients: ['6oz grilled chicken breast', '2 cups mixed greens', '1/2 cup cherry tomatoes', '1/4 avocado', '2 tbsp olive oil', 'Lemon juice'],
        instructions: [
            'Season and grill chicken breast until cooked through',
            'Slice chicken and set aside',
            'Toss mixed greens with tomatoes and avocado',
            'Top with sliced chicken',
            'Drizzle with olive oil and lemon juice'
        ],
        prepTime: 20,
        servings: 1,
    },
    {
        id: '3',
        name: 'Salmon with Sweet Potato',
        type: 'dinner',
        calories: 550,
        protein: 40,
        carbs: 45,
        fats: 20,
        ingredients: ['6oz salmon fillet', '1 medium sweet potato', '2 cups broccoli', '1 tbsp olive oil', 'Garlic', 'Lemon'],
        instructions: [
            'Preheat oven to 400°F',
            'Season salmon with garlic, lemon, and olive oil',
            'Cube sweet potato and toss with olive oil',
            'Roast salmon and sweet potato for 15-20 minutes',
            'Steam broccoli until tender',
            'Serve together'
        ],
        prepTime: 30,
        servings: 1,
    },
    {
        id: '4',
        name: 'Greek Yogurt Parfait',
        type: 'snack',
        calories: 200,
        protein: 20,
        carbs: 25,
        fats: 4,
        ingredients: ['1 cup Greek yogurt', '1/2 cup berries', '2 tbsp granola', '1 tsp honey'],
        instructions: [
            'Layer Greek yogurt in a bowl',
            'Top with fresh berries',
            'Sprinkle granola on top',
            'Drizzle with honey'
        ],
        prepTime: 5,
        servings: 1,
    },
];

// Mock API function to generate diet plan
export async function generateDietPlan(formData: WizardFormData): Promise<DietPlan> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Create a week of meals
    const createDayPlan = (): DayPlan => {
        const breakfast = { ...mockMeals[0], id: Math.random().toString() };
        const lunch = { ...mockMeals[1], id: Math.random().toString() };
        const dinner = { ...mockMeals[2], id: Math.random().toString() };
        const snacks = [{ ...mockMeals[3], id: Math.random().toString() }];

        const totalMacros: Macros = {
            calories: breakfast.calories + lunch.calories + dinner.calories + snacks.reduce((sum, s) => sum + s.calories, 0),
            protein: breakfast.protein + lunch.protein + dinner.protein + snacks.reduce((sum, s) => sum + s.protein, 0),
            carbs: breakfast.carbs + lunch.carbs + dinner.carbs + snacks.reduce((sum, s) => sum + s.carbs, 0),
            fats: breakfast.fats + lunch.fats + dinner.fats + snacks.reduce((sum, s) => sum + s.fats, 0),
        };

        return { breakfast, lunch, dinner, snacks, totalMacros };
    };

    const weeklyPlan = {
        monday: createDayPlan(),
        tuesday: createDayPlan(),
        wednesday: createDayPlan(),
        thursday: createDayPlan(),
        friday: createDayPlan(),
        saturday: createDayPlan(),
        sunday: createDayPlan(),
    };

    // Generate shopping list
    const shoppingList: ShoppingItem[] = [
        { id: '1', name: 'Oats', quantity: '7 cups', category: 'Grains', checked: false },
        { id: '2', name: 'Protein Powder', quantity: '7 scoops', category: 'Supplements', checked: false },
        { id: '3', name: 'Bananas', quantity: '7', category: 'Fruits', checked: false },
        { id: '4', name: 'Almond Butter', quantity: '1 jar', category: 'Spreads', checked: false },
        { id: '5', name: 'Chicken Breast', quantity: '42 oz', category: 'Protein', checked: false },
        { id: '6', name: 'Mixed Greens', quantity: '14 cups', category: 'Vegetables', checked: false },
        { id: '7', name: 'Cherry Tomatoes', quantity: '3.5 cups', category: 'Vegetables', checked: false },
        { id: '8', name: 'Avocados', quantity: '2', category: 'Produce', checked: false },
        { id: '9', name: 'Salmon Fillets', quantity: '42 oz', category: 'Protein', checked: false },
        { id: '10', name: 'Sweet Potatoes', quantity: '7', category: 'Vegetables', checked: false },
        { id: '11', name: 'Broccoli', quantity: '14 cups', category: 'Vegetables', checked: false },
        { id: '12', name: 'Greek Yogurt', quantity: '7 cups', category: 'Dairy', checked: false },
        { id: '13', name: 'Berries', quantity: '3.5 cups', category: 'Fruits', checked: false },
        { id: '14', name: 'Granola', quantity: '1 bag', category: 'Grains', checked: false },
    ];

    return {
        id: Math.random().toString(36).substr(2, 9),
        name: `${formData.goal} Plan`,
        goal: formData.goal,
        weeklyPlan,
        shoppingList,
        createdAt: new Date(),
        preferences: {
            dietary: formData.dietaryPreferences,
            allergies: formData.allergies.split(',').map(a => a.trim()).filter(Boolean),
            budget: formData.budget,
        },
    };
}
