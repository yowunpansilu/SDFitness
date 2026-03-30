const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sdfitness');
    
    // Find User by firstName
    const user = await mongoose.connection.collection('users').findOne({ firstName: 'abbbb' });
    if (!user) {
        console.log('User abbbb not found!');
        process.exit(1);
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d'
    });
    
    console.log('Token created for abbbb:', token);

    const axios = require('axios');
    try {
        const profileRes = await axios.get('http://localhost:5000/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('\n--- PROFILE ENDPOINT RESPONSE ---');
        console.log(JSON.stringify(profileRes.data, null, 2));
    } catch (e) {
        console.error('Error fetching profile:', e.response?.data || e.message);
    }

    process.exit(0);
}
check();
