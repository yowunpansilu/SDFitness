const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true // Lucide icon name or emoji for now
    },
    criteria: {
        type: {
            type: String, // 'workout_count', 'streak', 'diet_count'
            required: true
        },
        value: {
            type: Number,
            required: true
        }
    },
    category: {
        type: String,
        enum: ['activity', 'consistency', 'nutrition', 'milestone'],
        default: 'milestone'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Badge', badgeSchema);
