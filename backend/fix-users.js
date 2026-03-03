const mongoose = require('mongoose');
const User = require('./models/User');
const Member = require('./models/Member');
require('dotenv').config();

async function fix() {
    await mongoose.connect(process.env.MONGO_URI);
    const members = await Member.find();
    for (const member of members) {
        await User.findByIdAndUpdate(member.userId, { memberId: member._id });
    }
    console.log('Fixed users memberId');
    process.exit(0);
}
fix();
