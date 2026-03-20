const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Member = require('../models/Member');

// Generic function to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};

router.post('/register', async (req, res) => {
    console.log('📥 STAGE 1: Register request received');
    try {
        console.log('Payload:', JSON.stringify(req.body, null, 2));
        const { step1Data, step2Data, step3Data } = req.body;

        if (!step1Data || !step1Data.email || !step1Data.password || !step1Data.firstName || !step1Data.lastName) {
            return res.status(400).json({ success: false, message: 'Basic Information (Step 1) is incomplete!' });
        }

        if (!step2Data || !step2Data.dateOfBirth || !step2Data.gender) {
            return res.status(400).json({ success: false, message: 'Health Metrics (Step 2) is missing required fields like Date of Birth or Gender!' });
        }

        // 1. Check if user already exists
        const userExists = await User.findOne({ email: step1Data.email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'A user with this email already exists!' });
        }

        // 2. Create the User (Auth record)
        console.log('Creating user...');
        const user = await User.create({
            firstName: step1Data.firstName,
            lastName: step1Data.lastName,
            email: step1Data.email,
            password: step1Data.password,
            phone: step1Data.phone
        });
        console.log('User created:', user._id);

        // 3. Create the Member detailing their physical data & plan
        console.log('Creating member with data:', JSON.stringify({
            userId: user._id,
            dateOfBirth: step2Data.dateOfBirth,
            gender: step2Data.gender,
            height: step2Data.height,
            weight: step2Data.weight
        }, null, 2));

        const member = await Member.create({
            userId: user._id,
            memberNumber: 'MBR-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            dateOfBirth: step2Data.dateOfBirth,
            gender: step2Data.gender.toLowerCase(),
            height: {
                value: step2Data.heightUnit === 'ft' ? (parseFloat(step2Data.height) * 30.48) : parseFloat(step2Data.height),
                unit: 'cm' // Standardize to cm to pass Mongoose minimum 50 requirement
            },
            currentWeight: {
                value: parseFloat(step2Data.weight),
                unit: step2Data.weightUnit
            },
            fitnessGoals: step3Data.fitnessGoals.map(g => {
                let formatted = g.toLowerCase().replace(' ', '_');
                if (formatted === 'sports_performance') return 'athletic_performance';
                return formatted;
            }),
            activityLevel: step3Data.activityLevel === 'sedentary' ? 'sedentary' :
                           step3Data.activityLevel === 'light' ? 'lightly_active' :
                           step3Data.activityLevel === 'moderate' ? 'moderately_active' :
                           step3Data.activityLevel === 'active' ? 'very_active' : 'extremely_active',
            dietaryPreferences: step3Data.dietaryPreferences.map(p => {
                let pref = p.toLowerCase().replace('-', '_');
                if (pref === 'gluten_free') return 'gluten_free';
                if (pref === 'dairy_free') return 'dairy_free';
                return pref;
            })
        });
        console.log('Member created successfully');

        res.status(201).json({
            success: true,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            },
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during registration',
            error: error.message 
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        
        if (user && (await user.matchPassword(password))) {
            res.json({
                success: true,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role
                },
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});

module.exports = router;
