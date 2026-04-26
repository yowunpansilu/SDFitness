/**
 * ML Service Client — Node.js → Python ML Service bridge
 *
 * Calls the Python Flask microservice to get food recommendations
 * from the trained Gradient Boosting model.
 */

const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
const ML_TIMEOUT_MS = 10000; // 10 second timeout

/**
 * Get ML-powered diet recommendation for a user
 * @param {Object} userProfile - Member data (age, weight, height, gender, goal, etc.)
 * @param {Object} livePrices - { foodId: { pricePerGram: Number } } from MongoDB
 * @returns {Object} Structured recommendation with days, shopping list, macros
 */
const getMLRecommendation = async (userProfile, livePrices = {}) => {
    try {
        const response = await axios.post(`${ML_SERVICE_URL}/recommend`, {
            age: userProfile.age,
            weight_kg: userProfile.weight_kg,
            height_cm: userProfile.height_cm,
            gender: userProfile.gender,
            activity_level: userProfile.activity_level || 'moderately_active',
            goal: userProfile.goal,
            dietary_preferences: userProfile.dietary_preferences || [],
            diet_budget: userProfile.diet_budget || { amount: 7000, currency: 'LKR', period: 'weekly' },
            live_prices_dict: livePrices
        }, {
            timeout: ML_TIMEOUT_MS,
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.data && response.data.success) {
            return { success: true, data: response.data.data };
        } else {
            return { success: false, error: response.data?.error || 'Unknown ML service error' };
        }
    } catch (error) {
        // Retry once on timeout or connection error
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            console.warn('⚠️  ML service unreachable, retrying once...');
            try {
                const retry = await axios.post(`${ML_SERVICE_URL}/recommend`, {
                    age: userProfile.age,
                    weight_kg: userProfile.weight_kg,
                    height_cm: userProfile.height_cm,
                    gender: userProfile.gender,
                    activity_level: userProfile.activity_level || 'moderately_active',
                    goal: userProfile.goal,
                    dietary_preferences: userProfile.dietary_preferences || [],
                    diet_budget: userProfile.diet_budget || { amount: 7000, currency: 'LKR', period: 'weekly' },
                    live_prices_dict: livePrices
                }, { timeout: ML_TIMEOUT_MS });

                if (retry.data?.success) {
                    return { success: true, data: retry.data.data };
                }
            } catch (retryErr) {
                // Fall through to error return
            }
        }

        console.error('❌ ML Service Error:', error.message);
        return { success: false, error: `ML service unavailable: ${error.message}` };
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
