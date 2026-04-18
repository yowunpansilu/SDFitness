const mongoose = require('mongoose');
const dotenv = require('dotenv');
const WorkoutTemplate = require('../models/WorkoutTemplate');
const { connectDB } = require('../config/db');

dotenv.config();

const templates = [
    {
        templateId: 'T-BEGINNER-FULL',
        name: 'Beginner Full Body',
        description: 'A balanced full-body workout for those new to the gym.',
        difficulty: 'beginner',
        category: 'full_body',
        duration: 45,
        exercises: [
            { exerciseId: 'E-GOBLET-SQUAT', name: 'Goblet Squats', sets: 3, reps: 12, restPeriod: 60, muscleGroups: ['Quads', 'Glutes'] },
            { exerciseId: 'E-DB-BENCH', name: 'Dumbbell Bench Press', sets: 3, reps: 10, restPeriod: 60, muscleGroups: ['Chest', 'Triceps'] },
            { exerciseId: 'E-LAT-PULLDOWN', name: 'Lat Pulldown', sets: 3, reps: 10, restPeriod: 60, muscleGroups: ['Back', 'Biceps'] },
            { exerciseId: 'E-DB-SHOULDER', name: 'Dumbbell Shoulder Press', sets: 3, reps: 10, restPeriod: 60, muscleGroups: ['Shoulders'] },
            { exerciseId: 'E-PLANK', name: 'Forearm Plank', sets: 3, duration: 45, restPeriod: 45, muscleGroups: ['Core'] }
        ],
        estimatedCaloriesBurned: 250
    },
    {
        templateId: 'T-HIIT-BURN',
        name: 'Metabolic HIIT Burn',
        description: 'High-intensity interval training to maximize calorie burn and endurance.',
        difficulty: 'intermediate',
        category: 'hiit',
        duration: 30,
        exercises: [
            { exerciseId: 'E-BURPEES', name: 'Burpees', sets: 4, duration: 40, restPeriod: 20, muscleGroups: ['Full Body', 'Cardio'] },
            { exerciseId: 'E-KB-SWINGS', name: 'Kettlebell Swings', sets: 4, reps: 20, restPeriod: 20, muscleGroups: ['Glutes', 'Hamstrings'] },
            { exerciseId: 'E-MOUNT-CLIMB', name: 'Mountain Climbers', sets: 4, duration: 40, restPeriod: 20, muscleGroups: ['Core', 'Cardio'] },
            { exerciseId: 'E-JUMP-SQUAT', name: 'Jump Squats', sets: 4, reps: 15, restPeriod: 20, muscleGroups: ['Legs', 'Cardio'] }
        ],
        estimatedCaloriesBurned: 400
    },
    {
        templateId: 'T-UPPER-STRENGTH',
        name: 'Upper Body Strength',
        description: 'Focus on building power and mass in the upper body.',
        difficulty: 'advanced',
        category: 'upper_body',
        duration: 60,
        exercises: [
            { exerciseId: 'E-BB-BENCH', name: 'Barbell Bench Press', sets: 4, reps: 6, restPeriod: 120, muscleGroups: ['Chest'] },
            { exerciseId: 'E-BB-ROW', name: 'Barbell Rows', sets: 4, reps: 8, restPeriod: 90, muscleGroups: ['Back'] },
            { exerciseId: 'E-OHP', name: 'Overhead Press', sets: 3, reps: 8, restPeriod: 90, muscleGroups: ['Shoulders'] },
            { exerciseId: 'E-PULLUPS', name: 'Weighted Pullups', sets: 3, reps: 8, restPeriod: 90, muscleGroups: ['Back', 'Biceps'] },
            { exerciseId: 'E-DIPS', name: 'Weighted Dips', sets: 3, reps: 10, restPeriod: 60, muscleGroups: ['Chest', 'Triceps'] }
        ],
        estimatedCaloriesBurned: 350
    }
];

const seedWorkouts = async () => {
    try {
        await connectDB();
        
        console.log('🗑️  Cleaning existing templates...');
        await WorkoutTemplate.deleteMany();
        
        console.log('🌱 Seeding workout templates...');
        await WorkoutTemplate.insertMany(templates);
        
        console.log('✅ Seeding completed successfully!');
        process.exit();
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedWorkouts();
