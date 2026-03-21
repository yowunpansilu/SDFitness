const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sdfitness');
    
    // Find User by firstName
    const user = await mongoose.connection.collection('users').findOne({ firstName: 'abbbb' });
    if (!user) {
        console.log('User abbbb not found!');
        process.exit(1);
    }
    console.log('--- USER ---');
    console.log(JSON.stringify(user, null, 2));

    // Find Member
    const member = await mongoose.connection.collection('members').findOne({ userId: user._id });
    if (!member) {
        console.log('Member not found for user!');
    } else {
        console.log('--- MEMBER ---');
        console.log(JSON.stringify(member, null, 2));
    }

    process.exit(0);
}
check();
