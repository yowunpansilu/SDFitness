const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

async function testLogin() {
    await mongoose.connect(process.env.MONGO_URI);
    const email = 'admin@gmail.com';
    const password = 'admin123';
    
    const admin = await Admin.findOne({ email });
    if (!admin) {
        console.log('Admin not found in database!');
    } else {
        console.log('Admin found:', admin.email);
        const isMatch = await admin.matchPassword(password);
        console.log('Password match:', isMatch);
        console.log('Hashed password:', admin.password);
    }
    process.exit(0);
}
testLogin();
