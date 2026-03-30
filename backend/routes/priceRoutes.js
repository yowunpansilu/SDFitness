const express = require('express');
const router = express.Router();
const getExternalProductModel = require('../models/ExternalProduct');
const PriceHistory = require('../models/PriceHistory')();
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

// GET /api/prices — list all products (used by the new front-end)
router.get('/', async (req, res) => {
    try {
        const ExternalProduct = getExternalProductModel();
        const { departmentName, search } = req.query;
        
        const filter = {};
        if (departmentName && departmentName !== 'all') {
            filter.departmentName = departmentName;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await ExternalProduct.find(filter).sort({ departmentName: 1, name: 1 });
        res.json({ success: true, count: products.length, data: products });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/prices/:sku/history — Price history mapping
router.get('/:sku/history', async (req, res) => {
    try {
        const ExternalProduct = getExternalProductModel();
        const product = await ExternalProduct.findOne({ sku: req.params.sku });
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        const history = await PriceHistory.find({
            sku: req.params.sku
        }).sort({ date: 1 });

        res.json({
            success: true,
            data: {
                sku: product.sku,
                name: product.name,
                currentPrice: product.currentPrice,
                history,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/prices/:id
router.get('/:id', async (req, res) => {
    try {
        const ExternalProduct = getExternalProductModel();
        const product = await ExternalProduct.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/prices — manually add a new product mapping
router.post('/', async (req, res) => {
    try {
        const ExternalProduct = getExternalProductModel();
        const product = new ExternalProduct(req.body);
        await product.save();
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, error: 'Product with this SKU already exists' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/prices/:id — manually update a product
router.put('/:id', async (req, res) => {
    try {
        const ExternalProduct = getExternalProductModel();
        const product = await ExternalProduct.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        Object.assign(product, req.body);
        product.lastUpdated = new Date();
        await product.save();
        
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/prices/:id — admin: remove product
router.delete('/:id', async (req, res) => {
    try {
        const ExternalProduct = getExternalProductModel();
        const result = await ExternalProduct.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Keep endpoints for scraper operations if they still rely on ML service ping
router.post('/trigger-scrape', async (req, res) => {
    // ... logic preserved
    try {
        const { stores, dry_run } = req.body;
        const response = await axios.post(`${ML_SERVICE_URL}/scrape`, { stores, dry_run }, { timeout: 5000 });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/scrape-status', async (req, res) => {
    // ... logic preserved
    try {
        const response = await axios.get(`${ML_SERVICE_URL}/scrape/status`, { timeout: 5000 });
        res.json(response.data);
    } catch (error) {
        res.status(503).json({ success: false, error: 'ML service unavailable' });
    }
});

module.exports = router;
