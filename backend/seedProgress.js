const mongoose = require('mongoose');
const dotenv = require('dotenv');
const WeightLog = require('./models/WeightLog');
const DailyProgress = require('./models/DailyProgress');
const User = require('./models/User');

dotenv.config({ path: './.env' });

async function seedProgressData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔗 Connected to MongoDB');

        // Verify users exist
        const users = await User.find({ role: 'member' }).limit(1);
        if (users.length === 0) {
            console.log('⚠️ No members found to seed progress for. Please run the general seed.js first.');
            process.exit(1);
        }

        const userId = users[0]._id;
        console.log(`👤 Using member ID: ${userId} for generating mock progress data`);

        // Clear existing data for test
        await WeightLog.deleteMany({ userId });
        await DailyProgress.deleteMany({ userId });

        // --- 1. Generate 30 days of weight trajectory ---
        // Assume user started at 88kg and has dropped to 80kg over 30 days.
        const weightLogs = [];
        let currentWeight = 88.0;
        const today = new Date();

        for (let i = 30; i >= 0; i--) {
            // Add some realistic noise +/- 0.3kg to make graph look real
            const noise = (Math.random() - 0.5) * 0.6;
            
            // Linear drop approx 0.25kg per day + noise
            currentWeight = currentWeight - 0.25 + noise;
            
            const logDate = new Date();
            logDate.setDate(today.getDate() - i);
            
            weightLogs.push({
                userId,
                weight: parseFloat(currentWeight.toFixed(1)),
                unit: 'kg',
                date: logDate
            });
        }
        await WeightLog.insertMany(weightLogs);
        console.log(`✅ Created ${weightLogs.length} historical weight logs`);

        // --- 2. Generate Daily Progress ---
        // We will just seed today to make it interactive initially blank
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        await DailyProgress.create({
            userId,
            date: startOfToday,
            workoutCompleted: false,
            dietLogged: false
        });
        console.log('✅ Initialized Daily Progress for today');

        process.exit(0);
    } catch (error) {
        console.error('❌ Progress Seeding failed:', error);
        process.exit(1);
    }
}

seedProgressData();
