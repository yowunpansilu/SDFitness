const mongoose = require('mongoose');
const Workout = require('./models/Workout');

mongoose.connect('mongodb://127.0.0.1:27017/sdfitness').then(async () => {
    console.log('Connected to MongoDB');
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    const today = new Date();

    const workoutNames = ['Full Body Strength', 'Cardio Blast', 'Upper Body Push', 'Leg Day', 'HIIT Circuit', 'Core & Abs', 'Lower Body Pull', 'Yoga & Stretch'];
    const difficulties = ['beginner', 'intermediate', 'advanced'];

    await Workout.deleteMany({});
    console.log('Cleared old workouts');

    for (const user of users) {
        // ~18 workouts spread over 30 days (every 1-2 days with some rest days)
        const workoutDays = [1, 2, 4, 6, 7, 9, 11, 12, 14, 16, 17, 19, 21, 22, 24, 25, 27, 29];
        for (const dayAgo of workoutDays) {
            const wDate = new Date(today.getTime() - dayAgo * 24 * 60 * 60 * 1000);
            const name = workoutNames[Math.floor(Math.random() * workoutNames.length)];
            await Workout.create({
                memberId: user._id,
                workoutDate: wDate,
                duration: [30, 45, 50, 60, 75][Math.floor(Math.random() * 5)],
                totalCaloriesBurned: [200, 280, 320, 400, 450, 500][Math.floor(Math.random() * 6)],
                notes: name,
                difficulty: difficulties[Math.floor(Math.random() * 3)],
                energyLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                exercises: [{ exerciseId: 'ex1', name: 'Push Up', sets: [{ setNumber: 1, reps: 12, completed: true }] }],
                status: 'completed'
            });
        }
    }
    console.log(`Seeded ${users.length * 18} workouts for ${users.length} users!`);
    process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
