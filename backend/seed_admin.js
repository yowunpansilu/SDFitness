const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    const email = process.argv[2];
    const password = process.argv[3];
    await User.create({
        email, password, firstName: 'Super', lastName: 'Admin', role: 'admin'
    });
    console.log('Seed done');
    process.exit(0);
}
seed().catch(console.error);
