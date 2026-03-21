const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sdfitness');
    
    // Find User by email
    const user = await mongoose.connection.collection('users').findOne({ email: 'testuser@gmail.com' });
    if (!user) {
        console.log('User testuser not found!');
        process.exit(1);
    }
    console.log('--- USER ---');
    console.log(JSON.stringify(user, null, 2));

    process.exit(0);
}
check();
