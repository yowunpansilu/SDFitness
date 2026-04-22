const OpenAI = require('openai');
const WorkoutTemplate = require('../models/WorkoutTemplate');
const Member = require('../models/Member');

const NVIDIA_MODEL = 'meta/llama-3.1-70b-instruct';

/**
 * Generate a 1-to-1 Workout using AI
 */
const generateWorkoutPlan = async (memberProfile, adminOverrides = {}) => {
    const keys = process.env.WORKOUT_NVIDIA_API_KEY || '';
    const apiKey = keys.split(',')[0].trim();

    if (!apiKey) {
        throw new Error("NVIDIA Workout API key is missing.");
    }

    const { targetDuration = 30, difficulty = 'intermediate', category = 'strength', notes = '' } = adminOverrides;

    const prompt = `You are a fitness expert. I need a ${difficulty} level ${category} workout strictly tailored for:
- Age: ${memberProfile.age || 25}
- Weight: ${memberProfile.weight_kg || 70}kg
- Target duration: ${targetDuration} minutes
${notes ? `\nAdditional Constraints from Admin:\n- ${notes}\n` : ''}

Requirements:
- Ensure the difficulty matches '${difficulty}' and the category matches '${category}'.
- Must return valid JSON matching this schema:
{
    "planName": "AI ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} ${category.charAt(0).toUpperCase() + category.slice(1)}",
    "description": "Short description of the session",
    "difficulty": "${difficulty}",
    "category": "${category}",
    "duration": ${targetDuration},
    "estimatedCaloriesBurned": 250,
    "exercises": [
        {
            "name": "Exercise Name",
            "sets": 3,
            "reps": 10,
            "duration": 0, // strictly duration in seconds if cardio/isometric
            "restPeriod": 60,
            "notes": "Keep good form.",
            "muscleGroups": ["Legs", "Core"]
        }
    ]
}

No markdown tags. ONLY return a valid JSON object.`;

    const client = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://integrate.api.nvidia.com/v1'
    });

    const response = await client.chat.completions.create({
        model: NVIDIA_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2048,
        response_format: { type: 'json_object' }
    });

    let text = response.choices[0].message.content.trim();
    if (text.startsWith('\`\`\`json')) {
        text = text.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
    }

    return JSON.parse(text);
};

module.exports = {
    generateWorkoutPlan
};
