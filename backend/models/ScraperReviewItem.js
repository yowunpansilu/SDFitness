const mongoose = require('mongoose');

const scraperReviewItemSchema = new mongoose.Schema({
    // Internal name is rawName/price, but we alias them for compatibility
    rawName: {
        type: String,
        required: true,
        alias: 'scrapedName'
    },
    price: {
        type: Number,
        alias: 'scrapedPrice'
    },
    url: String,
    store: {
        type: String,
        required: true
    },
    scrapedUnit: String,
    department: {
        type: String,
        alias: 'departmentName'
    },

    // Fuzzy match suggestion
    suggestedFoodId: {
        type: String,
        alias: 'suggestedMatch'
    },
    suggestedScore: {
        type: Number,
        alias: 'matchConfidence'
    },

    // Admin resolution
    status: {
        type: String,
        enum: ['pending', 'matched', 'ignored', 'linked', 'dismissed'],
        default: 'pending'
    },
    linkedFoodId: String,
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: Date
}, {
    timestamps: true,
    collection: 'products' // Explicitly target the scraper's output collection
});

const { getFoodDbConnection } = require('../config/db');

// Export a function to get the model on the correct connection
const getScraperReviewItemModel = () => {
    const foodConn = getFoodDbConnection();
    const targetConn = foodConn || mongoose.connection;
    
    if (targetConn.models.ScraperReviewItem) {
        return targetConn.models.ScraperReviewItem;
    }
    
    return targetConn.model('ScraperReviewItem', scraperReviewItemSchema);
};

module.exports = getScraperReviewItemModel;
