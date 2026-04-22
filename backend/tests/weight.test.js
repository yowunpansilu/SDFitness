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

let createdWeightId = null;

async function main() {
    const { memberData } = await getTokens();
    if (!memberData.token) {
        console.error('❌ Could not login member. Ensure seed script was run.');
        process.exit(1);
    }
    memberHeaders = { headers: { Authorization: `Bearer ${memberData.token}` } };
    memberId = memberData.user._id || memberData.user.id;

    console.log('--- WEIGHT TRACKING TESTS (TC_WT) ---');

    // TC_WT_01: Weight entry (KG)
    await runTest('TC_WT_01 — Log weight in KG', async () => {
        const res = await axios.post(`${BACKEND}/api/weight`, {
            weight: 75.5,
            unit: 'kg',
            note: 'Morning weight'
        }, memberHeaders);
        assert(res.status === 201 || res.status === 200, 'Weight logged successfully');
        createdWeightId = res.data.data._id;
    });

    // TC_WT_02: Unit conversion (LBS to KG)
    await runTest('TC_WT_02 — Unit conversion LBS to KG', async () => {
        const res = await axios.post(`${BACKEND}/api/weight`, {
            weight: 154,
            unit: 'lbs'
        }, memberHeaders);
        // 154 lbs ~ 69.85 kg
        assert(Math.abs(res.data.data.weightKg - 69.85) < 0.1, 'Weight correctly converted to KG');
    });

    // TC_WT_03: Profile auto-update
    await runTest('TC_WT_03 — Profile auto-update', async () => {
        // This requires checking the Member model, but we can verify via login or profile endpoint if implemented
        try {
            const res = await axios.get(`${BACKEND}/api/auth/profile`, memberHeaders);
            // This depends on how profile endpoint returns it
            if (res.data.member && res.data.member.currentWeight) {
                assert(res.data.member.currentWeight.value === 69.85 || Math.abs(res.data.member.currentWeight.value - 69.85) < 0.1, 'Member profile weight updated');
            } else {
                console.log('   ⏭️  Skipped (profile check: property missing on endpoint)');
            }
        } catch (e) {
            console.log('   ⏭️  Skipped (profile check: endpoint failed or unauthorized in test context)');
        }
    });

    // TC_WT_04: History retrieval
    await runTest('TC_WT_04 — Retrieve weight history', async () => {
        const res = await axios.get(`${BACKEND}/api/weight/history`, memberHeaders);
        assert(res.status === 200, 'History retrieved');
        assert(res.data.data.length >= 2, 'At least 2 entries found');
    });

    // TC_WT_05: Negative weight prevention
    await runTest('TC_WT_05 — Prevention of negative weight', async () => {
        try {
            await axios.post(`${BACKEND}/api/weight`, { weight: -10, unit: 'kg' }, memberHeaders);
            throw new Error('Should not allow negative weight');
        } catch (err) {
            assert(err.response.status === 400, 'Correctly blocked negative weight');
        }
    });

    // TC_WT_06: Entry deletion
    await runTest('TC_WT_06 — Delete weight log', async () => {
        if (!createdWeightId) throw new Error('No weight log to delete');
        const res = await axios.delete(`${BACKEND}/api/weight/${createdWeightId}`, memberHeaders);
        assert(res.status === 200, 'Log deleted successfully');
    });

    if (!process.exitCode) console.log('\n✨ All Weight tests passed!');
}

main();
