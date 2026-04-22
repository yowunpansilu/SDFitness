const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Admin = require('../models/Admin');
const Member = require('../models/Member');

const checkDB = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        const userCount = await User.countDocuments();
        const adminCount = await Admin.countDocuments();
        const memberCount = await Member.countDocuments();

        console.log(`Users: ${userCount}`);
        console.log(`Admins: ${adminCount}`);
        console.log(`Members: ${memberCount}`);

        const users = await User.find().limit(5).select('-password');
        console.log('\nSample Users:', JSON.stringify(users, null, 2));

        const admins = await Admin.find().limit(5).select('-password');
        console.log('\nSample Admins:', JSON.stringify(admins, null, 2));

        const members = await Member.find().limit(5);
        console.log('\nSample Members:', JSON.stringify(members, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkDB();
