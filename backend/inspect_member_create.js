const mongoose = require('mongoose');
const User = require('./models/User');
const Member = require('./models/Member');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sdfitness');
    
    // Simulate what the register route does
    try {
        const user = await User.findOne({ email: 'testuser@gmail.com' });
        console.log('User found:', !!user);

        if (user) {
            console.log('User ID:', user._id);
            const member = await Member.create({
                userId: user._id,
                memberNumber: 'MBR-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                dateOfBirth: new Date('2000-01-01'),
                gender: 'male',
                height: { value: 180, unit: 'cm' },
                currentWeight: { value: 80, unit: 'kg' },
                fitnessGoals: ['muscle_gain'],
                activityLevel: 'active',
                dietaryPreferences: ['vegan']
            });
            console.log('Member created successfully!');
        } else {
             console.log('testuser not found, test registration failed early.');
        }
    } catch (e) {
        console.error('ERROR creating member:', e.message);
    }
    process.exit(0);
}
check();
