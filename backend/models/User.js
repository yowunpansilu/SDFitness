const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false  // never returned in queries by default
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: {
        type: String,
        enum: ['member', 'admin', 'trainer'],
        default: 'member'
    },
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        default: null
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null }
}, { timestamps: true });

// ── Hash password before saving ──────────────────────────────────
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});


// ── Instance method: compare password ───────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: safe user object (no password) ─────────────
userSchema.methods.toSafeObject = function () {
    return {
        id: this._id,
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName,
        role: this.role,
        memberId: this.memberId,
        isActive: this.isActive,
        lastLogin: this.lastLogin,
        createdAt: this.createdAt
    };
};

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
