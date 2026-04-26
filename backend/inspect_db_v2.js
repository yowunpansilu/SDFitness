const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sdfitness');
    
    // Check for "members"
    const membersList = await mongoose.connection.collection('members').find({}).toArray();
    console.log(`--- MEMBERS (Count: ${membersList.length}) ---`);
    membersList.forEach(m => {
        console.log(`Member ID: ${m._id}, User Link: ${m.userId || 'NULL!'}, Email from userId? (fetching now)`);
    });

    // Check for "users"
    const usersList = await mongoose.connection.collection('users').find({}).toArray();
    console.log(`--- USERS (Count: ${usersList.length}) ---`);
    for (const u of usersList) {
        const hasMember = membersList.some(m => m.userId && m.userId.toString() === u._id.toString());
        console.log(`User ID: ${u._id}, Email: ${u.email}, Phone: ${u.phone}, Has Member: ${hasMember}`);
    }

    process.exit(0);
}
check();
