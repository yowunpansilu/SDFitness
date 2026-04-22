const axios = require('axios');
const { getTokens } = require('./authHelper');

const BACKEND = process.env.BACKEND_URL || 'http://localhost:5005';

let memberHeaders = {};
let adminHeaders = {};

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

let createdFeedbackId = null;

async function main() {
    const { memberData, adminData } = await getTokens();
    if (!memberData.token || !adminData.token) {
        console.error('❌ Could not login. Ensure seed script was run.');
        process.exit(1);
    }
    memberHeaders = { headers: { Authorization: `Bearer ${memberData.token}` } };
    adminHeaders = { headers: { Authorization: `Bearer ${adminData.token}` } };

    console.log('--- FEEDBACK & BUG REPORT TESTS (TC_FB) ---');

    // TC_FB_01: Submit suggestion
    await runTest('TC_FB_01 — Submit suggestion', async () => {
        const res = await axios.post(`${BACKEND}/api/feedback`, {
            message: 'I would like to see more leg day workouts.',
            category: 'suggestion'
        }, memberHeaders);
        assert(res.status === 201 || res.status === 200, 'Feedback submitted successfully');
        createdFeedbackId = res.data.data._id;
    });

    // TC_FB_02: Submit bug report with metadata
    await runTest('TC_FB_02 — Submit bug report with metadata', async () => {
        const res = await axios.post(`${BACKEND}/api/feedback/bug`, {
            message: 'App crashed when opening chart',
            category: 'bug',
            stackTrace: 'Error: Something broke\n  at ProgressPage.tsx:123',
            userAgent: 'Mozilla/5.0...',
            errorUrl: 'https://sdfitness.com/dashboard/progress'
        }, memberHeaders);
        assert(res.status === 201 || res.status === 200, 'Bug report submitted');
        assert(res.data.data.category === 'bug', 'Correct category');
        assert(res.data.data.stackTrace !== undefined, 'Metadata persisted');
    });

    // TC_FB_03: Admin status update
    await runTest('TC_FB_03 — Admin status update', async () => {
        if (!createdFeedbackId) throw new Error('No feedback created to update');
        const res = await axios.patch(`${BACKEND}/api/feedback/${createdFeedbackId}/status`, {
            status: 'reviewed'
        }, adminHeaders);
        assert(res.status === 200, 'Admin updated status');
        assert(res.data.data.status === 'reviewed', 'Status changed successfully');
    });

    // TC_FB_04: Admin internal notes
    await runTest('TC_FB_04 — Admin internal notes', async () => {
        const res = await axios.patch(`${BACKEND}/api/feedback/${createdFeedbackId}/notes`, {
            adminNotes: 'Followed up with product team.'
        }, adminHeaders);
        assert(res.status === 200, 'Admin added notes');
        assert(res.data.data.adminNotes === 'Followed up with product team.', 'Notes persisted');
    });

    // TC_FB_05: Field validation
    await runTest('TC_FB_05 — Validation: Message required', async () => {
        try {
            await axios.post(`${BACKEND}/api/feedback`, {
                category: 'suggestion'
            }, memberHeaders);
            throw new Error('Should fail without message');
        } catch (err) {
            assert(err.response.status === 400, 'Correctly blocked empty message');
        }
    });

    if (!process.exitCode) console.log('\n✨ All Feedback tests passed!');
}

main();
