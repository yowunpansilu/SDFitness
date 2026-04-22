const mongoose = require('mongoose');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Member = require('../models/Member');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sdfitness';

async function seed() {
    try {
        console.log('Connecting to DB at:', MONGO_URI);
        await mongoose.connect(MONGO_URI);

        // Create/Update Test Admin
        const adminEmail = 'admin@gmail.com';
        let admin = await Admin.findOne({ email: adminEmail });
        if (!admin) {
            admin = await Admin.create({
                firstName: 'Test',
                lastName: 'Admin',
                email: adminEmail,
                password: 'admin123',
                role: 'admin'
            });
            console.log('✅ Test Admin created');
        } else {
            admin.password = 'admin123';
            await admin.save();
            console.log('ℹ️  Test Admin password reset');
        }

        // Create/Update Test Member
        const memberEmail = 'abc@gmail.com';
        let user = await User.findOne({ email: memberEmail });
        if (!user) {
            user = await User.create({
                firstName: 'Test',
                lastName: 'Member',
                email: memberEmail,
                password: 'Password123!',
                role: 'member',
                phone: '1234567890'
            });
            console.log('✅ Test User created');
        } else {
            user.password = 'Password123!';
            await user.save();
            console.log('ℹ️  Test User password reset');
        }

        // Ensure Member record exists
        let member = await Member.findOne({ userId: user._id });
        if (!member) {
            member = await Member.create({
                userId: user._id,
                height: { value: 175, unit: 'cm' },
                currentWeight: { value: 70, unit: 'kg' },
                gender: 'male',
                dateOfBirth: '1995-01-01',
                status: 'active'
            });
            console.log('✅ Member record created');
        } else {
            console.log('ℹ️  Member record already exists');
        }

        console.log('\n🚀 Seeding complete. You can now run tests.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();
