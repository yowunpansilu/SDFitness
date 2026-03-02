const mongoose = require('mongoose');

const priceLogSchema = new mongoose.Schema({
    foodId: {
        type: String,
        required: true
    },
    store: {
        type: String,
        required: true
    },
    oldPrice: Number,
    newPrice: Number,
    changePercent: Number,
    source: {
        type: String,
        enum: ['scraper_catalog', 'api', 'manual']
    }
}, {
    timestamps: true
});

priceLogSchema.index({ foodId: 1 });
priceLogSchema.index({ createdAt: -1 });
priceLogSchema.index({ foodId: 1, createdAt: -1 });

module.exports = mongoose.model('PriceLog', priceLogSchema);
