const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function resetPass() {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'dulithamathara@gmail.com' });
    if (user) {
        user.password = 'admin123';
        await user.save(); // This will trigger the bcrypt hashing now
        console.log('Password reset to admin123');
    } else {
        console.log('User not found');
    }
    process.exit(0);
}
resetPass();
