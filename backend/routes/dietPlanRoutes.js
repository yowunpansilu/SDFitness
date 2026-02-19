const express = require('express');
const router = express.Router();
const DietPlan = require('../models/DietPlan');

// GET /api/diet-plans — list diet plans for a member
router.get('/', async (req, res) => {
    try {
        const { memberId, active } = req.query;
        const filter = {};
        if (memberId) filter.memberId = memberId;
        if (active !== undefined) filter.isActive = active === 'true';

        const plans = await DietPlan.find(filter).sort({ generatedAt: -1 }).limit(20);
        res.json({ success: true, count: plans.length, data: plans });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/diet-plans/:id
router.get('/:id', async (req, res) => {
    try {
        const plan = await DietPlan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, error: 'Diet plan not found' });
        }
        res.json({ success: true, data: plan });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/diet-plans/:id/cost — recalculate with live prices
router.get('/:id/cost', async (req, res) => {
    try {
        const FoodPrice = require('../models/FoodPrice');
        const plan = await DietPlan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, error: 'Diet plan not found' });
        }

        // Recalculate each item's current price
        let currentTotal = 0;
        for (const item of plan.shoppingList.items) {
            const foodPrice = await FoodPrice.findOne({ foodId: item.foodId });
            if (foodPrice) {
                const pricePerGram = foodPrice.lowestPricePerGram || foodPrice.averagePricePerGram;
                item.currentPrice = parseFloat((pricePerGram * item.quantity).toFixed(2));
                currentTotal += item.currentPrice;
            }
        }

        plan.shoppingList.currentTotal = parseFloat(currentTotal.toFixed(2));
        plan.shoppingList.lastPriceUpdate = new Date();
        plan.shoppingList.priceChanged = plan.shoppingList.currentTotal !== plan.shoppingList.totalAtGeneration;
        await plan.save();

        res.json({
            success: true,
            data: {
                planId: plan._id,
                totalAtGeneration: plan.shoppingList.totalAtGeneration,
                currentTotal: plan.shoppingList.currentTotal,
                priceChanged: plan.shoppingList.priceChanged,
                items: plan.shoppingList.items
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/diet-plans/generate — placeholder (will be built in Phase 4)
router.post('/generate', async (req, res) => {
    res.status(501).json({
        success: false,
        error: 'Diet plan generation not yet implemented. Coming in Phase 4.'
    });
});

module.exports = router;
