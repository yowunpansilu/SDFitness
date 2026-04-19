const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },

    planName: { type: String, default: 'Custom Diet Plan' },
    generatedAt: { type: Date, default: Date.now },
    validUntil: Date,

    // Nutritional Targets
    targetCalories: { type: Number, required: true, min: 1000, max: 10000 },
    macroSplit: {
        protein: { grams: Number, percentage: Number },
        carbs: { grams: Number, percentage: Number },
        fats: { grams: Number, percentage: Number }
    },

    // Budget
    budget: {
        amount: Number,
        currency: { type: String, default: 'LKR' },
        period: {
            type: String,
            enum: ['daily', 'weekly', 'monthly']
        }
    },

    // Weekly Meals — 7 days × meal slots
    days: [{
        dayOfWeek: { type: Number, min: 0, max: 6 },
        dayName: String,
        meals: [{
            mealType: {
                type: String,
                enum: ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack'],
                required: true
            },
            name: String,
            items: [{
                foodId: String,       // links to FoodPrice.foodId
                food: String,         // display name
                quantity: Number,     // in grams
                unit: { type: String, default: 'g' }
            }],
            calories: Number,
            macros: {
                protein: Number,
                carbs: Number,
                fats: Number,
                fiber: Number
            },
            estimatedCost: {
                amount: Number,
                currency: { type: String, default: 'LKR' }
            },
            // GPT-generated content
            instructions: [String],
            essentialIngredients: [String],
            prepTime: Number,
            cookTime: Number,
            description: String
        }]
    }],

    // Shopping List (price-aware)
    shoppingList: {
        items: [{
            foodId: { type: String, required: true },
            name: String,
            quantity: Number,
            unit: String,
            category: { type: String },
            priceAtGeneration: Number,
            currentPrice: Number,
            store: String,
            checked: { type: Boolean, default: false },
            isEssential: { type: Boolean, default: false }
        }],
        totalAtGeneration: Number,
        currentTotal: Number,
        lastPriceUpdate: Date,
        priceChanged: { type: Boolean, default: false }
    },

    // AI Metadata
    aiMetadata: {
        mlModelVersion: String,
        mlConfidenceScore: Number,       // 0.0 - 1.0
        mlInferenceTimeMs: Number,
        gptModel: { type: String, default: 'gpt-4' },
        gptPromptVersion: String,
        generationMethod: { type: String, default: 'ml_plus_gemini' },
        featureImportance: [{
            feature: String,
            importance: Number
        }]
    },

    // Status
    isActive: { type: Boolean, default: true },
    isFavorite: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['generating', 'completed', 'failed'],
        default: 'generating'
    },

    // Member Feedback (feeds collaborative filtering)
    rating: { type: Number, min: 1, max: 5 },
    feedback: String
}, {
    timestamps: true
});

// Indexes
dietPlanSchema.index({ memberId: 1 });
dietPlanSchema.index({ isActive: 1 });
dietPlanSchema.index({ generatedAt: -1 });
dietPlanSchema.index({ status: 1 });
dietPlanSchema.index({ 'aiMetadata.generationMethod': 1 });

module.exports = mongoose.model('DietPlan', dietPlanSchema);
