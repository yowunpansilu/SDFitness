const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sdfitness');
    const members = await mongoose.connection.collection('members').find({}).toArray();
    console.log('Members:', JSON.stringify(members, null, 2));
    const users = await mongoose.connection.collection('users').find({}).toArray();
    console.log('Users:', JSON.stringify(users, null, 2));
    process.exit(0);
}
check();
