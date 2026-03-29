const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, connectFoodDB } = require('./config/db');

// Load env vars
dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
    process.env.FRONT_END_URL || 'http://localhost:5173',
    'http://localhost:3001'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not ' +
                        'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
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
app.use('/api/diet-plan', require('./routes/dietPlanRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/member', require('./routes/memberRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/classes', require('./routes/classRoutes'));
app.use('/api/class', require('./routes/classRoutes'));
app.use('/api/communication', require('./routes/communicationRoutes'));
app.use('/api/equipment', require('./routes/equipmentRoutes'));
app.use('/api/membership', require('./routes/membershipRoutes'));
app.use('/api/scrapers', require('./routes/scraperRoutes'));
app.use('/api/scraper', require('./routes/scraperRoutes'));
app.use('/api/trainers', require('./routes/trainerRoutes'));
app.use('/api/trainer', require('./routes/trainerRoutes'));

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
    await connectFoodDB();
    // Bind explicitly to IPv4 so Docker port mappings work reliably.
    // (Some environments bind Node to IPv6-only when host is omitted.)
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 SDFitness Backend running on port ${PORT}`);
    });
};

start();

module.exports = app;
