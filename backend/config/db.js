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
    if (!process.env.FOOD_DB_URI) return null;
    try {
        foodDbConnection = await mongoose.createConnection(process.env.FOOD_DB_URI).asPromise();
        console.log(`✅ Atlas Food DB Connected: ${foodDbConnection.host}`);
        return foodDbConnection;
    } catch (error) {
        console.warn(`⚠️  Atlas Food DB Connection Warning: ${error.message}`);
        return null;
    }
};

const getFoodDbConnection = () => foodDbConnection;

module.exports = { connectDB, connectFoodDB, getFoodDbConnection };
