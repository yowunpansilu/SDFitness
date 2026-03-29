const axios = require('axios');

const API_URL = 'http://localhost:5005/api';

async function test() {
    try {
        console.log('--- Testing GET /classes ---');
        const classesRes = await axios.get(`${API_URL}/classes`);
        console.log(`Found ${classesRes.data.length} classes.`);
        if (classesRes.data.length > 0) {
            console.log('First class schedule:', classesRes.data[0].schedule);
        }

        const classId = classesRes.data[0]._id;
        const userId = '69c91b93555afc563567ed49'; 
        const classDate = new Date().toISOString();

        console.log('\n--- Testing POST /classes/book ---');
        try {
            const bookRes = await axios.post(`${API_URL}/classes/book`, { classId, userId, classDate });
            console.log('Booking successful:', bookRes.data);
        } catch (err) {
            if (err.response?.status === 400 && err.response?.data?.error === 'Already booked for this class') {
                console.log('Booking already exists (expected if re-running test)');
            } else {
                throw err;
            }
        }

        console.log('\n--- Testing GET /members/:id/bookings ---');
        const bookingsRes = await axios.get(`${API_URL}/members/${userId}/bookings`);
        console.log(`Found ${bookingsRes.data.length} bookings for user ${userId}.`);
        if (bookingsRes.data.length > 0) {
            console.log('First booking gymClass name:', bookingsRes.data[0].gymClass.name);
        }

    } catch (err) {
        console.error('Test failed:', err.response?.data || err.message);
    }
}

test();
