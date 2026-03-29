const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
    foodId: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },
    date: {
        type: Date,
        default: Date.now,
        index: true
    },
    pricePerKg: {
        type: Number,
        required: true,
        min: 0
    },
    store: {
        type: String,
        trim: true
    },
    scrapedName: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    collection: 'pricehistories' // Explicitly target the Atlas collection
});

// Indexes for common queries
priceHistorySchema.index({ foodId: 1, date: -1 });

const { getFoodDbConnection } = require('../config/db');

// Export a function to get the model on the correct connection
const getPriceHistoryModel = () => {
    const foodConn = getFoodDbConnection();
    let targetConn = foodConn || mongoose.connection;
    
    // Scraper history items are located in the 'test' database
    if (targetConn.name !== 'test') {
        targetConn = targetConn.useDb('test', { useCache: true });
    }
    
    if (targetConn.models.PriceHistory) {
        return targetConn.models.PriceHistory;
    }
    
    return targetConn.model('PriceHistory', priceHistorySchema);
};

module.exports = getPriceHistoryModel;
