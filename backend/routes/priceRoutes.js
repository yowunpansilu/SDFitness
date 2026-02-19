const express = require('express');
const router = express.Router();
const FoodPrice = require('../models/FoodPrice');

// GET /api/prices — list all food prices
router.get('/', async (req, res) => {
    try {
        const { category, verified } = req.query;
        const filter = {};
        if (category) filter.category = category;
        if (verified !== undefined) filter.isVerified = verified === 'true';

        const prices = await FoodPrice.find(filter).sort({ category: 1, name: 1 });
        res.json({ success: true, count: prices.length, data: prices });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/prices/batch?ids=chicken_breast,eggs,brown_rice
router.get('/batch', async (req, res) => {
    try {
        const ids = req.query.ids ? req.query.ids.split(',') : [];
        if (ids.length === 0) {
            return res.status(400).json({ success: false, error: 'Provide comma-separated food IDs' });
        }

        const prices = await FoodPrice.find({ foodId: { $in: ids } });

        // Return as a dictionary: { foodId: pricePerGram }
        const priceDict = {};
        prices.forEach(p => {
            priceDict[p.foodId] = {
                pricePerGram: p.lowestPricePerGram || p.averagePricePerGram,
                name: p.name,
                category: p.category,
                currency: p.currency
            };
        });

        res.json({ success: true, data: priceDict });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/prices/:foodId
router.get('/:foodId', async (req, res) => {
    try {
        const food = await FoodPrice.findOne({ foodId: req.params.foodId });
        if (!food) {
            return res.status(404).json({ success: false, error: 'Food not found' });
        }
        res.json({ success: true, data: food });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/prices — admin: manually add a food price
router.post('/', async (req, res) => {
    try {
        const food = new FoodPrice(req.body);
        await food.save();
        res.status(201).json({ success: true, data: food });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, error: 'Food with this ID already exists' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/prices/:foodId — admin: update price
router.put('/:foodId', async (req, res) => {
    try {
        const food = await FoodPrice.findOne({ foodId: req.params.foodId });
        if (!food) {
            return res.status(404).json({ success: false, error: 'Food not found' });
        }

        Object.assign(food, req.body);
        await food.save(); // triggers pre-save recalculation
        res.json({ success: true, data: food });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
