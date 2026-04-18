const mongoose = require('mongoose');
require('dotenv').config();

async function inspectAtlas() {
    const atlasUri = process.env.FOOD_DB_URI;
    const dbName = process.env.FOOD_DB_NAME || 'keelsPriceDB';

    if (!atlasUri) {
        console.error('❌ FOOD_DB_URI is missing in .env');
        process.exit(1);
    }

    console.log(`🔍 Connecting to Atlas: ${atlasUri.split('@')[1]} ...`);

    try {
        const conn = await mongoose.createConnection(atlasUri, {
            dbName: dbName
        }).asPromise();

        console.log(`✅ Connected to Atlas! Current Database: ${conn.name}`);

        const dbs = await conn.db.admin().listDatabases();
        console.log('\n--- Databases on Cluster ---');
        dbs.databases.forEach(db => console.log(`- ${db.name}`));

        // Check target database (from .env)
        console.log(`\n--- Collections in [${conn.name}] ---`);
        const collections = await conn.db.listCollections().toArray();
        for (const col of collections) {
            const count = await conn.db.collection(col.name).countDocuments();
            console.log(`- ${col.name} (Count: ${count})`);
        }

        // Check "test" database (the one hardcoded in ExternalProduct.js)
        console.log(`\n--- Collections in [test] ---`);
        const testDb = conn.useDb('test');
        const testCollections = await testDb.db.listCollections().toArray();
        for (const col of testCollections) {
            const count = await testDb.db.collection(col.name).countDocuments();
            console.log(`- ${col.name} (Count: ${count})`);
        }

        await conn.close();
    } catch (err) {
        console.error(`❌ Atlas Inspection Error: ${err.message}`);
    }
    process.exit(0);
}

inspectAtlas();
