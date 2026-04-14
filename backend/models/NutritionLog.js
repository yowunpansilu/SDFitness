const mongoose = require('mongoose');

const nutritionLogSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
        required: true
    },
    items: [{
        foodName: { type: String, required: true },
        quantity: { type: Number },
        unit: { type: String, default: 'g' },
        calories: { type: Number, required: true },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fats: { type: Number, default: 0 }
    }],
    totalCalories: {
        type: Number,
        required: true
    },
    totalProtein: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
    totalFats: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Index for quick daily lookup
nutritionLogSchema.index({ memberId: 1, date: -1 });

module.exports = mongoose.model('NutritionLog', nutritionLogSchema);
