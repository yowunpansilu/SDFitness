const axios = require('axios');

async function testLogin() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'abc@gmail.com',
            password: 'Password123!' // Assuming this is the password or similar
        });
        console.log('Login success!');
        console.log('Response DATA KEYS:', Object.keys(res.data));
        console.log('User:', res.data.user);
        console.log('Member:', res.data.member);
        
        // Then try the profile endpoint
        const token = res.data.token;
        const profileRes = await axios.get('http://localhost:5000/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('\n--- PROFILE ENDPOINT ---');
        console.log('User:', profileRes.data.user);
        console.log('Member height:', profileRes.data.member?.height);
        console.log('Member weight:', profileRes.data.member?.currentWeight);
    } catch (e) {
        console.error('Error:', e.response?.data || e.message);
    }
}
testLogin();
