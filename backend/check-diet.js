const mongoose = require('mongoose');
const DietPlan = require('./models/DietPlan');
const User = require('./models/User');

async function checkDb() {
    await mongoose.connect('mongodb://localhost:27017/sdfitness');

    const count = await DietPlan.countDocuments();
    console.log('Total diet plans:', count);

    if (count > 0) {
        const plans = await DietPlan.find().limit(2);
        console.log('Sample plans:', JSON.stringify(plans, null, 2));
    }

    const users = await User.find({ role: 'member' }).limit(3);
    console.log('Sample users:', users.map(u => ({ email: u.email, id: u._id, memberId: u.memberId })));

    process.exit(0);
}

checkDb();
