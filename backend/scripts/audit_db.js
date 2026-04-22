const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/sdfitness';

async function checkDB() {
    console.log('--- Database Audit ---');
    try {
        const client = await mongoose.connect(MONGO_URI, { 
            serverSelectionTimeoutMS: 5000 
        });
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        console.log('Collections:', collectionNames.join(', '));

        const reports = [];

        if (collectionNames.includes('membershipplans')) {
            const plans = await db.collection('membershipplans').find({}).toArray();
            reports.push(`Membership Plans: ${plans.length}`);
            plans.forEach(p => reports.push(`  - ${p.name}: LKR ${p.price}`));
        } else {
            reports.push('❌ membershipplans collection missing');
        }

        if (collectionNames.includes('subscriptions')) {
            const subs = await db.collection('subscriptions').find({}).toArray();
            reports.push(`Subscriptions: ${subs.length}`);
        } else {
            reports.push('❌ subscriptions collection missing');
        }

        console.log('\nAudit Results:');
        reports.forEach(r => console.log(r));

        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
        console.log('\nTIP: Ensure Docker containers are running. Use "docker compose ps" to verify.');
    }
}

checkDB();
