const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Member = require('../models/Member');
const AttendanceRecord = require('../models/AttendanceRecord');
const Payment = require('../models/Payment');
const Equipment = require('../models/Equipment');
const Class = require('../models/Class');

// @desc    Get administrative statistics for dashboard
// @route   GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
    try {
        // 1. Core Summary Stats
        const totalMembers = await User.countDocuments({ role: 'member' });
        const activeMemberships = await Member.countDocuments({ status: 'active' });
        
        // Monthly Revenue Calculation
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const currentMonthRevenue = await Payment.aggregate([
            { $match: { paymentDate: { $gte: startOfMonth }, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const lastMonthStart = new Date(startOfMonth);
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
        const lastMonthEnd = new Date(startOfMonth);
        lastMonthEnd.setMilliseconds(-1);

        const lastMonthRevenue = await Payment.aggregate([
            { $match: { paymentDate: { $gte: lastMonthStart, $lte: lastMonthEnd }, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const revenueValue = currentMonthRevenue[0]?.total || 0;
        const lastRevenueValue = lastMonthRevenue[0]?.total || 0;
        const revenueChange = lastRevenueValue === 0 ? 100 : Math.round(((revenueValue - lastRevenueValue) / lastRevenueValue) * 100);

        // Attendance Today
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const todayAttendance = await AttendanceRecord.countDocuments({ checkInTime: { $gte: startOfToday } });

        // Yesterday's Attendance (for trend calculation)
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        const yesterdayAttendance = await AttendanceRecord.countDocuments({ 
            checkInTime: { $gte: startOfYesterday, $lt: startOfToday } 
        });
        const attendanceChange = yesterdayAttendance === 0 ? 0 : Math.round(((todayAttendance - yesterdayAttendance) / yesterdayAttendance) * 100);

        // Member Growth (last 30 days vs previous 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const newMembersThisMonth = await User.countDocuments({ role: 'member', createdAt: { $gte: thirtyDaysAgo } });
        const newMembersLastMonth = await User.countDocuments({ role: 'member', createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } });
        const memberChange = newMembersLastMonth === 0 ? 100 : Math.round(((newMembersThisMonth - newMembersLastMonth) / newMembersLastMonth) * 100);

        // 2. Revenue Chart Data (Last 6 Months)
        const revenueChartData = [];
        for (let i = 5; i >= 0; i--) {
            const mStart = new Date(startOfMonth);
            mStart.setMonth(mStart.getMonth() - i);
            const mEnd = new Date(mStart);
            mEnd.setMonth(mEnd.getMonth() + 1);
            mEnd.setMilliseconds(-1);

            const result = await Payment.aggregate([
                { $match: { paymentDate: { $gte: mStart, $lte: mEnd }, status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            revenueChartData.push({
                month: mStart.toLocaleString('default', { month: 'short' }),
                revenue: result[0]?.total || 0
            });
        }

        // 3. Equipment Status
        const maintenanceAlerts = await Equipment.find({ 
            $or: [
                { status: 'maintenance' },
                { nextMaintenance: { $lte: new Date(new Date().getTime() + 30 * 86400000) } }
            ]
        }).limit(5);

        // 4. Recent Member Registrations
        const recentMembers = await Member.find()
            .populate({
                path: 'userId',
                select: 'firstName lastName avatar createdAt role'
            })
            .sort({ createdAt: -1 })
            .limit(5);

        // 5. Today's Classes
        const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const todaysClasses = await Class.find({ 'schedule.dayOfWeek': todayStr })
            .populate({
                path: 'trainer',
                populate: { path: 'user', select: 'firstName lastName' }
            })
            .limit(3);

        res.json({
            success: true,
            summary: {
                totalMembers: { value: totalMembers, change: memberChange, trend: memberChange >= 0 ? 'up' : 'down' },
                activeMemberships: { value: activeMemberships, change: 5, trend: 'up' }, // Simple mock for now
                monthlyRevenue: { value: revenueValue, change: revenueChange, trend: revenueChange >= 0 ? 'up' : 'down' },
                todayAttendance: { value: todayAttendance, change: attendanceChange, trend: attendanceChange >= 0 ? 'up' : 'down' }
            },
            revenueChart: revenueChartData,
            recentMembers: recentMembers.map(m => ({
                id: m._id,
                name: m.userId ? `${m.userId.firstName} ${m.userId.lastName}` : 'Unknown Member',
                initial: m.userId ? `${m.userId.firstName?.[0]}${m.userId.lastName?.[0]}` : '??',
                plan: (m.membershipType || 'Standard').toUpperCase(),
                time: m.createdAt,
                profilePhoto: m.userId?.avatar
            })),
            maintenanceAlerts: maintenanceAlerts.map(e => ({
                id: e._id,
                name: e.name,
                location: e.location || e.category,
                status: e.status,
                daysUntil: e.nextMaintenanceDate ? Math.ceil((new Date(e.nextMaintenanceDate).getTime() - new Date().getTime()) / 86400000) : 0
            })),
            todaysClasses: todaysClasses.map(c => ({
                name: c.name,
                time: c.schedule?.startTime || '00:00',
                trainer: c.trainer?.user ? `${c.trainer.user.firstName} ${c.trainer.user.lastName}` : 'System Node',
                spots: `${c.enrolled || 0}/${c.capacity || 20}`,
                percent: Math.min(100, Math.round(((c.enrolled || 0) / (c.capacity || 20)) * 100))
            }))
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
