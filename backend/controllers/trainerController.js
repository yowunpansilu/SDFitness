const Trainer = require('../models/Trainer');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET all trainers
exports.getAllTrainers = async (req, res) => {
    try {
        const trainers = await Trainer.find()
            .populate('userId', 'email firstName lastName')
            .sort({ createdAt: -1 });
        res.json(trainers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET trainer by id
exports.getTrainerById = async (req, res) => {
    try {
        const trainer = await Trainer.findById(req.params.id)
            .populate('userId', 'email firstName lastName');
        if (!trainer) return res.status(404).json({ error: 'Trainer not found' });
        res.json(trainer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST create trainer (creates User + Trainer)
exports.createTrainer = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, bio, experienceYears, specializations, hourlyRate, certifications, employmentStatus, commissionRate, availableHoursPerWeek, emergencyContact, joinDate } = req.body;

        // Check if user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'A user with this email already exists' });
        }

        // Create User account for the trainer
        const hashedPassword = await bcrypt.hash('trainer123', 10);
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone: phone || '0000000000', // Ensure required phone is provided
            role: 'trainer',
        });

        // Create Trainer profile linked to user
        const trainer = await Trainer.create({
            userId: user._id,
            specializations: specializations || [],
            experienceYears: experienceYears || 0,
            bio: bio || '',
            hourlyRate: hourlyRate || 0,
            certifications: certifications || [],
            employmentStatus: employmentStatus || 'full-time',
            commissionRate: commissionRate || 0,
            availableHoursPerWeek: availableHoursPerWeek || 40,
            emergencyContact: emergencyContact || { name: '', relationship: '', phone: '' },
            joinDate: joinDate || Date.now(),
        });

        const populatedTrainer = await Trainer.findById(trainer._id)
            .populate('userId', 'email firstName lastName');

        res.status(201).json(populatedTrainer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// PUT update trainer
exports.updateTrainer = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, bio, experienceYears, specializations, hourlyRate, certifications, employmentStatus, commissionRate, availableHoursPerWeek, emergencyContact, joinDate } = req.body;

        const trainer = await Trainer.findById(req.params.id);
        if (!trainer) return res.status(404).json({ error: 'Trainer not found' });

        // Update User fields if provided
        if (trainer.userId) {
            const userUpdate = {};
            if (firstName) userUpdate.firstName = firstName;
            if (lastName) userUpdate.lastName = lastName;
            if (email) userUpdate.email = email;
            if (phone) userUpdate.phone = phone;
            if (Object.keys(userUpdate).length > 0) {
                await User.findByIdAndUpdate(trainer.userId, userUpdate);
            }
        }

        // Update Trainer fields
        const trainerUpdate = {};
        if (specializations) trainerUpdate.specializations = specializations;
        if (experienceYears !== undefined) trainerUpdate.experienceYears = experienceYears;
        if (bio !== undefined) trainerUpdate.bio = bio;
        if (hourlyRate !== undefined) trainerUpdate.hourlyRate = hourlyRate;
        if (certifications) trainerUpdate.certifications = certifications;
        if (employmentStatus) trainerUpdate.employmentStatus = employmentStatus;
        if (commissionRate !== undefined) trainerUpdate.commissionRate = commissionRate;
        if (availableHoursPerWeek !== undefined) trainerUpdate.availableHoursPerWeek = availableHoursPerWeek;
        if (emergencyContact) trainerUpdate.emergencyContact = emergencyContact;
        if (joinDate) trainerUpdate.joinDate = joinDate;

        const updatedTrainer = await Trainer.findByIdAndUpdate(req.params.id, trainerUpdate, { new: true, runValidators: true })
            .populate('userId', 'email firstName lastName');

        res.json(updatedTrainer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// DELETE trainer
exports.deleteTrainer = async (req, res) => {
    try {
        const trainer = await Trainer.findById(req.params.id);
        if (!trainer) return res.status(404).json({ error: 'Trainer not found' });

        // Also delete the associated User account
        if (trainer.userId) {
            await User.findByIdAndDelete(trainer.userId);
        }

        await Trainer.findByIdAndDelete(req.params.id);
        res.json({ message: 'Trainer deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
