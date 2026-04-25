const mongoose = require('mongoose');
const crypto = require('crypto');

const exerciseSetSchema = new mongoose.Schema({
    setNumber: { type: Number, required: true },
    reps: { type: Number },
    weight: { type: Number },
    duration: { type: Number }, // seconds
    completed: { type: Boolean, default: false }
}, { _id: false });

const exerciseSchema = new mongoose.Schema({
    exerciseId: { type: String, required: true },
    name: { type: String },
    sets: [exerciseSetSchema],
    notes: { type: String }
}, { _id: false });

const personalRecordSchema = new mongoose.Schema({
    exerciseId: { type: String, required: true },
    exerciseName: { type: String },
    recordType: { type: String, enum: ['max_weight', 'max_reps', 'longest_duration'], required: true },
    value: { type: Number, required: true },
    achievedAt: { type: Date, default: Date.now }
}, { _id: false });

const workoutSchema = new mongoose.Schema({
    workoutId: { type: String, default: () => crypto.randomUUID(), unique: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    templateId: { type: String },
    workoutDate: { type: Date, required: true },
    startTime: { type: Date },
    endTime: { type: Date },
    duration: { type: Number, default: 0 }, // minutes
    exercises: [exerciseSchema],
    totalCaloriesBurned: { type: Number, default: 0 },
    personalRecords: [personalRecordSchema],
    difficulty: { type: String, enum: ['too_easy', 'just_right', 'too_hard'] },
    energyLevel: { type: String, enum: ['low', 'medium', 'high'] },
    notes: { type: String },
    status: { type: String, enum: ['planned', 'in_progress', 'completed', 'skipped'], default: 'completed' }
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);
