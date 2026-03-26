const axios = require('axios');

async function check() {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            step1Data: {
                firstName: 'Test',
                lastName: 'User',
                email: 'testauthx4@gmail.com',
                password: 'Password123!',
                confirmPassword: 'Password123!',
                phone: '1234567890'
            },
            step2Data: {
                dateOfBirth: '2000-01-01',
                gender: 'Male',
                height: '180',
                heightUnit: 'cm',
                weight: '80',
                weightUnit: 'kg'
            },
            step3Data: {
                fitnessGoals: ['Muscle Gain'],
                activityLevel: 'Active',
                dietaryPreferences: ['Vegan']
            }
        });
        console.log('Success:', response.data.success);
        console.log('Member:', response.data.member);
    } catch (e) {
        console.error('ERROR during registration endpoint:');
        console.error(e.response?.data || e.message);
    }
}
check();
