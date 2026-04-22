const axios = require('axios');

const API_BASE_URL = 'http://localhost:5005/api'; // From context backend mapped to 5005
let authToken = '';

async function login() {
    try {
        const res = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'abc@gmail.com',
            password: 'Password123!'
        });
        authToken = res.data.token;
        console.log('Logged in successfully');
    } catch (err) {
        console.error('Login failed:', err.response?.data || err.message);
    }
}

async function testGoalLogic() {
    if (!authToken) return;
    const config = { headers: { Authorization: `Bearer ${authToken}` } };

    try {
        // 1. Set a goal
        console.log('Setting a weight goal (lose to 70kg)...');
        const goalRes = await axios.post(`${API_BASE_URL}/weight/goal`, {
            targetWeight: 70,
            type: 'lose'
        }, config);
        console.log('Goal set:', goalRes.data.success);

        // 2. Fetch active goal
        const activeGoalRes = await axios.get(`${API_BASE_URL}/weight/goal/active`, config);
        console.log('Active goal fetched:', activeGoalRes.data.data.targetWeight === 70 ? 'SUCCESS' : 'FAILED');

        // 3. Log weight that doesn't reach goal
        console.log('Logging weight (75kg)...');
        const log1 = await axios.post(`${API_BASE_URL}/weight`, {
            weight: 75,
            unit: 'kg'
        }, config);
        console.log('Goal reached:', log1.data.goalReached); // Should be false

        // 4. Log weight that reaches goal
        console.log('Logging weight (69kg)...');
        const log2 = await axios.post(`${API_BASE_URL}/weight`, {
            weight: 69,
            unit: 'kg'
        }, config);
        console.log('Goal reached:', log2.data.goalReached); // Should be true
        console.log('Goal status in response:', log2.data.activeGoal?.status); // Should be completed

        // 5. Cleanup (optional)
        console.log('Verification finished.');
    } catch (err) {
        console.error('Test failed:', err.response?.data || err.message);
    }
}

async function run() {
    await login();
    await testGoalLogic();
}

run();
