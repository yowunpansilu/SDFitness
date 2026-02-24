/**
 * Price Watcher Service
 *
 * Monitors food price changes and updates active diet plans.
 * When a price changes significantly (>5%), it:
 *   1. Updates all active diet plans that use that food
 *   2. Recalculates shoppingList.currentTotal
 *   3. Sets priceChanged flag
 *   4. Logs the price change to PriceLog collection
 */

const DietPlan = require('../models/DietPlan');
const FoodPrice = require('../models/FoodPrice');
const PriceLog = require('../models/PriceLog');

/**
 * Called after a food price is updated (by scraper or admin).
 * Propagates the change to all active diet plans using that food.
 */
const onPriceUpdate = async (foodId, newPricePerGram, store, source) => {
    try {
        // 1. Get old price
        const food = await FoodPrice.findOne({ foodId });
        if (!food) return;

        const oldPricePerGram = food.lowestPricePerGram || food.averagePricePerGram;
        const changePercent = oldPricePerGram > 0
            ? ((newPricePerGram - oldPricePerGram) / oldPricePerGram) * 100
            : 0;

        // 2. Log the change
        await PriceLog.create({
            foodId,
            store,
            oldPrice: oldPricePerGram,
            newPrice: newPricePerGram,
            changePercent: Math.round(changePercent * 100) / 100,
            source
        });

        // 3. Only propagate if change > 5%
        if (Math.abs(changePercent) < 5) {
            console.log(`📊 Price change for ${foodId}: ${changePercent.toFixed(1)}% (below threshold, skipping propagation)`);
            return;
        }

        console.log(`🔔 Significant price change for ${foodId}: ${changePercent.toFixed(1)}%`);

        // 4. Find all active diet plans containing this food
        const activePlans = await DietPlan.find({
            isActive: true,
            status: 'completed',
            'shoppingList.items.foodId': foodId
        });

        console.log(`   Found ${activePlans.length} active plans using ${foodId}`);

        // 5. Update each plan
        for (const plan of activePlans) {
            let currentTotal = 0;

            for (const item of plan.shoppingList.items) {
                if (item.foodId === foodId) {
                    item.currentPrice = parseFloat((newPricePerGram * item.quantity).toFixed(2));
                }
                currentTotal += item.currentPrice || item.priceAtGeneration || 0;
            }

            plan.shoppingList.currentTotal = parseFloat(currentTotal.toFixed(2));
            plan.shoppingList.lastPriceUpdate = new Date();
            plan.shoppingList.priceChanged = true;

            await plan.save();

            // 6. Check budget breach (>10% over)
            const budgetDaily = plan.budget?.amount
                ? (plan.budget.period === 'weekly' ? plan.budget.amount : plan.budget.amount * 7)
                : 7000;
            const weeklyTotal = plan.shoppingList.currentTotal;

            if (weeklyTotal > budgetDaily * 1.10) {
                console.log(`   ⚠️  Plan ${plan._id} exceeds budget by ${((weeklyTotal / budgetDaily - 1) * 100).toFixed(0)}%`);
                // TODO: Send push notification to member
            }
        }
    } catch (error) {
        console.error('❌ Price watcher error:', error.message);
    }
};

module.exports = { onPriceUpdate };
