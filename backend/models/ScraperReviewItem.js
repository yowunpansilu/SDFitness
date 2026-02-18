const mongoose = require('mongoose');

const scraperReviewItemSchema = new mongoose.Schema({
    scrapedName: {
        type: String,
        required: true,
        trim: true
    },
    url: String,
    store: {
        type: String,
        required: true
    },
    scrapedPrice: Number,
    scrapedUnit: String,

    // Fuzzy match suggestion (if any)
    suggestedFoodId: String,
    suggestedScore: Number,

    // Admin resolution
    status: {
        type: String,
        enum: ['pending', 'linked', 'dismissed'],
        default: 'pending'
    },
    linkedFoodId: String,   // what the admin linked it to
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: Date
}, {
    timestamps: true
});

scraperReviewItemSchema.index({ status: 1 });
scraperReviewItemSchema.index({ store: 1 });
scraperReviewItemSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ScraperReviewItem', scraperReviewItemSchema);
