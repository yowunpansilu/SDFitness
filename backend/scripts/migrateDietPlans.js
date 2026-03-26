/**
 * Migration: Update legacy DietPlan documents to new shoppingList format
 *
 * Adds the price-tracking shoppingList structure to any existing dietPlan that
 * was created before the ML pipeline was introduced (Phase 4).
 *
 * Run once with:
 *   node scripts/migrateDietPlans.js
 *
 * It is idempotent — safe to run multiple times. Plans already using the new
 * format are skipped automatically.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const DietPlan = require('../models/DietPlan');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sdfitness';

async function migrate() {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find plans that are missing the shoppingList structure
    const legacyPlans = await DietPlan.find({
        $or: [
            { 'shoppingList.items': { $exists: false } },
            { shoppingList: { $exists: false } }
        ]
    });

    console.log(`📋 Found ${legacyPlans.length} legacy plan(s) to migrate.`);

    if (legacyPlans.length === 0) {
        console.log('🎉 Nothing to migrate. All plans are up to date.');
        await mongoose.disconnect();
        return;
    }

    let migrated = 0;
    let skipped = 0;

    for (const plan of legacyPlans) {
        try {
            // Build a minimal shoppingList from the meal items already stored
            const foodTotals = {};

            for (const day of plan.days || []) {
                for (const meal of day.meals || []) {
                    for (const item of meal.items || []) {
                        const key = item.foodId || item.food?.toLowerCase().replace(/\s+/g, '_') || 'unknown';
                        if (!foodTotals[key]) {
                            foodTotals[key] = {
                                foodId: key,
                                name: item.food || key,
                                quantity: 0,
                                unit: item.unit || 'g',
                                category: 'other',
                                priceAtGeneration: 0,
                                currentPrice: 0,
                                store: null
                            };
                        }
                        foodTotals[key].quantity += item.quantity || 0;
                    }
                }
            }

            plan.shoppingList = {
                items: Object.values(foodTotals),
                totalAtGeneration: 0,
                currentTotal: 0,
                lastPriceUpdate: new Date(),
                priceChanged: false
            };

            // Mark as gemini-only if no aiMetadata exists
            if (!plan.aiMetadata || !plan.aiMetadata.generationMethod) {
                plan.aiMetadata = {
                    generationMethod: 'gemini_only_fallback',
                    gptModel: 'gemini-2.0-flash',
                    mlConfidenceScore: 0
                };
            }

            await plan.save();
            console.log(`  ✅ Migrated plan ${plan._id} (${plan.planName})`);
            migrated++;
        } catch (err) {
            console.error(`  ❌ Failed to migrate plan ${plan._id}: ${err.message}`);
            skipped++;
        }
    }

    console.log(`\n📊 Migration complete: ${migrated} migrated, ${skipped} skipped.`);
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
}

migrate().catch(err => {
    console.error('Fatal migration error:', err);
    process.exit(1);
});
