const Workout = require('../models/Workout');
const WorkoutTemplate = require('../models/WorkoutTemplate');

exports.getWorkoutTemplates = async (req, res) => {
    try {
        const { difficulty, category } = req.query;
        let query = {};
        
        if (difficulty && difficulty !== 'all') {
            query.difficulty = difficulty;
        }
        if (category && category !== 'all') {
            query.category = category;
        }

        const templates = await WorkoutTemplate.find(query);
        console.log("Workout Templates Query:", query, "Found:", templates.length);
        res.json({ success: true, data: templates });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.logWorkout = async (req, res) => {
    try {
        const { memberId, templateId, workoutDate, exercises, notes, difficulty, energyLevel } = req.body;

        let totalDuration = 0;
        let totalCalories = 0;

        if (templateId) {
            const template = await WorkoutTemplate.findOne({ templateId });
            if (template) {
                totalCalories = template.estimatedCaloriesBurned;
                totalDuration = template.duration;
            }
        }

        const newWorkout = await Workout.create({
            memberId,
            templateId,
            workoutDate,
            exercises,
            notes,
            difficulty,
            energyLevel,
            duration: totalDuration || 45,
            totalCaloriesBurned: totalCalories || 300,
            status: 'completed'
        });

        res.status(201).json({ success: true, data: newWorkout });
    } catch (error) {
        console.error('Save workout error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getWorkoutHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 20 } = req.query;

        const history = await Workout.find({ memberId: id })
            .sort({ workoutDate: -1 })
            .limit(Number(limit));

        const stats = {
            totalWorkouts: history.length,
            totalCaloriesBurned: history.reduce((acc, w) => acc + (w.totalCaloriesBurned || 0), 0),
            averageDuration: history.length > 0 ? Math.round(history.reduce((acc, w) => acc + (w.duration || 0), 0) / history.length) : 0
        };

        res.json({ success: true, data: history, stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getWorkoutStats = async (req, res) => {
    try {
        const { id } = req.params;
        const history = await Workout.find({ memberId: id });

        if (!history || history.length === 0) {
            return res.json({ 
                success: true, 
                data: { totalWorkouts: 0, totalCaloriesBurned: 0, averageDuration: 0, thisWeek: 0, thisMonth: 0 }
            });
        }

        const stats = {
            totalWorkouts: history.length,
            totalCaloriesBurned: history.reduce((acc, w) => acc + (w.totalCaloriesBurned || 0), 0),
            averageDuration: Math.round(history.reduce((acc, w) => acc + (w.duration || 0), 0) / history.length),
            thisWeek: history.filter(w => new Date(w.workoutDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
            thisMonth: history.filter(w => new Date(w.workoutDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
        };

        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get 30-day workout history aggregated per day (for chart + recent list)
exports.getWorkoutHistory30Days = async (req, res) => {
    try {
        const { id } = req.params;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);

        const workouts = await Workout.find({
            memberId: id,
            workoutDate: { $gte: startDate },
            status: 'completed'
        }).sort({ workoutDate: 1 });

        // Build a per-day aggregated map for the chart
        const dayMap = {};
        for (let i = 30; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            dayMap[key] = { date: key, calories: 0, duration: 0, count: 0 };
        }

        for (const w of workouts) {
            const key = new Date(w.workoutDate).toISOString().split('T')[0];
            if (dayMap[key]) {
                dayMap[key].calories += w.totalCaloriesBurned || 0;
                dayMap[key].duration += w.duration || 0;
                dayMap[key].count += 1;
            }
        }

        res.json({ success: true, data: Object.values(dayMap), workouts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
