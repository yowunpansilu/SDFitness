const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('./models/User');
const Member = require('./models/Member');

const testRegistration = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected');

        const step1Data = {
            firstName: 'Test',
            lastName: 'User',
            email: 'diag-' + Date.now() + '@example.com',
            password: 'Password123!',
            phone: '1234567890'
        };

        const step2Data = {
            dateOfBirth: new Date('1990-01-01'),
            gender: 'Male',
            height: '180',
            weight: '80',
            heightUnit: 'cm',
            weightUnit: 'kg'
        };

        const step3Data = {
            fitnessGoals: ['Weight Loss'],
            activityLevel: 'moderate',
            dietaryPreferences: ['Vegetarian']
        };

        console.log('1. Creating user...');
        const user = await User.create({
            firstName: step1Data.firstName,
            lastName: step1Data.lastName,
            email: step1Data.email,
            password: step1Data.password,
            phone: step1Data.phone
        });
        console.log('User created:', user._id);

        console.log('2. Creating member...');
        const member = await Member.create({
            userId: user._id,
            memberNumber: 'MBR-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            dateOfBirth: step2Data.dateOfBirth,
            gender: step2Data.gender.toLowerCase(),
            height: {
                value: parseFloat(step2Data.height),
                unit: 'cm'
            },
            currentWeight: {
                value: parseFloat(step2Data.weight),
                unit: step2Data.weightUnit
            },
            fitnessGoals: step3Data.fitnessGoals.map(g => g.toLowerCase().replace(' ', '_')),
            activityLevel: 'moderately_active',
            dietaryPreferences: step3Data.dietaryPreferences.map(p => p.toLowerCase().replace('-', '_'))
        });
        console.log('✅ Member created successfully');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ REGISTRATION FAILED:', err);
        process.exit(1);
    }
}

testRegistration();
