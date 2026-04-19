const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Force localhost for host-side execution
const MONGO_URI = 'mongodb://localhost:27017/sdfitness';

const User = require('./models/User');
const Member = require('./models/Member');

async function diagnostic() {
    console.log('🔍 Starting Diagnostic...');
    try {
        console.log(`⏳ Connecting to ${MONGO_URI}...`);
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const testEmail = `test-${Date.now()}@example.com`;
        
        console.log(`⏳ Testing User creation for ${testEmail}...`);
        const user = await User.create({
            firstName: 'Diag',
            lastName: 'Test',
            email: testEmail,
            password: 'password123',
            phone: '0771234567'
        });
        console.log('✅ User created successfully with ID:', user._id);

        console.log('⏳ Testing Member creation...');
        const member = await Member.create({
            userId: user._id,
            memberNumber: 'MBR-DIAG-' + Date.now(),
            dateOfBirth: new Date('1995-05-05'),
            gender: 'male',
            height: { value: 175, unit: 'cm' },
            currentWeight: { value: 75, unit: 'kg' },
            fitnessGoals: ['general_fitness'],
            activityLevel: 'moderate'
        });
        console.log('✅ Member created successfully');

        // Cleanup
        console.log('⏳ Cleaning up test data...');
        await Member.deleteOne({ userId: user._id });
        await User.deleteOne({ _id: user._id });
        console.log('✅ Cleanup complete');

        console.log('\n✨ ALL DIAGNOSTICS PASSED! The backend logic and database connection are working correctly.');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ DIAGNOSTIC FAILED:');
        console.error(error);
        process.exit(1);
    }
}

diagnostic();
