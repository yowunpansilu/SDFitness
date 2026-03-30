const mongoose = require('mongoose');
const { getFoodDbConnection } = require('../config/db');

const externalProductSchema = new mongoose.Schema({
    sku: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    itemID: {
        type: String,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    currentPrice: {
        type: Number,
        required: true,
        default: 0
    },
    imageUrl: {
        type: String,
        trim: true
    },
    uom: {
        type: String,
        trim: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    departmentId: {
        type: String,
        trim: true
    },
    departmentName: {
        type: String,
        trim: true,
        index: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false, // The external schema uses manually set `lastUpdated` or `date` fields
    collection: 'products' // Explicitly map to Atlas' products schema
});

// Since the scraper relies on external IDs being available, 
// if updating a product, update `lastUpdated` manually.
externalProductSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.lastUpdated = new Date();
    }
    next();
});

// Export a factory function to get the model on the correct Atlas connection
const getExternalProductModel = () => {
    const foodConn = getFoodDbConnection();
    let targetConn = foodConn || mongoose.connection;
    
    // The products collection is actually located inside the 'test' database
    // due to scraper defaults, so we must switch db context if we are connected to keelsPriceDB
    if (targetConn.name !== 'test') {
        targetConn = targetConn.useDb('test', { useCache: true });
    }
    
    if (targetConn.models.ExternalProduct) {
        return targetConn.models.ExternalProduct;
    }
    
    return targetConn.model('ExternalProduct', externalProductSchema);
};

module.exports = getExternalProductModel;
