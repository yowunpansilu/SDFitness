const Badge = require('../models/Badge');
const MemberBadge = require('../models/MemberBadge');
const WorkoutLog = require('../models/WorkoutLog');
const NutritionLog = require('../models/NutritionLog');

/**
 * Achievement Service to handle badge logic
 */
const checkAchievements = async (memberId) => {
    try {
        const badges = await Badge.find();
        const earnedBadges = await MemberBadge.find({ memberId }).select('badgeId');
        const earnedIds = earnedBadges.map(b => b.badgeId.toString());

        // 1. Get stats for checks
        const totalWorkouts = await WorkoutLog.countDocuments({ memberId });
        
        // Basic streak calculation (simplified for now)
        // In a real app, this would be more intensive
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const recentWorkouts = await WorkoutLog.find({ 
            memberId, 
            workoutDate: { $gte: last7Days } 
        }).distinct('workoutDate');
        
        const streak = recentWorkouts.length;

        // Diet count
        const dietLogs = await NutritionLog.distinct('date', { memberId });
        const dietCount = dietLogs.length;

        for (const badge of badges) {
            if (earnedIds.includes(badge._id.toString())) continue;

            let earned = false;
            if (badge.criteria.type === 'workout_count') {
                if (totalWorkouts >= badge.criteria.value) earned = true;
            } else if (badge.criteria.type === 'streak') {
                if (streak >= badge.criteria.value) earned = true;
            } else if (badge.criteria.type === 'diet_count') {
                if (dietCount >= badge.criteria.value) earned = true;
            }

            if (earned) {
                await MemberBadge.create({
                    memberId,
                    badgeId: badge._id
                });
                console.log(`🎊 Member ${memberId} earned badge: ${badge.name}`);
            }
        }
    } catch (error) {
        console.error('❌ Achievement Service Error:', error);
    }
};

module.exports = { checkAchievements };
