/**
 * Keep-Alive Task — Prevents Render free-tier cold starts
 *
 * Pings the backend health endpoint and the ML service health endpoint
 * every 14 minutes. Render spins down free instances after 15 minutes
 * of inactivity, so this keeps both services warm.
 */

const axios = require('axios');

const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

const BACKEND_URL  = process.env.RENDER_EXTERNAL_URL  || `http://localhost:${process.env.PORT || 5000}`;
const ML_URL       = process.env.ML_SERVICE_URL        || 'http://localhost:5001';

const ping = async (name, url) => {
    try {
        const res = await axios.get(url, { timeout: 10_000 });
        console.log(`[KeepAlive] ✅ ${name} alive — status: ${res.data?.status ?? res.status}`);
    } catch (err) {
        console.warn(`[KeepAlive] ⚠️  ${name} ping failed: ${err.message}`);
    }
};

const startKeepAlive = () => {
    // Only run in production (Render sets NODE_ENV=production)
    if (process.env.NODE_ENV !== 'production') {
        console.log('[KeepAlive] Skipped — not in production.');
        return;
    }

    console.log(`[KeepAlive] Started — pinging every ${PING_INTERVAL_MS / 60000} minutes.`);
    console.log(`[KeepAlive] Backend: ${BACKEND_URL}/api/health`);
    console.log(`[KeepAlive] ML:      ${ML_URL}/health`);

    setInterval(async () => {
        await ping('Backend', `${BACKEND_URL}/api/health`);
        await ping('ML Service', `${ML_URL}/health`);
    }, PING_INTERVAL_MS);
};

module.exports = { startKeepAlive };
