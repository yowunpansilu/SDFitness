const Badge = require('../models/Badge');
const MemberBadge = require('../models/MemberBadge');

// @desc    Get all available badges
// @route   GET /api/badges
exports.getAvailableBadges = async (req, res, next) => {
    try {
        const badges = await Badge.find();
        res.json({
            success: true,
            data: badges
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get earned badges for a member
// @route   GET /api/badges/member/:memberId
exports.getMemberBadges = async (req, res, next) => {
    try {
        const { memberId } = req.params;
        const earned = await MemberBadge.find({ memberId }).populate('badgeId');
        
        res.json({
            success: true,
            data: earned.map(e => ({
                ...e.badgeId._doc,
                earnedAt: e.earnedAt
            }))
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Seed initial badges
// @route   POST /api/badges/seed
exports.seedBadges = async (req, res, next) => {
    try {
        const badges = [
            {
                name: 'First Blood',
                description: 'Complete your first workout session.',
                icon: 'Dumbbell',
                category: 'activity',
                criteria: { type: 'workout_count', value: 1 }
            },
            {
                name: 'Consistency King',
                description: 'Maintain a 7-day workout streak.',
                icon: 'Flame',
                category: 'consistency',
                criteria: { type: 'streak', value: 7 }
            },
            {
                name: 'Fitness Enthusiast',
                description: 'Complete 10 workout sessions.',
                icon: 'Award',
                category: 'activity',
                criteria: { type: 'workout_count', value: 10 },
            },
            {
                name: 'Nutrition Scout',
                description: 'Log your first meal.',
                icon: 'Apple',
                category: 'nutrition',
                criteria: { type: 'diet_count', value: 1 }
            },
            {
                name: 'Healthy Habit',
                description: 'Log meals for 7 days.',
                icon: 'CheckCircle',
                category: 'nutrition',
                criteria: { type: 'diet_count', value: 7 }
            }
        ];

        for (const badge of badges) {
            await Badge.findOneAndUpdate(
                { name: badge.name },
                badge,
                { upsert: true, new: true }
            );
        }

        res.json({
            success: true,
            message: 'Badges seeded successfully'
        });
    } catch (error) {
        next(error);
    }
};
