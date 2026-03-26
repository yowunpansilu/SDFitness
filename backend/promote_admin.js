const mongoose = require('mongoose');
require('dotenv').config();

async function promote() {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await mongoose.connection.collection('users').updateOne(
        { email: 'dulithamathara@gmail.com' },
        { $set: { role: 'admin' } }
    );
    console.log('Update result:', result);
    process.exit(0);
}
promote();
