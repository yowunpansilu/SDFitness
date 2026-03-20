const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const test = async () => {
    try {
        console.log('Testing connection to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connection successful');
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        
        const User = mongoose.model('User', new mongoose.Schema({ email: String }));
        const userCount = await User.countDocuments();
        console.log('User count:', userCount);

        const Member = mongoose.model('Member', new mongoose.Schema({ memberNumber: String }));
        const memberCount = await Member.countDocuments();
        console.log('Member count:', memberCount);
        
        const indexes = await mongoose.connection.db.collection('members').indexes();
        console.log('Member indexes:', JSON.stringify(indexes, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }
}

test();
