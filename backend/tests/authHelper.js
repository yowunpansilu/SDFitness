const axios = require('axios');

const BACKEND = process.env.BACKEND_URL || 'http://localhost:5005';

async function getTokens() {
    try {
        console.log('--- Setting up Test Authentication ---');

        // Try to login as member
        let memberData = { token: '', user: null };
        try {
            const memberRes = await axios.post(`${BACKEND}/api/auth/login`, {
                email: 'abc@gmail.com',
                password: 'Password123!'
            });
            memberData = {
                token: memberRes.data.token,
                user: memberRes.data.user
            };
            console.log('✅ Member token and user ID acquired');
        } catch (e) {
            console.log('⚠️  Member login failed:', e.response?.data?.error || e.message);
        }

        // Try to login as admin
        let adminData = { token: '', user: null };
        try {
            const adminRes = await axios.post(`${BACKEND}/api/auth/login`, {
                email: 'admin@gmail.com',
                password: 'admin123'
            });
            adminData = {
                token: adminRes.data.token,
                user: adminRes.data.user
            };
            console.log('✅ Admin token and user ID acquired');
        } catch (e) {
            console.log('⚠️  Admin login failed:', e.response?.data?.error || e.message);
        }

        return { memberData, adminData };
    } catch (err) {
        console.error('❌ Setup failed:', err.message);
        return {
            memberData: { token: '', user: null },
            adminData: { token: '', user: null }
        };
    }
}

module.exports = { getTokens };
