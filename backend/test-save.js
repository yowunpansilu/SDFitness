const mongoose = require('mongoose');
const DietPlan = require('./models/DietPlan');
require('dotenv').config();

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sdfitness');
        console.log('Connected to MongoDB');

        const samplePlan = {
            memberId: new mongoose.Types.ObjectId(), // Dummy ID
            planName: 'Test Save Plan',
            targetCalories: 2000,
            macroSplit: {
                protein: { grams: 100, percentage: 20 },
                carbs: { grams: 250, percentage: 50 },
                fats: { grams: 66, percentage: 30 }
            },
            days: [{
                dayOfWeek: 1,
                dayName: 'Monday',
                meals: [{
                    mealType: 'breakfast',
                    name: 'Oats',
                    items: [{ foodId: 'oats', food: 'Oats', quantity: 100 }],
                    calories: 400,
                    macros: { protein: 10, carbs: 60, fats: 5, fiber: 5 },
                    estimatedCost: { amount: 50, currency: 'LKR' }
                }]
            }],
            shoppingList: {
                items: [{ foodId: 'oats', name: 'Oats', quantity: 700, unit: 'g', priceAtGeneration: 350 }],
                totalAtGeneration: 350,
                currentTotal: 350
            },
            status: 'completed'
        };

        console.log('Attempting to save...');
        const dietPlan = new DietPlan(samplePlan);
        await dietPlan.save();
        console.log('✅ Save successful! ID:', dietPlan._id);

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Save failed:', error.message);
        if (error.errors) {
            console.error('Validation Errors:', Object.keys(error.errors).map(k => `${k}: ${error.errors[k].message}`).join(', '));
        }
        process.exit(1);
    }
}

test();
