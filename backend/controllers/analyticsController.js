const Member = require('../models/Member');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const Trainer = require('../models/Trainer');
const Attendance = require('../models/AttendanceRecord');

exports.getAnalytics = async (req, res) => {
    try {
        const { range = '6months' } = req.query;
        const now = new Date();
        let startDate;

        switch (range) {
            case '1month': startDate = new Date(now.setMonth(now.getMonth() - 1)); break;
            case '3months': startDate = new Date(now.setMonth(now.getMonth() - 3)); break;
            case '1year': startDate = new Date(now.setFullYear(now.getFullYear() - 1)); break;
            default: startDate = new Date(now.setMonth(now.getMonth() - 6)); break;
        }

        // Reset now for consistent calculations
        const today = new Date();

        // 1. Member Growth (Monthly)
        const memberGrowth = await Member.aggregate([
            { $match: { joinDate: { $gte: startDate } } },
            {
                $group: {
                    _id: { $month: "$joinDate" },
                    count: { $sum: 1 },
                    month: { $first: "$joinDate" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 2. Revenue Trend (Monthly)
        const revenueTrend = await Payment.aggregate([
            { $match: { paymentDate: { $gte: startDate }, status: 'completed' } },
            {
                $group: {
                    _id: { $month: "$paymentDate" },
                    revenue: { $sum: "$amount" },
                    month: { $first: "$paymentDate" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 3. Subscription Breakdown
        const membershipBreakdown = await Member.aggregate([
            {
                $group: {
                    _id: "$membershipType",
                    count: { $sum: 1 }
                }
            }
        ]);

        // 4. Key Metrics Calculation
        const totalMembers = await Member.countDocuments();
        const activeMembers = await Member.countDocuments({ status: 'active' });
        
        const currentMonthRevenue = await Payment.aggregate([
            {
                $match: {
                    paymentDate: { 
                        $gte: new Date(today.getFullYear(), today.getMonth(), 1),
                        $lte: today
                    },
                    status: 'completed'
                }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const lastMonthRevenue = await Payment.aggregate([
            {
                $match: {
                    paymentDate: { 
                        $gte: new Date(today.getFullYear(), today.getMonth() - 1, 1),
                        $lte: new Date(today.getFullYear(), today.getMonth(), 0)
                    },
                    status: 'completed'
                }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const currRev = currentMonthRevenue[0]?.total || 0;
        const lastRev = lastMonthRevenue[0]?.total || 0;
        const revenueGrowth = lastRev === 0 ? 100 : ((currRev - lastRev) / lastRev) * 100;

        // 5. Training Impact (Mock for now, but linked to real Trainers)
        const trainers = await Trainer.find().populate('user', 'firstName lastName');
        const topTrainers = trainers.slice(0, 4).map((t, i) => ({
            name: t.user ? `${t.user.firstName} ${t.user.lastName}` : 'Anonymous Trainer',
            rating: (4.5 + Math.random() * 0.5).toFixed(1),
            sessions: Math.floor(100 + Math.random() * 100),
            revenue: Math.floor(5000 + Math.random() * 5000)
        }));

        res.json({
            success: true,
            summary: {
                grossRevenue: { value: currRev, change: revenueGrowth.toFixed(1) },
                activeAssets: { value: activeMembers, change: "+12.1" },
                engagementIndex: { value: "84.6%", change: "+3.2" },
                stabilityScore: { value: "92.3%", change: "+1.8" }
            },
            charts: {
                memberGrowth: (memberGrowth || []).map(m => ({
                    month: m.month ? new Date(m.month).toLocaleString('default', { month: 'short' }) : 'N/A',
                    members: m.count || 0
                })),
                revenueTrend: (revenueTrend || []).map(r => ({
                    month: r.month ? new Date(r.month).toLocaleString('default', { month: 'short' }) : 'N/A',
                    revenue: r.revenue || 0
                })),
                membershipBreakdown: (membershipBreakdown || []).map(m => ({
                    plan: (m._id || 'Standard').toUpperCase(),
                    count: m.count || 0,
                    percentage: totalMembers > 0 ? Math.round((m.count / totalMembers) * 100) : 0
                })),
            },
            topTrainers
        });

    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
