const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'SDFitness Backend',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/prices', require('./routes/priceRoutes'));
app.use('/api/diet-plans', require('./routes/dietPlanRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/workouts', require('./routes/workoutRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.message);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});

// Start
const PORT = process.env.PORT || 5000;

const start = async () => {
    await connectDB();
    // Bind explicitly to IPv4 so Docker port mappings work reliably.
    // (Some environments bind Node to IPv6-only when host is omitted.)
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 SDFitness Backend running on port ${PORT}`);
    });
};

start();

module.exports = app;
