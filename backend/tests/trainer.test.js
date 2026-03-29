/**
 * Trainer CRUD Integration Test
 * Run with: node backend/tests/trainer.test.js
 * Requires: backend running on :5000 (or :3005 as per integration.test.js)
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');

const BACKEND = process.env.BACKEND_URL || 'http://localhost:5005';
const SECRET = process.env.JWT_SECRET || 'sdfitness_jwt_secret_2026_ai01g08_very_long_secure_string';
const token = jwt.sign({ id: '69c7a576fdb42b9bfa03c728', role: 'admin' }, SECRET);
const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

function assert(condition, message) {
    if (!condition) throw new Error(`❌ FAIL: ${message}`);
    console.log(`   ✅ ${message}`);
}

async function runTest(name, fn) {
    process.stdout.write(`\n🧪 ${name}...\n`);
    try {
        await fn();
    } catch (err) {
        console.error(`   ❌ ${err.message}`);
        if (err.response) {
            console.error(`      Status: ${err.response.status}`);
            console.error(`      Data: ${JSON.stringify(err.response.data)}`);
        }
        process.exitCode = 1;
    }
}

async function main() {
    console.log('━'.repeat(60));
    console.log('  Trainer Management — Integration Tests');
    console.log('━'.repeat(60));

    let testTrainerId = null;

    const testTrainerData = {
        firstName: 'Test',
        lastName: 'Trainer',
        email: `test.trainer.${Date.now()}@sdfitness.com`,
        phone: '1234567890',
        bio: 'Professional testing entity for elite validation.',
        experienceYears: 5,
        specializations: ['Testing', 'Automation'],
        hourlyRate: 50.5,
        certifications: [
            { name: 'Certified Tester', issuer: 'QA Org', issueDate: '2024-01-01' }
        ],
        employmentStatus: 'full-time',
        emergencyContact: {
            name: 'Emergency Unit',
            relationship: 'Backup',
            phone: '0987654321'
        }
    };

    // 1. Create Trainer
    await runTest('Create Trainer', async () => {
        const { data } = await axios.post(`${BACKEND}/api/trainers`, testTrainerData, authHeaders);
        assert(data._id, 'Trainer created with ID');
        assert(data.userId, 'Linked User ID exists');
        assert(data.specializations.includes('Testing'), 'Specializations saved correctly');
        testTrainerId = data._id;
    });

    // 2. Get Trainer List
    await runTest('List Trainers', async () => {
        const { data } = await axios.get(`${BACKEND}/api/trainers`, authHeaders);
        assert(Array.isArray(data), 'Response is an array');
        assert(data.some(t => t._id === testTrainerId), 'New trainer found in list');
    });

    // 3. Update Trainer
    await runTest('Update Trainer', async () => {
        const updateData = {
            bio: 'Updated bio for testing purposes.',
            hourlyRate: 75.0,
            specializations: ['Testing', 'Automation', 'Performance']
        };
        const { data } = await axios.put(`${BACKEND}/api/trainers/${testTrainerId}`, updateData, authHeaders);
        assert(data.bio === updateData.bio, 'Bio updated');
        assert(data.hourlyRate === updateData.hourlyRate, 'Hourly rate updated');
        assert(data.specializations.length === 3, 'Specializations updated');
    });

    // 4. Delete Trainer
    await runTest('Delete Trainer', async () => {
        const { data } = await axios.delete(`${BACKEND}/api/trainers/${testTrainerId}`, authHeaders);
        assert(data.message === 'Trainer deleted successfully', 'Delete success message');

        // Verify it's gone
        try {
            await axios.get(`${BACKEND}/api/trainers/${testTrainerId}`, authHeaders);
            assert(false, 'Trainer should be 404');
        } catch (e) {
            assert(e.response.status === 404, 'Trainer not found after deletion');
        }
    });

    console.log('\n━'.repeat(60));
    if (process.exitCode === 1) {
        console.log('  ⚠️  Tests failed.');
    } else {
        console.log('  🎉 All Trainer tests passed!');
    }
    console.log('━'.repeat(60));
}

main();
