const mongoose = require('mongoose');

const workoutTemplateSchema = new mongoose.Schema({
    templateId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    category: {
        type: String,
        enum: ['strength', 'cardio', 'hiit', 'endurance', 'flexibility', 'full_body', 'upper_body', 'lower_body', 'core'],
        default: 'full_body'
    },
    duration: { type: Number, default: 45 }, // estimated minutes
    exercises: [{
        exerciseId: { type: String, required: true },
        name: { type: String, required: true },
        sets: { type: Number, default: 3 },
        reps: { type: Number },
        duration: { type: Number }, // seconds (for cardio/timed)
        restPeriod: { type: Number, default: 60 }, // seconds
        weight: { type: Number }, // suggested starting weight
        notes: { type: String },
        muscleGroups: [String]
    }],
    estimatedCaloriesBurned: { type: Number, default: 0 },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    // AI Generation Fields
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null },
    status: {
        type: String,
        enum: ['pending_review', 'approved', 'rejected'],
        default: 'approved' // Default to approved for legacy templates
    },
    aiGenerated: { type: Boolean, default: false },
    aiPrompt: { type: Object, default: {} },
    adminNotes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('WorkoutTemplate', workoutTemplateSchema);
