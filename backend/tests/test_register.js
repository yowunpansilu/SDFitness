const axios = require('axios');

async function testRegister() {
    try {
        const payload = {
            step1Data: {
                firstName: 'Test',
                lastName: 'User',
                email: 'test' + Date.now() + '@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                phone: '1234567890'
            },
            step2Data: {
                dateOfBirth: '1990-01-01',
                gender: 'Male',
                height: '170',
                heightUnit: 'cm',
                weight: '70',
                weightUnit: 'kg'
            },
            step3Data: {
                fitnessGoals: ['Weight Loss'],
                activityLevel: 'moderate',
                dietaryPreferences: ['Vegetarian']
            }
        };

        const res = await axios.post('http://localhost:5000/api/auth/register', payload);
        console.log('SUCCESS:', res.data);
    } catch (err) {
        console.error('FAILED:', err.response ? err.response.data : err.message);
    }
}

testRegister();
