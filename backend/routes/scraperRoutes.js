const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// ─── ScraperReviewItem model (inline — simple enough to not need its own file)
const scraperReviewSchema = new mongoose.Schema({
    rawName: { type: String, required: true },
    store: { type: String, required: true },
    price: { type: Number },
    url: { type: String, default: '' },
    scrapedAt: { type: Date, default: Date.now },
    suggestedMatch: { type: String, default: null },   // food_id suggested by fuzzy matcher
    matchConfidence: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'matched', 'ignored'], default: 'pending' },
    linkedFoodId: { type: String, default: null },   // set by admin on approval
    notes: { type: String, default: '' },
}, { timestamps: true });

const ScraperReviewItem = mongoose.models.ScraperReviewItem
    || mongoose.model('ScraperReviewItem', scraperReviewSchema);

// ─── FoodAlias model — persists aliases added by admin
const foodAliasSchema = new mongoose.Schema({
    foodId: { type: String, required: true },
    alias: { type: String, required: true, lowercase: true },
    category: { type: String, required: true },
    addedBy: { type: String, default: 'admin' },
}, { timestamps: true });

foodAliasSchema.index({ alias: 1 }, { unique: true });

const FoodAlias = mongoose.models.FoodAlias
    || mongoose.model('FoodAlias', foodAliasSchema);


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
//     Admin links an unmatched item to a food_id → persists alias to DB
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

        // Save the alias to DB so future scrapes auto-match
        const aliasText = item.rawName.toLowerCase();
        await FoodAlias.findOneAndUpdate(
            { alias: aliasText },
            { foodId, alias: aliasText, category, addedBy: 'admin' },
            { upsert: true, new: true }
        );

        // Mark reviewed item as matched
        item.status = 'matched';
        item.linkedFoodId = foodId;
        await item.save();

        res.json({ success: true, message: `Linked "${item.rawName}" → ${foodId}`, aliasAdded: aliasText });
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
