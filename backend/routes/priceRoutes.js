const express = require('express');
const router = express.Router();
const FoodPrice = require('../models/FoodPrice');
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

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

// POST /api/prices/trigger-scrape — proxy to Python scraper via ML service
router.post('/trigger-scrape', async (req, res) => {
    try {
        const { stores, dry_run } = req.body;
        const response = await axios.post(
            `${ML_SERVICE_URL}/scrape`,
            { stores, dry_run },
            { timeout: 5000 }
        );
        res.json(response.data);
    } catch (error) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            return res.status(503).json({
                success: false,
                error: 'ML service unavailable — start with: cd ml-service && python app.py'
            });
        }
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/prices/scrape-status — proxy scrape job status from ML service
router.get('/scrape-status', async (req, res) => {
    try {
        const response = await axios.get(`${ML_SERVICE_URL}/scrape/status`, { timeout: 5000 });
        res.json(response.data);
    } catch (error) {
        res.status(503).json({ success: false, error: 'ML service unavailable' });
    }
});

// POST /api/prices/bulk-update — called by Python scraper after scraping
router.post('/bulk-update', async (req, res) => {
    try {
        const { updates } = req.body;
        if (!updates || !Array.isArray(updates)) {
            return res.status(400).json({ success: false, error: 'updates array required' });
        }

        const results = [];
        for (const update of updates) {
            const { foodId, averagePrice, lowestPrice, storeBreakdown } = update;
            if (!foodId) continue;

            const existing = await FoodPrice.findOne({ foodId });
            if (existing) {
                // Push price to history (keep last 90 entries)
                if (!existing.priceHistory) existing.priceHistory = [];
                existing.priceHistory.push({ date: new Date(), pricePerKg: averagePrice });
                if (existing.priceHistory.length > 90) existing.priceHistory.shift();

                // Update current prices (convert per-kg → per-gram)
                if (averagePrice) existing.averagePricePerGram = averagePrice / 1000;
                if (lowestPrice) existing.lowestPricePerGram = lowestPrice / 1000;

                existing.scrapeData = {
                    lastScraped: new Date(),
                    sourceUrl: storeBreakdown?.[0]?.url || '',
                    rawScrapedName: storeBreakdown?.[0]?.rawName || '',
                    storeBreakdown: storeBreakdown || [],
                };
                existing.lastUpdated = new Date();
                await existing.save();
                results.push({ foodId, status: 'updated' });
            } else {
                results.push({ foodId, status: 'skipped_not_found' });
            }
        }

        res.json({ success: true, results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/prices/:foodId/history — 30-day price trend
router.get('/:foodId/history', async (req, res) => {
    try {
        const food = await FoodPrice.findOne({ foodId: req.params.foodId });
        if (!food) {
            return res.status(404).json({ success: false, error: 'Food not found' });
        }

        const days = parseInt(req.query.days) || 30;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        const history = (food.priceHistory || [])
            .filter(h => new Date(h.date) >= cutoff)
            .map(h => ({
                date: h.date,
                pricePerKg: h.pricePerKg,
                currency: food.currency || 'LKR',
            }));

        // Detect trend (>5% change = rising/falling)
        let trend = 'stable';
        if (history.length >= 2) {
            const oldest = history[0].pricePerKg;
            const newest = history[history.length - 1].pricePerKg;
            const changePct = ((newest - oldest) / oldest) * 100;
            if (changePct > 5) trend = 'rising';
            else if (changePct < -5) trend = 'falling';
        }

        res.json({
            success: true,
            data: {
                foodId: food.foodId,
                name: food.name,
                currentPricePerKg: food.averagePricePerGram * 1000,
                lowestPricePerKg: food.lowestPricePerGram * 1000,
                trend,
                history,
                days,
            }
        });
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
        await food.save();
        res.json({ success: true, data: food });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
