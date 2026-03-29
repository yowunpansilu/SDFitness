const express = require('express');
const router = express.Router();
const DietPlan = require('../models/DietPlan');

// GET /api/diet-plans — list diet plans for a member
router.get('/', async (req, res) => {
    try {
        const { memberId, active } = req.query;
        if (!memberId) {
            return res.status(400).json({ success: false, error: 'memberId is required' });
        }

        const filter = { memberId };
        if (active !== undefined) filter.isActive = active === 'true';

        const plans = await DietPlan.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, count: plans.length, data: plans });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/diet-plans — save a generated plan
router.post('/', async (req, res) => {
    try {
        const planData = req.body;
        if (!planData.memberId) {
            return res.status(400).json({ success: false, error: 'memberId is required' });
        }

        const dietPlan = new DietPlan(planData);
        await dietPlan.save();

        res.status(201).json({ success: true, data: dietPlan });
    } catch (error) {
        console.error('❌ Diet plan save error:', error.message);
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

// POST /api/diet-plans/generate — ML-first generation pipeline
router.post('/generate', async (req, res) => {
    const { memberId } = req.body;
    if (!memberId) {
        return res.status(400).json({ success: false, error: 'memberId is required' });
    }

    try {
        const { generateDietPlan } = require('../services/aiService');
        const plan = await generateDietPlan(memberId, false); // false = do not save to DB

        res.status(200).json({
            success: true,
            data: plan,
            metadata: {
                generationMethod: plan.aiMetadata?.generationMethod,
                confidence: plan.aiMetadata?.mlConfidenceScore,
                inferenceTimeMs: plan.aiMetadata?.mlInferenceTimeMs
            }
        });
    } catch (error) {
        console.error('❌ Diet plan generation error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/diet-plans/:id
router.delete('/:id', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid Diet Plan ID format' });
        }

        const plan = await DietPlan.findByIdAndDelete(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, error: 'Diet plan not found' });
        }
        res.json({ success: true, message: 'Diet plan deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PATCH /api/diet-plans/:id — update plan metadata
router.patch('/:id', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid Diet Plan ID format' });
        }

        const { planName, isActive } = req.body;
        const updateData = {};
        
        if (planName !== undefined) updateData.planName = planName;
        if (isActive !== undefined) updateData.isActive = isActive;

        // If setting this plan as active, deactivate others for this member
        if (isActive === true) {
            const plan = await DietPlan.findById(req.params.id);
            if (plan) {
                await DietPlan.updateMany(
                    { memberId: plan.memberId, _id: { $ne: plan._id } },
                    { $set: { isActive: false } }
                );
            }
        }

        const plan = await DietPlan.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        if (!plan) {
            return res.status(404).json({ success: false, error: 'Diet plan not found' });
        }
        res.json({ success: true, data: plan });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
