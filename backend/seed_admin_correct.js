const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const User = require('./models/User');
require('dotenv').config();

async function seedAdmin() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear existing admins
    await Admin.deleteMany({});
    
    // Create new admin in the admins collection
    const admin = await Admin.create({
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'admin'
    });
    
    console.log('Admin admin@gmail.com has been seeded in the ADMINS collection.');
    
    // Cleanup: Ensure the user collection doesn't have an admin role for anyone else?
    // User role: 'admin' might still exist, let's just make it 'member' if they existed before?
    // Actually, I'll just remove the admin I created in the users collection to avoid confusion.
    await User.deleteOne({ email: 'admin@gmail.com' }); // Remove from users collection if exists
    
    console.log('Cleaned up any admin@gmail.com records in the users collection.');
    process.exit(0);
}
seedAdmin();
