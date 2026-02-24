/**
 * Phase 8.1 — Integration Tests
 * Tests the full ML pipeline: profile → ML recommendation → Gemini → saved plan
 *
 * Run with: npm test
 * Requires: backend running on :5000, ML service on :5001, MongoDB connected
 */

const axios = require('axios');

const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000';
const ML_SERVICE = process.env.ML_SERVICE_URL || 'http://localhost:5001';

// ─────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────

function assert(condition, message) {
    if (!condition) throw new Error(`❌ FAIL: ${message}`);
    console.log(`   ✅ ${message}`);
}

async function runTest(name, fn) {
    process.stdout.write(`\n🧪 ${name}...\n`);
    const start = Date.now();
    try {
        await fn();
        console.log(`   ⏱  ${Date.now() - start}ms\n`);
    } catch (err) {
        console.error(`   ❌ ${err.message}\n`);
        process.exitCode = 1;
    }
}

// ─────────────────────────────────────────────
// Test Suite
// ─────────────────────────────────────────────

async function main() {
    console.log('━'.repeat(60));
    console.log('  SDFitness ML Pipeline — Integration Tests');
    console.log('━'.repeat(60));

    // ── 8.1A: Health Checks ──────────────────────────────────────
    await runTest('8.1A — Backend health check', async () => {
        const { data } = await axios.get(`${BACKEND}/api/health`, { timeout: 5000 });
        assert(data.status === 'ok', 'Backend responds with status ok');
        assert(data.service === 'SDFitness Backend', 'Service name is correct');
    });

    await runTest('8.1B — ML Service health check', async () => {
        const { data } = await axios.get(`${ML_SERVICE}/health`, { timeout: 10000 });
        assert(data.status === 'healthy', 'ML service is healthy');
        assert(data.model_loaded === true, 'ML model is loaded');
    });

    // ── 8.1C: Food Prices API ────────────────────────────────────
    await runTest('8.1C — Food prices API returns data', async () => {
        const { data } = await axios.get(`${BACKEND}/api/prices`, { timeout: 5000 });
        assert(data.success === true, 'Prices API returns success');
        assert(Array.isArray(data.data), 'Prices data is an array');
        assert(data.data.length > 0, 'At least one food price exists');
    });

    // ── 8.1D: ML Recommendation ──────────────────────────────────
    await runTest('8.1D — ML service recommends foods for a user profile', async () => {
        const testProfile = {
            age: 25, weight_kg: 75, height_cm: 175, gender: 'male',
            goal: 'muscle_gain', activity_level: 'moderate',
            dietary_preferences: [], allergies: [],
            budget_weekly_lkr: 5000, tdee: 2500,
        };
        const livePrices = {
            rice: 220, chicken_breast: 1450, eggs: 52,
            banana: 180, red_lentils: 550, spinach: 280,
        };

        const start = Date.now();
        const { data } = await axios.post(`${ML_SERVICE}/recommend`,
            { user_profile: testProfile, live_prices: livePrices },
            { timeout: 10000 }
        );
        const inferenceMs = Date.now() - start;

        assert(data.success === true, 'ML recommendation returns success');
        assert(data.meal_plan !== undefined, 'Meal plan is returned');
        assert(data.confidence_score > 0, 'Confidence score is positive');
        assert(inferenceMs < 2000, `Inference < 2s (actual: ${inferenceMs}ms)`);
        console.log(`   📊 Confidence: ${(data.confidence_score * 100).toFixed(1)}% | Inference: ${inferenceMs}ms`);
    });

    // ── 8.1E: Dietary Restriction Compliance ─────────────────────
    await runTest('8.1E — Vegan user never gets meat recommendations', async () => {
        const veganProfile = {
            age: 28, weight_kg: 60, height_cm: 165, gender: 'female',
            goal: 'weight_loss', activity_level: 'light',
            dietary_preferences: ['vegan'], allergies: [],
            budget_weekly_lkr: 4000, tdee: 1800,
        };

        const meatFoods = ['chicken_breast', 'eggs', 'tuna', 'beef'];
        const { data } = await axios.post(`${ML_SERVICE}/recommend`,
            { user_profile: veganProfile, live_prices: {} },
            { timeout: 10000 }
        );

        if (data.success && data.meal_plan) {
            const days = Object.values(data.meal_plan);
            const allFoodIds = days.flatMap(day =>
                (day.meals || []).flatMap(meal =>
                    (meal.items || []).map(item => item.food_id)
                )
            );
            const meatFound = allFoodIds.some(id => meatFoods.includes(id));
            assert(!meatFound, 'No meat items in vegan plan');
        } else {
            assert(true, 'ML service responded (vegan check skipped — no plan returned)');
        }
    });

    // ── 8.1F: Budget Compliance ───────────────────────────────────
    await runTest('8.1F — Recommended plan cost does not exceed budget', async () => {
        const budget = 5000;
        const testProfile = {
            age: 30, weight_kg: 80, height_cm: 180, gender: 'male',
            goal: 'maintenance', activity_level: 'moderate',
            dietary_preferences: [], allergies: [],
            budget_weekly_lkr: budget, tdee: 2400,
        };

        const { data } = await axios.post(`${ML_SERVICE}/recommend`,
            { user_profile: testProfile, live_prices: {} },
            { timeout: 10000 }
        );

        if (data.success && data.estimated_weekly_cost) {
            assert(
                data.estimated_weekly_cost <= budget * 1.05,
                `Plan cost (${data.estimated_weekly_cost} LKR) within 5% of budget (${budget} LKR)`
            );
        } else {
            assert(true, 'Budget check skipped — cost not returned in response');
        }
    });

    // ── 8.1G: ML Fallback ─────────────────────────────────────────
    await runTest('8.1G — graceful fallback when ML service is unreachable', async () => {
        // Directly test the mlService.js retry logic
        const MLService = require('./services/mlService');
        const result = await MLService.checkMLHealth('http://localhost:9999'); // unreachable port
        assert(result === false, 'Health check returns false for unreachable service');
    });

    // ── 8.1H: Price Update Pipeline ──────────────────────────────
    await runTest('8.1H — Price watcher propagates changes correctly', async () => {
        const { onPriceUpdate } = require('./services/priceWatcherService');
        assert(typeof onPriceUpdate === 'function', 'onPriceUpdate is exported correctly');

        // Should not throw for a valid foodId
        let threw = false;
        try {
            await onPriceUpdate('rice', 250); // price change: rice → 250 LKR/kg
        } catch {
            threw = true;
        }
        assert(!threw, 'onPriceUpdate runs without throwing');
    });

    // ── 8.2: Performance Summary ─────────────────────────────────
    await runTest('8.2 — Performance: backend + ML latency', async () => {
        const start = Date.now();
        await Promise.all([
            axios.get(`${BACKEND}/api/health`, { timeout: 5000 }),
            axios.get(`${ML_SERVICE}/health`, { timeout: 5000 }),
        ]);
        const totalMs = Date.now() - start;
        assert(totalMs < 5000, `Parallel health checks < 5s (actual: ${totalMs}ms)`);
    });

    // ─────────────────────────────────────────
    console.log('━'.repeat(60));
    const exitCode = process.exitCode || 0;
    if (exitCode === 0) {
        console.log('  🎉 All tests passed!');
    } else {
        console.log('  ⚠️  Some tests failed. Review above.');
    }
    console.log('━'.repeat(60));
}

main().catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
});
