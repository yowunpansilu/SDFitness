const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, connectFoodDB } = require('./config/db');
const path = require('path');

// Load env vars
dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
    process.env.FRONT_END_URL || 'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3001'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        } else {
            console.warn(`⚠️ CORS blocked for origin: ${origin}`);
            return callback(new Error('Not allowed by CORS'), false);
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Serve static assets for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use('/api/workouts', require('./routes/workoutRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/weight', require('./routes/weightRoutes'));

// Background Tasks
require('./tasks/subscriptionCleanup');

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.message);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Make io accessible to our routes/controllers
app.set('io', io);

io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`📍 User ${socket.id} joined room ${room}`);
    });

    socket.on('leave_room', (room) => {
        socket.leave(room);
        console.log(`🏠 User ${socket.id} left room ${room}`);
    });

    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
    });
});

// Start
const PORT = process.env.PORT || 5000;

const start = async () => {
    try {
        console.log('🏁 Starting SDFitness Backend...');
        await connectDB();
        console.log('✅ Primary DB connection established.');

        await connectFoodDB();

        server.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 SDFitness Backend running on port ${PORT}`);
            console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

start();

module.exports = app;
