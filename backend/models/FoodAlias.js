const mongoose = require('mongoose');

const foodAliasSchema = new mongoose.Schema({
    foodId: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    alias: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    category: {
        type: String,
        required: true
    },
    addedBy: {
        type: String,
        default: 'admin'
    }
}, {
    timestamps: true,
    collection: 'foodaliases' // Stored locally or shared on Atlas
});

// Since the user says .env is correct and MONGO_URI points to Atlas, 
// this model will automatically use the Atlas connection for global aliases.
module.exports = mongoose.model('FoodAlias', foodAliasSchema);
