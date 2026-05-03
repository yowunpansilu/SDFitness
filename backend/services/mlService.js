/**
 * ML Service Client — Node.js → Python ML Service bridge
 *
 * Calls the Python Flask microservice to get food recommendations
 * from the trained Gradient Boosting model.
 */

const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
const ML_TIMEOUT_MS  = 90_000;  // 90s — enough for a Render cold start
const ML_MAX_RETRIES = 3;
const ML_RETRY_DELAY = [5_000, 15_000, 30_000]; // backoff: 5s → 15s → 30s

/** Sleep helper */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Build the ML request payload from a user profile.
 */
const buildPayload = (userProfile, livePrices) => ({
    age:                 userProfile.age,
    weight_kg:           userProfile.weight_kg,
    height_cm:           userProfile.height_cm,
    gender:              userProfile.gender,
    activity_level:      userProfile.activity_level || 'moderately_active',
    goal:                userProfile.goal,
    dietary_preferences: userProfile.dietary_preferences || [],
    diet_budget:         userProfile.diet_budget || { amount: 7000, currency: 'LKR', period: 'weekly' },
    live_prices_dict:    livePrices
});

/**
 * Get ML-powered diet recommendation for a user.
 * Retries up to ML_MAX_RETRIES times with exponential backoff to
 * handle Render free-tier cold starts gracefully.
 *
 * @param {Object} userProfile - Member data (age, weight, height, gender, goal, etc.)
 * @param {Object} livePrices  - { foodId: { pricePerGram: Number } } from MongoDB
 * @returns {Object} { success, data } | { success: false, error }
 */
const getMLRecommendation = async (userProfile, livePrices = {}) => {
    const payload = buildPayload(userProfile, livePrices);

    for (let attempt = 1; attempt <= ML_MAX_RETRIES; attempt++) {
        try {
            const response = await axios.post(`${ML_SERVICE_URL}/recommend`, payload, {
                timeout: ML_TIMEOUT_MS,
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.data?.success) {
                return { success: true, data: response.data.data };
            }
            return { success: false, error: response.data?.error || 'Unknown ML service error' };

        } catch (error) {
            const isRetryable = ['ECONNREFUSED', 'ETIMEDOUT', 'ECONNRESET', 'ERR_NETWORK'].includes(error.code)
                || (error.response?.status >= 500);

            if (isRetryable && attempt < ML_MAX_RETRIES) {
                const delay = ML_RETRY_DELAY[attempt - 1];
                console.warn(`⚠️  ML service unreachable (attempt ${attempt}/${ML_MAX_RETRIES}). Retrying in ${delay / 1000}s...`);
                await sleep(delay);
                continue;
            }

            console.error('❌ ML Service Error:', error.message);
            return { success: false, error: `ML service unavailable: ${error.message}` };
        }
    }
};

/**
 * Check if the ML service is healthy
 */
const checkMLHealth = async (customUrl = null) => {
    const url = customUrl || ML_SERVICE_URL;
    try {
        const response = await axios.get(`${url}/health`, { timeout: 3000 });
        return response.data;
    } catch {
        return { status: 'unreachable', model_loaded: false };
    }
};

/**
 * Get ML model info (version, metrics, features)
 */
const getModelInfo = async () => {
    try {
        const response = await axios.get(`${ML_SERVICE_URL}/model-info`, { timeout: 3000 });
        return response.data;
    } catch {
        return null;
    }
};

module.exports = { getMLRecommendation, checkMLHealth, getModelInfo };
