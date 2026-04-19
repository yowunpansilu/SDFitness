const mongoose = require('mongoose');

// Primary connection (Local MongoDB) for members, classes, etc.
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ Local MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ Local MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

// Secondary connection (Atlas) for food prices if configured
let foodDbConnection = null;
const connectFoodDB = async () => {
    // If FOOD_DB_URI is missing, we might be using MONGO_URI for both but want a separate connection to 'test'
    // As per user request, Atlas has a separate hierarchy.
    // Use FOOD_DB_NAME as primary, fallback to DB_NAME for backward compatibility
    const atlasUri = process.env.FOOD_DB_URI || process.env.MONGO_URI;
    const dbName = process.env.FOOD_DB_NAME || process.env.DB_NAME || 'keelsPriceDB';

    if (!atlasUri || !atlasUri.startsWith('mongodb+srv')) return null;

    try {
        foodDbConnection = await mongoose.createConnection(atlasUri, {
            dbName: dbName,
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of hanging
            connectTimeoutMS: 10000
        }).asPromise();
        console.log(`✅ Atlas Food DB Connected [${dbName}]: ${foodDbConnection.host}`);
        return foodDbConnection;
    } catch (error) {
        console.warn(`⚠️  Atlas Food DB Connection Warning: ${error.message}`);
        console.warn('Backend will continue without Atlas Food DB connection.');
        return null;
    }
};

const getFoodDbConnection = () => foodDbConnection;

module.exports = { connectDB, connectFoodDB, getFoodDbConnection };
