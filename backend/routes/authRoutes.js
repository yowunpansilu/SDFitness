const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Member = require('../models/Member');
const { protect } = require('../middleware/auth');

// ── Helper: sign JWT ─────────────────────────────────────────────
const signToken = (userId) =>
    jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

// ─────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Creates a User + a linked Member profile in one request.
// ─────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const {
            email, password,
            firstName, lastName,
            dateOfBirth, gender,
            height = 170,
            weight = 70,
            goal = 'general_fitness',
            budget = 7000,
            role = 'member'
        } = req.body;

        // Validate required fields
        if (!email || !password || !firstName || !lastName || !dateOfBirth || !gender) {
            return res.status(400).json({
                success: false,
                error: 'email, password, firstName, lastName, dateOfBirth and gender are required'
            });
        }

        // Check for duplicate email
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({
                success: false,
                error: 'An account with this email already exists'
            });
        }

        // 1. Role Authorization Check
        if (role === 'admin' || role === 'trainer') {
            const auth = req.headers.authorization;
            if (!auth || !auth.startsWith('Bearer ')) {
                return res.status(401).json({ success: false, error: `Not authorised to create ${role} accounts` });
            }
            try {
                const token = auth.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const requestingUser = await User.findById(decoded.id);
                if (!requestingUser || requestingUser.role !== 'admin') {
                    return res.status(403).json({ success: false, error: 'Access denied: only admins can create admin/trainer accounts' });
                }
            } catch (err) {
                return res.status(401).json({ success: false, error: 'Invalid token when verifying permissions' });
            }
        }

        // 2. Create User (password hashed by pre-save hook)
        const user = await User.create({ email, password, firstName, lastName, role });

        // 3. Conditionally Create linked Member profile
        let memberNumber = null;
        if (role === 'member') {
            const memberCount = await Member.countDocuments();
            memberNumber = `MBR${String(memberCount + 1).padStart(4, '0')}`;

            const member = await Member.create({
                userId: user._id,
                memberNumber,
                dateOfBirth: new Date(dateOfBirth),
                gender,
                height: { value: height, unit: 'cm' },
                currentWeight: { value: weight, unit: 'kg' },
                fitnessGoals: [goal],
                dietBudget: { amount: budget, currency: 'LKR', period: 'weekly' },
                activityLevel: 'moderately_active',
                status: 'active'
            });

            user.memberId = member._id;
            await user.save();
        }

        // 4. Sign and return JWT
        const token = signToken(user._id);

        console.log(`✅ Registered: ${email} (${role}${memberNumber ? ' - ' + memberNumber : ''})`);

        res.status(201).json({
            success: true,
            token,
            user: user.toSafeObject()
        });

    } catch (error) {
        console.error('❌ Register error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Fetch user WITH password (select: false by default)
        const user = await User.findOne({ email }).select('+password');
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        const token = signToken(user._id);

        console.log(`✅ Logged in: ${email}`);

        res.json({
            success: true,
            token,
            user: user.toSafeObject()
        });

    } catch (error) {
        console.error('❌ Login error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/auth/me  (protected)
// ─────────────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
    try {
        // req.user is already attached by protect middleware
        const user = req.user;

        // Optionally fetch their full member profile
        let memberProfile = null;
        if (user.memberId) {
            memberProfile = await Member.findById(user.memberId).select(
                'memberNumber dateOfBirth gender height currentWeight fitnessGoals activityLevel dietBudget status joinDate'
            );
        }

        res.json({
            success: true,
            user: user.toSafeObject(),
            memberProfile
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// JWT is stateless — instruct client to drop the token.
// ─────────────────────────────────────────────────────────────────
router.post('/logout', protect, (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully — please discard your token'
    });
});

module.exports = router;
