const mongoose = require('mongoose');

const personalRecordSchema = new mongoose.Schema({
    exerciseId: { type: String, required: true },
    exerciseName: { type: String },
    recordType: { 
        type: String, 
        enum: ['max_weight', 'max_reps', 'longest_duration'],
        required: true 
    },
    value: { type: Number, required: true },
    achievedAt: { type: Date, default: Date.now }
});

const exerciseLogSchema = new mongoose.Schema({
    exerciseId: { type: String, required: true },
    name: { type: String },
    sets: [{
        setNumber: { type: Number, required: true },
        reps: { type: Number },
        weight: { type: Number },
        duration: { type: Number }, // seconds
        completed: { type: Boolean, default: true }
    }],
    notes: { type: String }
});

const workoutLogSchema = new mongoose.Schema({
    workoutId: { type: String, required: true, unique: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutTemplate' },
    workoutDate: { type: Date, default: Date.now },
    startTime: { type: Date },
    endTime: { type: Date },
    duration: { type: Number }, // minutes
    exercises: [exerciseLogSchema],
    totalCaloriesBurned: { type: Number, default: 0 },
    personalRecords: [personalRecordSchema],
    difficulty: { 
        type: String, 
        enum: ['too_easy', 'just_right', 'too_hard'],
        default: 'just_right'
    },
    energyLevel: { 
        type: String, 
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    notes: { type: String },
    status: { 
        type: String, 
        enum: ['planned', 'in_progress', 'completed', 'skipped'],
        default: 'completed'
    }
}, { timestamps: true });

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);
