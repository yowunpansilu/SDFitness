const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    checkInTime: { type: Date, default: Date.now },
    checkOutTime: Date,
    facility: String
}, { timestamps: true });

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);
