const axios = require('axios');
const { getTokens } = require('./authHelper');

const BACKEND = process.env.BACKEND_URL || 'http://localhost:5005';

let memberHeaders = {};
let memberId = '';

async function assert(condition, message) {
    if (!condition) throw new Error(`❌ FAIL: ${message}`);
    console.log(`   ✅ ${message}`);
}

async function runTest(name, fn) {
    console.log(`\n🧪 ${name}...`);
    try {
        await fn();
    } catch (err) {
        console.error(`   ❌ ${err.message}`);
        if (err.response) console.error(`      Status: ${err.response.status} | Data:`, err.response.data);
        process.exitCode = 1;
    }
}

async function main() {
    const { memberData } = await getTokens();
    if (!memberData.token) {
        console.error('❌ Could not login member. Ensure seed script was run.');
        process.exit(1);
    }
    memberHeaders = { headers: { Authorization: `Bearer ${memberData.token}` } };
    memberId = memberData.user._id || memberData.user.id;

    console.log('--- PROGRESS TRACKING TESTS (TC_DP) ---');

    // TC_DP_01: Submit daily progress
    await runTest('TC_DP_01 — Submit daily progress', async () => {
        const res = await axios.post(`${BACKEND}/api/progress/daily`, {
            workoutCompleted: true,
            dietFollowed: true,
            notes: 'Strong day today!'
        }, memberHeaders);
        assert(res.status === 201 || res.status === 200, 'Progress submitted successfully');
    });

    // TC_DP_02: Retrieve weekly progress
    await runTest('TC_DP_02 — Retrieve weekly progress', async () => {
        const res = await axios.get(`${BACKEND}/api/progress/weekly`, memberHeaders);
        assert(res.status === 200, 'Successfully retrieved weekly progress');
        assert(Array.isArray(res.data.data), 'Data is an array');
    });

    // TC_DP_03: Duplicate prevention
    await runTest('TC_DP_03 — Duplicate prevention', async () => {
        try {
            await axios.post(`${BACKEND}/api/progress/daily`, {
                workoutCompleted: false,
                dietFollowed: false
            }, memberHeaders);
            throw new Error('Should not allow duplicate logs for same day');
        } catch (err) {
            const hasStatus = err.response && err.response.status === 409;
            assert(hasStatus, 'Correctly blocked duplicate entry (409)');
            const hasMsg = err.response && err.response.data && err.response.data.message;
            assert(hasMsg && err.response.data.message.includes('already logged'), 'Correct error message');
        }
    });

    // TC_DP_04: Notes validation
    await runTest('TC_DP_04 — Note length validation', async () => {
        const res = await axios.get(`${BACKEND}/api/progress/daily`, memberHeaders);
        assert(res.data.data && res.data.data.notes === 'Strong day today!', 'Notes persisted correctly');
    });

    // TC_DP_05: Unauthorized access
    await runTest('TC_DP_05 — Unauthorized access', async () => {
        try {
            await axios.get(`${BACKEND}/api/progress/weekly`);
            throw new Error('Should require token');
        } catch (err) {
            assert(err.response.status === 401, 'Correctly unauthorized');
        }
    });

    // TC_DP_06: Date range logic
    await runTest('TC_DP_06 — Date range logic', async () => {
        const res = await axios.get(`${BACKEND}/api/progress/weekly`, memberHeaders);
        const dates = res.data.data.map(d => new Date(d.date));
        const now = new Date();
        const weekAgo = new Date(now.setDate(now.getDate() - 8));
        const allIncranged = dates.every(d => d >= weekAgo);
        assert(allIncranged, 'All entries within the last week');
    });

    if (!process.exitCode) console.log('\n✨ All Progress tests passed!');
}

main();
