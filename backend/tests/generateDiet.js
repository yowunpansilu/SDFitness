const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3005';
const MEMBER_ID = "69a733b4b4e70c77947f4ce2";

async function runTest() {
    console.log("🚀 Testing POST /api/diet-plans/generate");
    console.log(`   Member: ${MEMBER_ID} `);
    console.log("   Pipeline: ML model → NVIDIA API formatting → MongoDB save");
    console.log("   (This may take 15-30s for NVIDIA to respond...)\n");

    const startTime = Date.now();

    try {
        const response = await axios.post(`${BACKEND_URL}/api/diet-plans/generate`, {
            memberId: MEMBER_ID
        }, {
            timeout: 120000 // 2 minutes timeout for NVIDIA API
        });

        const elapsed = (Date.now() - startTime) / 1000;
        const data = response.data;

        if (!data.success) {
            console.error(`❌ FAILED: ${data.error}`);
            process.exit(1);
        }

        const plan = data.data;
        const aiMeta = plan.aiMetadata || {};

        console.log(`✅ Diet plan generated in ${elapsed.toFixed(1)}s!\n`);
        console.log(`  Plan ID       : ${plan._id}`);
        console.log(`  Plan Name     : ${plan.planName}`);
        console.log(`  Status        : ${plan.status}`);
        console.log(`  Target Cal    : ${plan.targetCalories} kcal/day`);
        console.log(`  Gen Method    : ${aiMeta.generationMethod || '?'}`);
        console.log(`  ML Confidence : ${aiMeta.mlConfidenceScore || '?'}`);
        console.log(`  Inference ms  : ${aiMeta.mlInferenceTimeMs || '?'}`);

        const macro = plan.macroSplit || {};
        const p = macro.protein?.grams || 0;
        const c = macro.carbs?.grams || 0;
        const f = macro.fats?.grams || 0;
        console.log(`  Macros        : P:${p}g  C:${c}g  F:${f}g\n`);

        const days = plan.days || [];
        console.log(`  Days in plan  : ${days.length}\n`);

        if (days.length > 0) {
            for (let i = 0; i < Math.min(2, days.length); i++) {
                const day = days[i];
                const meals = day.meals || [];
                console.log(`  ── ${day.dayName || 'Day'} (${meals.length} meals)`);

                for (const meal of meals) {
                    const name = meal.name || meal.mealType || "?";
                    const cals = meal.calories || "?";
                    const cost = meal.estimatedCost?.amount || "?";

                    const items = (meal.items || []).slice(0, 3).map(i => i.food || "?").join(', ');
                    const instrCount = (meal.instructions || []).length;

                    console.log(`     [${meal.mealType.padEnd(18)}] "${name}"`);
                    console.log(`       ${cals} kcal | LKR ${cost} | ${items}`);
                    console.log(`       ${instrCount} cooking steps, prep:${meal.prepTime || '?'}m cook:${meal.cookTime || '?'}m`);
                    if (meal.instructions && meal.instructions.length > 0) {
                        meal.instructions.forEach((step, idx) => {
                            console.log(`         ${idx + 1}. ${step}`);
                        });
                    }
                }
                console.log();
            }
        }

        const sl = plan.shoppingList || {};
        const items = sl.items || [];
        const total = sl.totalAtGeneration || 0;

        console.log(`  Shopping list : ${items.length} items | Total: LKR ${Math.round(total)}/week`);
        if (items.length > 0) {
            for (let i = 0; i < Math.min(5, items.length); i++) {
                const item = items[i];
                console.log(`    • ${String(item.name || '?').padEnd(20)} ${item.quantity || '?'}g`);
            }
        }

        console.log("\n✅ Full pipeline OK:\n   ML model → NVIDIA API → MongoDB → API response");

    } catch (error) {
        console.error(`\n❌ Request Failed: ${error.message}`);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Data:`, error.response.data);
        }
        process.exit(1);
    }
}

runTest();
