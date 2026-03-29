const axios = require('axios');

const API_URL = 'http://localhost:5005/api';

async function test() {
    try {
        console.log('--- Testing GET /workouts/templates ---');
        const templatesRes = await axios.get(`${API_URL}/workouts/templates`);
        console.log(`Found ${templatesRes.data.data.length} templates.`);
        if (templatesRes.data.data.length > 0) {
            console.log('First template name:', templatesRes.data.data[0].name);
        }

        const templateId = templatesRes.data.data[0]._id;
        const userId = '69c91b93555afc563567ed49'; // Using a test user ID

        console.log('\n--- Testing POST /api/workouts (Log Workout) ---');
        const workoutData = {
            memberId: userId,
            templateId: templateId,
            duration: 45,
            exercises: [
                {
                    exerciseId: 'E-GOBLET-SQUAT',
                    name: 'Goblet Squats',
                    sets: [
                        { setNumber: 1, reps: 12, weight: 15, completed: true },
                        { setNumber: 2, reps: 12, weight: 15, completed: true }
                    ]
                }
            ],
            notes: 'Felt great during the first test workout!'
        };

        const logRes = await axios.post(`${API_URL}/workouts`, workoutData);
        console.log('Workout logged successfully:', logRes.data.success);
        console.log('Workout ID:', logRes.data.data.workoutId);

        console.log('\n--- Testing GET /api/workouts/member/:id (History) ---');
        const historyRes = await axios.get(`${API_URL}/workouts/member/${userId}`);
        console.log(`Found ${historyRes.data.data.length} workout logs for user ${userId}.`);
        if (historyRes.data.data.length > 0) {
            console.log('Last workout details:', historyRes.data.data[0].notes);
            console.log('Stats summary:', historyRes.data.stats);
        }

    } catch (err) {
        console.error('Test failed:', err.response?.data || err.message);
    }
}

test();
