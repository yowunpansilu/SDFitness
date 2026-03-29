const mongoose = require('mongoose');

const foodPriceSchema = new mongoose.Schema({
    foodId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['protein', 'carbs', 'fats', 'vegetable', 'fruit', 'dairy', 'other'],
        required: true
    },
    department: {
        type: String,
        trim: true
    },

    // Nutritional data per 100g (from USDA / manual entry)
    nutritionPer100g: {
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fat: { type: Number, default: 0 },
        fiber: { type: Number, default: 0 }
    },

    // Price data from multiple stores
    prices: [{
        store: {
            type: String,
            required: true,
            trim: true
        },
        pricePerUnit: {
            type: Number,
            required: true,
            min: 0
        },
        unit: {
            type: String,
            default: 'kg'
        },
        pricePerGram: {
            type: Number,
            required: true,
            min: 0
        },
        isAvailable: {
            type: Boolean,
            default: true
        },
        source: {
            type: String,
            enum: ['scraper_catalog', 'api', 'manual'],
            required: true
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    }],

    // Aggregates for ML model (auto-calculated on save)
    averagePricePerGram: {
        type: Number,
        default: 0
    },
    lowestPricePerGram: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'LKR'
    },

    // Aliases for fuzzy matching (scraped product names → this foodId)
    aliases: [{
        type: String,
        trim: true,
        lowercase: true
    }],

    isVerified: {
        type: Boolean,
        default: false
    },

    scrapeData: {
        lastScraped: { type: Date },
        sourceUrl: { type: String, default: '' },
        rawScrapedName: { type: String, default: '' },
        // Keep raw store breakdown for debugging/admin visibility
        storeBreakdown: { type: [mongoose.Schema.Types.Mixed], default: [] }
    }
}, {
    timestamps: true,
    collection: 'foodprices'
});

// Auto-calculate averagePricePerGram and lowestPricePerGram before save
foodPriceSchema.pre('save', function () {
    if (this.prices && this.prices.length > 0) {
        const availablePrices = this.prices.filter(p => p.isAvailable);
        if (availablePrices.length > 0) {
            const sum = availablePrices.reduce((acc, p) => acc + p.pricePerGram, 0);
            this.averagePricePerGram = parseFloat((sum / availablePrices.length).toFixed(4));
            this.lowestPricePerGram = Math.min(...availablePrices.map(p => p.pricePerGram));
        }
    }
});

// Indexes
foodPriceSchema.index({ foodId: 1 }, { unique: true });
foodPriceSchema.index({ category: 1 });
foodPriceSchema.index({ 'prices.store': 1 });
foodPriceSchema.index({ isVerified: 1 });

const { getFoodDbConnection } = require('../config/db');

// Export a function to get the model on the correct connection
const getFoodPriceModel = () => {
    const foodConn = getFoodDbConnection();
    const targetConn = foodConn || mongoose.connection;
    
    // Check if model is already registered on this connection
    if (targetConn.models.FoodPrice) {
        return targetConn.models.FoodPrice;
    }
    
    return targetConn.model('FoodPrice', foodPriceSchema);
};

module.exports = getFoodPriceModel;
