const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Class = require('./models/Class');

async function checkClasses() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sdfitness');
        console.log('Connected to MongoDB');

        const classes = await Class.find().lean();
        console.log('Total classes:', classes.length);
        
        classes.forEach(c => {
            console.log('---');
            console.log('ID:', c._id);
            console.log('Name:', c.name);
            console.log('Schedule:', JSON.stringify(c.schedule));
            console.log('Enrolled:', c.enrolled);
            console.log('Capacity:', c.capacity);
            console.log('Created At:', c.createdAt);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkClasses();
