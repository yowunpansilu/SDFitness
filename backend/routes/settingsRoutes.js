const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');

// @route   GET api/settings
// @desc    Get all settings
router.get('/', async (req, res) => {
    try {
        const settings = await Setting.find();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT api/settings
// @desc    Update or create settings
router.put('/', async (req, res) => {
    try {
        const { key, value, category, description } = req.body;
        const setting = await Setting.findOneAndUpdate(
            { key },
            { value, category, description },
            { upsert: true, new: true }
        );
        res.json(setting);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
