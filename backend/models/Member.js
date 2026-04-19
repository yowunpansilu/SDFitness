const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    memberNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer_not_to_say'],
        required: true
    },

    // Health Metrics (Input features for ML model)
    height: {
        value: { type: Number, required: true, min: 50, max: 300 },
        unit: { type: String, enum: ['cm', 'inches'], default: 'cm' }
    },
    currentWeight: {
        value: { type: Number, required: true, min: 20, max: 500 },
        unit: { type: String, enum: ['kg', 'lbs'], default: 'kg' }
    },
    targetWeight: {
        value: Number,
        unit: { type: String, enum: ['kg', 'lbs'], default: 'kg' }
    },
    bodyFatPercentage: { type: Number, min: 0, max: 100 },

    // Calculated Fields (used by ML model)
    bmi: Number,
    bmr: Number,
    tdee: Number,

    // Fitness Goals (ML input)
    fitnessGoals: [{
        type: String,
        enum: ['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness', 'strength', 'athletic_performance']
    }],

    // Dietary Information (ML constraints)
    dietaryPreferences: [{
        type: String,
        enum: ['vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'halal', 'kosher', 'gluten_free', 'dairy_free', 'none']
    }],
    allergies: [{ type: String, trim: true }],
    dietBudget: {
        amount: Number,
        currency: { type: String, default: 'LKR' },
        period: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            default: 'weekly'
        }
    },

    // Activity Level (ML input)
    activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active', 'very_active', 'lightly_active', 'moderately_active', 'extremely_active'],
        default: 'moderate'
    },

    // Medical
    medicalConditions: [{ type: String, trim: true }],
    medications: [{ type: String, trim: true }],
    emergencyContact: {
        name: String,
        relationship: String,
        phoneNumber: String
    },

    // Membership
    membershipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership', default: null },
    membershipType: { type: String, enum: ['basic', 'standard', 'premium', 'elite'], default: 'basic' },
    assignedTrainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', default: null },

    qrCode: { type: String, unique: true, sparse: true },

    notificationPreferences: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true }
    },

    joinDate: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'frozen'],
        default: 'active'
    },
    notes: String,
    paymentMethods: [{
        brand: { type: String, enum: ['visa', 'mastercard', 'amex', 'paypal'] },
        last4: String,
        expiryMonth: Number,
        expiryYear: Number,
        payhereCustomerToken: String, // Stored for automated charging
        isDefault: { type: Boolean, default: false }
    }]
}, {
    timestamps: true
});

// Indexes
memberSchema.index({ status: 1 });
memberSchema.index({ 'dietBudget.amount': 1 });

module.exports = mongoose.model('Member', memberSchema);
