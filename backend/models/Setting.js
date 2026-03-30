const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    description: String,
    category: {
        type: String,
        enum: ['general', 'notifications', 'email', 'security', 'billing'],
        default: 'general'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Setting', settingSchema);
