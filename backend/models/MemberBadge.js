const mongoose = require('mongoose');

const memberBadgeSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    badgeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge',
        required: true
    },
    earnedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure a member only gets a specific badge once
memberBadgeSchema.index({ memberId: 1, badgeId: 1 }, { unique: true });

module.exports = mongoose.model('MemberBadge', memberBadgeSchema);
