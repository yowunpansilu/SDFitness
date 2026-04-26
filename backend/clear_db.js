const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const clearDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        await mongoose.connection.db.dropDatabase();
        console.log('✅ Database dropped (Cleared everything for a fresh start!)');
        process.exit(0);
    } catch (err) {
        console.error('❌ FAILED to clear DB:', err.message);
        process.exit(1);
    }
};

clearDB();
