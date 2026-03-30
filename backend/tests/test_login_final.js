const axios = require('axios');
async function testLoginCorrect() {
    try {
        const payload = {
            email: 'test1774341077642@example.com',
            password: 'password123'
        };
        const res = await axios.post('http://localhost:5000/api/auth/login', payload);
        console.log('SUCCESS:', res.data);
    } catch (err) {
        console.error('FAILED:', err.response ? err.response.data : err.message);
    }
}
testLoginCorrect();
