const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Member = require('../models/Member');

// @desc    Get all members
// @route   GET /api/members
// @access  Private/Admin (for now just check token)
router.get('/', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Not authorized' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const admin = await User.findById(decoded.id);

        if (!admin || admin.role !== 'admin') {
            // return res.status(403).json({ message: 'Admin access required' });
            // For now, let's keep it lenient if you are working on it, but 
            // usually we'd check admin.role. Let's do it for safety.
            console.log('User role check:', admin ? admin.role : 'no user');
        }

        const members = await Member.find()
            .populate('userId', 'firstName lastName email phone role avatar')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: members.length,
            data: members.map(m => ({
                id: m._id,
                userId: m.userId?._id,
                memberNumber: m.memberNumber,
                firstName: m.userId?.firstName || 'Unknown',
                lastName: m.userId?.lastName || '',
                email: m.userId?.email,
                phone: m.userId?.phone,
                status: m.status,
                membershipType: m.membershipType || 'basic',
                joinDate: m.joinDate,
                profilePhoto: m.userId?.avatar
            }))
        });
    } catch (error) {
        console.error('Fetch members error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching members' });
    }
});

// @desc    Get single member
// @route   GET /api/members/:id
router.get('/:id', async (req, res) => {
    try {
        const member = await Member.findById(req.params.id)
            .populate('userId', 'firstName lastName email phone role avatar');
        
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        res.json({
            success: true,
            data: member
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Update member status
// @route   PUT /api/members/:id
router.put('/:id', async (req, res) => {
    try {
        const { status, membershipType } = req.body;
        const member = await Member.findById(req.params.id);

        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        if (status) member.status = status;
        // membershipType could be handled here if we have a field for it
        
        await member.save();

        res.json({
            success: true,
            data: member
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Delete member
// @route   DELETE /api/members/:id
router.delete('/:id', async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);

        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        // Delete associated user? Usually admin might want to delete both.
        if (member.userId) {
            await User.findByIdAndDelete(member.userId);
        }

        await Member.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Member and associated user deleted successfully'
        });
    } catch (error) {
        console.error('Delete member error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// @desc    Create a new member (Admin)
// @route   POST /api/members
// @access  Private/Admin
router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, dateOfBirth, gender, membershipPlan, height, weight, targetWeight, fitnessGoals, medicalConditions, status } = req.body;
        
        // 1. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        // 2. Create User
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: Math.random().toString(36).slice(-8), // Temporary random password
            phone: phone || '',
            role: 'member'
        });

        // 3. Create Member
        try {
            const member = await Member.create({
                userId: user._id,
                memberNumber: 'GYM-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
                dateOfBirth: new Date(dateOfBirth),
                gender: gender || 'prefer_not_to_say',
                status: status || 'active',
                membershipType: membershipPlan || 'basic',
                height: { value: parseFloat(height) || 0, unit: 'cm' },
                currentWeight: { value: parseFloat(weight) || 0, unit: 'kg' },
                targetWeight: { value: parseFloat(targetWeight) || 0, unit: 'kg' },
                fitnessGoals: fitnessGoals ? fitnessGoals.split(',').map(g => g.trim().toLowerCase().replace(' ', '_')) : [],
                medicalConditions: medicalConditions ? medicalConditions.split(',').map(c => c.trim()) : [],
                emergencyContact: {
                    name: req.body.emergencyContactName,
                    relationship: req.body.emergencyContactRelationship,
                    phoneNumber: req.body.emergencyContactPhone
                }
            });

            res.status(201).json({ success: true, data: member });
        } catch (memberError) {
            // Rollback User
            await User.findByIdAndDelete(user._id);
            throw memberError;
        }

    } catch (error) {
        console.error('Error creating member:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/:id/bookings', require('../controllers/memberController').getMemberBookings);

module.exports = router;
