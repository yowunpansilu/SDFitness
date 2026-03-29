const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const ScraperReviewItem = require('../models/ScraperReviewItem')();
const FoodAlias = require('../models/FoodAlias');
const getFoodPriceModel = require('../models/FoodPrice');
const PriceHistory = require('../models/PriceHistory')();


// ─── GET /api/scraper/review-queue?status=pending
router.get('/review-queue', async (req, res) => {
    try {
        const { status = 'pending', limit = 50 } = req.query;
        const items = await ScraperReviewItem
            .find({ status })
            .sort({ scrapedAt: -1 })
            .limit(parseInt(limit));
        res.json({ success: true, count: items.length, data: items });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── POST /api/scraper/review-queue — batch insert from Python scraper
router.post('/review-queue', async (req, res) => {
    try {
        const { items } = req.body;
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ success: false, error: 'items array required' });
        }

        // Accept both scraper field names (scrapedName/scrapedPrice) and internal names (rawName/price)
        let inserted = 0;
        for (const item of items) {
            const rawName = item.rawName || item.scrapedName;
            const price = item.price || item.scrapedPrice;
            const store = item.store;

            if (!rawName || !store) continue;

            const exists = await ScraperReviewItem.findOne({
                rawName, store, status: 'pending',
            });
            if (!exists) {
                await ScraperReviewItem.create({
                    rawName,
                    store,
                    price,
                    url: item.url || '',
                    department: item.department || item.departmentName || '',
                    suggestedMatch: item.suggestedFoodId || null,
                    matchConfidence: item.suggestedScore || 0,
                    scrapedAt: item.scrapedAt || new Date(),
                });
                inserted++;
            }
        }

        res.json({ success: true, inserted, total: items.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


// ─── PATCH /api/scraper/review-queue/:id/approve
//     Admin links an unmatched item to a food_id → persists alias + updates FoodPrice
router.patch('/review-queue/:id/approve', async (req, res) => {
    try {
        const { foodId, category } = req.body;
        if (!foodId || !category) {
            return res.status(400).json({ success: false, error: 'foodId and category required' });
        }

        const item = await ScraperReviewItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, error: 'Item not found' });
        }

        // 1. Save the alias to DB so future scrapes auto-match
        const aliasText = item.rawName.toLowerCase();
        await FoodAlias.findOneAndUpdate(
            { alias: aliasText },
            { foodId, alias: aliasText, category, addedBy: 'admin' },
            { upsert: true, new: true }
        );

        // 2. Update FoodPrice with the scraped price data
        const FoodPrice = getFoodPriceModel();
        const foodDoc = await FoodPrice.findOne({ foodId });

        if (foodDoc && item.price) {
            // Save the department if it exists on the matched item
            if (item.department) {
                foodDoc.department = item.department;
            }
            // Parse weight from rawName (e.g. "1kg", "200g", "1L")
            let weightInGrams = 1000; // default 1kg
            const weightMatch = item.rawName.match(/(\d+(?:\.\d+)?)\s*(kg|g|l|ml)/i);
            if (weightMatch) {
                const value = parseFloat(weightMatch[1]);
                const unit = weightMatch[2].toLowerCase();
                if (unit === 'kg' || unit === 'l') weightInGrams = value * 1000;
                else weightInGrams = value; // g or ml
            }

            const pricePerGram = parseFloat((item.price / weightInGrams).toFixed(4));

            // Find existing store entry or add new one
            const storeIndex = foodDoc.prices.findIndex(
                (p) => p.store.toLowerCase() === item.store.toLowerCase()
            );

            if (storeIndex >= 0) {
                foodDoc.prices[storeIndex].pricePerUnit = item.price;
                foodDoc.prices[storeIndex].pricePerGram = pricePerGram;
                foodDoc.prices[storeIndex].lastUpdated = new Date();
                foodDoc.prices[storeIndex].source = 'scraper_catalog';
                foodDoc.prices[storeIndex].isAvailable = true;
            } else {
                foodDoc.prices.push({
                    store: item.store,
                    pricePerUnit: item.price,
                    unit: 'kg',
                    pricePerGram,
                    isAvailable: true,
                    source: 'scraper_catalog',
                    lastUpdated: new Date(),
                });
            }

            // Add alias if not already present
            if (!foodDoc.aliases.includes(aliasText)) {
                foodDoc.aliases.push(aliasText);
            }

            // Save triggers pre-save hook → recalculates averagePricePerGram
            await foodDoc.save();

            // 2.5 Record this match in history
            await PriceHistory.create({
                foodId,
                date: new Date(),
                pricePerKg: pricePerGram * 1000,
                store: item.store,
                scrapedName: item.rawName
            });
        }

        // 3. Mark reviewed item as matched
        item.status = 'matched';
        item.linkedFoodId = foodId;
        await item.save();

        res.json({
            success: true,
            message: `Linked "${item.rawName}" → ${foodId}`,
            aliasAdded: aliasText,
            priceUpdated: !!(foodDoc && item.price),
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── PATCH /api/scraper/review-queue/:id/dismiss
router.patch('/review-queue/:id/dismiss', async (req, res) => {
    try {
        const item = await ScraperReviewItem.findByIdAndUpdate(
            req.params.id,
            { status: 'ignored' },
            { returnDocument: 'after' }
        );
        if (!item) return res.status(404).json({ success: false, error: 'Item not found' });
        res.json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── GET /api/scraper/aliases — list all DB-persisted aliases
router.get('/aliases', async (req, res) => {
    try {
        const aliases = await FoodAlias.find().sort({ foodId: 1 });
        res.json({ success: true, count: aliases.length, data: aliases });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── DELETE /api/scraper/aliases/:id — admin: remove a bad alias
router.delete('/aliases/:id', async (req, res) => {
    try {
        await FoodAlias.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
