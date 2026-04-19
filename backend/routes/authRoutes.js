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
    console.log('📥 [REGISTER] Received request');
    try {
        console.log('📥 [REGISTER] Payload:', JSON.stringify(req.body, null, 2));
        const { step1Data, step2Data, step3Data } = req.body;

        if (!step1Data || !step1Data.email || !step1Data.password || !step1Data.firstName || !step1Data.lastName) {
            console.log('❌ [REGISTER] Step 1 data incomplete');
            return res.status(400).json({ success: false, message: 'Basic Information (Step 1) is incomplete!' });
        }

        if (step1Data.password !== step1Data.confirmPassword) {
            console.log('❌ [REGISTER] Passwords do not match');
            return res.status(400).json({ success: false, message: 'Passwords do not match!' });
        }

        if (step1Data.password.length < 6) {
            console.log('❌ [REGISTER] Password too short');
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long!' });
        }

        if (!step2Data || !step2Data.dateOfBirth || !step2Data.gender) {
            console.log('❌ [REGISTER] Step 2 data incomplete');
            return res.status(400).json({ success: false, message: 'Health Metrics (Step 2) is missing required fields like Date of Birth or Gender!' });
        }

        // 1. Check if user already exists
        const userExists = await User.findOne({ email: step1Data.email.toLowerCase() });
        if (userExists) {
            console.log('❌ [REGISTER] User already exists:', step1Data.email);
            return res.status(400).json({ success: false, message: 'A user with this email already exists!' });
        }

        // 2. Create the User (Auth record)
        console.log('⏳ [REGISTER] Creating User...');
        const user = await User.create({
            firstName: step1Data.firstName,
            lastName: step1Data.lastName,
            email: step1Data.email.toLowerCase(),
            password: step1Data.password,
            phone: step1Data.phone
        });
        console.log('✅ [REGISTER] User created with ID:', user._id);

        // 3. Create the Member detailing their physical data & plan
        console.log('⏳ [REGISTER] Creating Member profile...');
        
        let member;
        try {
            const memberData = {
                userId: user._id,
                memberNumber: 'MBR-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                dateOfBirth: step2Data.dateOfBirth,
                gender: step2Data.gender.toLowerCase(),
                height: {
                    value: step2Data.heightUnit === 'ft' ? (parseFloat(step2Data.height) * 30.48) : parseFloat(step2Data.height),
                    unit: 'cm' 
                },
                currentWeight: {
                    value: parseFloat(step2Data.weight),
                    unit: step2Data.weightUnit
                },
                fitnessGoals: (step3Data.fitnessGoals || []).map(g => {
                    let formatted = g.toLowerCase().replace(' ', '_');
                    if (formatted === 'sports_performance') return 'athletic_performance';
                    return formatted;
                }),
                activityLevel: step3Data.activityLevel ? step3Data.activityLevel.toLowerCase().replace('-', '_') : 'moderate',
                dietaryPreferences: (step3Data.dietaryPreferences || []).map(p => {
                    let pref = p.toLowerCase().replace('-', '_');
                    if (pref === 'gluten_free') return 'gluten_free';
                    if (pref === 'dairy_free') return 'dairy_free';
                    return pref;
                })
            };
            
            console.log('⏳ [REGISTER] Member Data for Mongoose:', JSON.stringify(memberData, null, 2));
            member = await Member.create(memberData);
            console.log('✅ [REGISTER] Member profile created successfully');
        } catch (memberErr) {
            // Roll back user creation if member profile fails
            console.error('❌ [REGISTER] Member creation failed, rolling back User:', memberErr.message);
            await User.findByIdAndDelete(user._id);
            return res.status(400).json({ success: false, message: 'Invalid profile details.', error: memberErr.message });
        }

        console.log('✅ [REGISTER] Success! Sending response.');
        res.status(201).json({
            success: true,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar
            },
            token: generateToken(user._id),
            member: member
        });
    } catch (error) {
        console.error('💥 [REGISTER] Fatal Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during registration',
            error: error.message 
        });
    }
});

const Admin = require('../models/Admin');

router.post('/login', async (req, res) => {
    console.log('📥 [LOGIN] Received request');
    try {
        const { email, password } = req.body;
        console.log('📥 [LOGIN] Email:', email);
        
        const trimmedEmail = email ? email.trim().toLowerCase() : '';

        // Check Admin collection first
        console.log('⏳ [LOGIN] Checking Admin collection...');
        let user = await Admin.findOne({ email: trimmedEmail });
        let isAdmin = !!user;

        if (!user) {
            console.log('⏳ [LOGIN] Not an admin, checking User collection...');
            user = await User.findOne({ email: trimmedEmail });
        }
        
        if (!user) {
            console.log('❌ [LOGIN] User not found:', trimmedEmail);
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        console.log('⏳ [LOGIN] User found, matching password...');
        const isMatch = await user.matchPassword(password);
        
        if (isMatch) {
            console.log('✅ [LOGIN] Password matches');
            let member = null;
            if (!isAdmin) {
                console.log('⏳ [LOGIN] Fetching member profile for user:', user._id);
                member = await Member.findOne({ userId: user._id });
                if (!member) {
                    console.log('⚠️ [LOGIN] Member profile not found! Auto-creating default...');
                    try {
                        member = await Member.create({
                            userId: user._id,
                            memberNumber: 'MBR-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                            dateOfBirth: new Date('2000-01-01'),
                            gender: 'prefer_not_to_say',
                            height: { value: 170, unit: 'cm' },
                            currentWeight: { value: 70, unit: 'kg' },
                            fitnessGoals: ['general_fitness'],
                            activityLevel: 'moderate',
                        });
                        console.log('✅ [LOGIN] Default member profile created');
                    } catch (memberErr) {
                        console.error('❌ [LOGIN] Failed to auto-create member profile:', memberErr.message);
                        // We still allow login even if member profile creation fails
                    }
                }
            }
            
            console.log('✅ [LOGIN] Success! Sending response.');
            res.json({
                success: true,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone || '',
                    role: user.role,
                    avatar: user.avatar
                },
                member: member,
                token: generateToken(user._id)
            });
        } else {
            console.log('❌ [LOGIN] Password mismatch for user:', trimmedEmail);
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('💥 [LOGIN] Fatal Error:', error);
        res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
    }
});
// @desc    Get user profile & member data
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', async (req, res) => {
    try {
        // Simple token check (ideally use a protect middleware, but implementing inline for now)
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Not authorized' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Fetching profile for userId:', decoded.id);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) return res.status(404).json({ message: 'User not found' });

        let member = await Member.findOne({ userId: decoded.id });
        if (!member) {
            console.log('Member profile not found for user. Auto-creating a default profile.');
            member = await Member.create({
                userId: user._id,
                memberNumber: 'MBR-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                dateOfBirth: new Date('2000-01-01'),
                gender: 'prefer_not_to_say',
                height: { value: 170, unit: 'cm' },
                currentWeight: { value: 70, unit: 'kg' },
                fitnessGoals: ['general_fitness'],
                activityLevel: 'moderate',
            });
        }

        console.log('Profile found - User:', !!user, 'Member:', !!member);
        if (member) console.log('Member heights/weights:', member.height?.value, member.currentWeight?.value);

        res.json({
            success: true,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar
            },
            member: member
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching profile' });
    }
});

// @desc    Update user profile & member data
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Not authorized' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { firstName, lastName, phone, avatar, memberData } = req.body;

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update User fields
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phone = phone;
        if (avatar) user.avatar = avatar;
        await user.save();

        let member = await Member.findOne({ userId: decoded.id });
        if (member && memberData) {
            // Update individual fields if provided
            if (memberData.height) {
                member.height = {
                    value: memberData.height.value || member.height.value,
                    unit: memberData.height.unit || member.height.unit
                };
            }
            if (memberData.currentWeight) {
                member.currentWeight = {
                    value: memberData.currentWeight.value || member.currentWeight.value,
                    unit: memberData.currentWeight.unit || member.currentWeight.unit
                };
            }
            if (memberData.fitnessGoals) member.fitnessGoals = memberData.fitnessGoals;
            if (memberData.activityLevel) member.activityLevel = memberData.activityLevel;
            if (memberData.dietaryPreferences) member.dietaryPreferences = memberData.dietaryPreferences;
            if (memberData.dateOfBirth) member.dateOfBirth = memberData.dateOfBirth;
            if (memberData.gender) member.gender = memberData.gender;
            if (memberData.bodyFatPercentage) member.bodyFatPercentage = memberData.bodyFatPercentage;
            
            await member.save();
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar
            },
            member: member
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, message: 'Server error updating profile' });
    }
});

// @desc    Delete user account & profile data
// @route   DELETE /api/auth/profile
// @access  Private
router.delete('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Not authorized' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 1. Delete associated Member data
        await Member.findOneAndDelete({ userId: decoded.id });

        // 2. Delete the User record
        const user = await User.findByIdAndDelete(decoded.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Account and associated data deleted successfully'
        });
    } catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({ success: false, message: 'Server error during account deletion' });
    }
});

module.exports = router;
