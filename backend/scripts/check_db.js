const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/sdfitness';

async function checkDB() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected!');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const Plan = mongoose.model('Plan', new mongoose.Schema({}, { strict: false }), 'plans');
        const Subscription = mongoose.model('Subscription', new mongoose.Schema({}, { strict: false }), 'subscriptions');

        const plans = await Plan.find({});
        console.log(`\nMembership Plans (${plans.length}):`);
        plans.forEach(p => console.log(`- ${p.name || 'Unknown'}: LKR ${p.price || 0}`));

        const subs = await Subscription.find({});
        console.log(`\nSubscriptions (${subs.length}):`);
        subs.slice(0, 5).forEach(s => console.log(`- User: ${s.user}, Plan: ${s.plan}, Status: ${s.status}`));

        await mongoose.disconnect();
        console.log('\nDisconnected.');
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkDB();
