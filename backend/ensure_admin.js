const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function fixAdmin() {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'admin@sdfitness.com' });
    if (user) {
        user.role = 'admin';
        user.password = 'admin123';
        await user.save();
        console.log('User admin@sdfitness.com updated to ADMIN with password admin123');
    } else {
        console.log('User not found. Creating new admin...');
        await User.create({
            firstName: 'Dulitha',
            lastName: 'Matharaarachchi',
            email: 'admin@sdfitness.com',
            phone: '0000000000',
            password: 'admin123',
            role: 'admin'
        });
        console.log('Admin created successfully.');
    }
    process.exit(0);
}
fixAdmin();
