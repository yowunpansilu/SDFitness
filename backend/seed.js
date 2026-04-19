const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

// Models
const User = require('./models/User');
const Member = require('./models/Member');
const Trainer = require('./models/Trainer');
const MembershipPlan = require('./models/MembershipPlan');
const Subscription = require('./models/Subscription');
const Class = require('./models/Class');
const Equipment = require('./models/Equipment');
const Booking = require('./models/Booking');
const AttendanceRecord = require('./models/AttendanceRecord');
const Notification = require('./models/Notification');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const FoodPrice = require('./models/FoodPrice');

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');

    // Clear existing data
    await Promise.all([
        User.deleteMany({}),
        Member.deleteMany({}),
        Trainer.deleteMany({}),
        MembershipPlan.deleteMany({}),
        Subscription.deleteMany({}),
        Class.deleteMany({}),
        Equipment.deleteMany({}),
        Booking.deleteMany({}),
        AttendanceRecord.deleteMany({}),
        Notification.deleteMany({}),
        Conversation.deleteMany({}),
        Message.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // ─── 1. Users ─────────────────────────────────────────────────
    const admin = await User.create({
        email: 'admin@sdfitness.com', password: 'admin123',
        firstName: 'Super', lastName: 'Admin', role: 'admin',
        phone: '+94771234567'
    });

    const trainerUsers = await User.create([
        { email: 'kamal@sdfitness.com', password: 'trainer123', firstName: 'Kamal', lastName: 'Perera', role: 'trainer', phone: '+94712345678' },
        { email: 'nimal@sdfitness.com', password: 'trainer123', firstName: 'Nimal', lastName: 'Fernando', role: 'trainer', phone: '+94723456789' },
        { email: 'sachini@sdfitness.com', password: 'trainer123', firstName: 'Sachini', lastName: 'Silva', role: 'trainer', phone: '+94734567890' },
        { email: 'ruwan@sdfitness.com', password: 'trainer123', firstName: 'Ruwan', lastName: 'Jayawardena', role: 'trainer', phone: '+94745678901' },
        { email: 'dilini@sdfitness.com', password: 'trainer123', firstName: 'Dilini', lastName: 'Wickramasinghe', role: 'trainer', phone: '+94756789012' }
    ]);

    const memberUsers = await User.create([
        { email: 'saman@gmail.com', password: 'member123', firstName: 'Saman', lastName: 'Kumara', role: 'member', phone: '+94701122334' },
        { email: 'chathura@gmail.com', password: 'member123', firstName: 'Chathura', lastName: 'Bandara', role: 'member', phone: '+94702233445' },
        { email: 'nimasha@gmail.com', password: 'member123', firstName: 'Nimasha', lastName: 'De Silva', role: 'member', phone: '+94703344556' },
        { email: 'tharushi@gmail.com', password: 'member123', firstName: 'Tharushi', lastName: 'Rajapaksa', role: 'member', phone: '+94704455667' },
        { email: 'ashan@gmail.com', password: 'member123', firstName: 'Ashan', lastName: 'Gunawardena', role: 'member', phone: '+94705566778' },
        { email: 'kavindi@gmail.com', password: 'member123', firstName: 'Kavindi', lastName: 'Herath', role: 'member', phone: '+94706677889' },
        { email: 'nuwan@gmail.com', password: 'member123', firstName: 'Nuwan', lastName: 'Dissanayake', role: 'member', phone: '+94707788990' },
        { email: 'hashini@gmail.com', password: 'member123', firstName: 'Hashini', lastName: 'Wijesinghe', role: 'member', phone: '+94708899001' },
        { email: 'dinesh@gmail.com', password: 'member123', firstName: 'Dinesh', lastName: 'Rathnayake', role: 'member', phone: '+94709900112' },
        { email: 'sanduni@gmail.com', password: 'member123', firstName: 'Sanduni', lastName: 'Jayasundara', role: 'member', phone: '+94700011223' }
    ]);
    console.log(`✅ Created ${1 + trainerUsers.length + memberUsers.length} users`);

    // ─── 2. Trainers ──────────────────────────────────────────────
    const trainers = await Trainer.create([
        {
            userId: trainerUsers[0]._id,
            specializations: ['Weight Training', 'Bodybuilding'],
            experienceYears: 8,
            bio: 'Certified personal trainer with 8 years of experience in weight training and bodybuilding.',
            availability: [
                { day: 'Monday', startTime: '06:00', endTime: '14:00' },
                { day: 'Wednesday', startTime: '06:00', endTime: '14:00' },
                { day: 'Friday', startTime: '06:00', endTime: '14:00' }
            ]
        },
        {
            userId: trainerUsers[1]._id,
            specializations: ['Yoga', 'Pilates', 'Flexibility'],
            experienceYears: 5,
            bio: 'Experienced yoga and pilates instructor specializing in flexibility and mindfulness.',
            availability: [
                { day: 'Tuesday', startTime: '07:00', endTime: '15:00' },
                { day: 'Thursday', startTime: '07:00', endTime: '15:00' },
                { day: 'Saturday', startTime: '08:00', endTime: '12:00' }
            ]
        },
        {
            userId: trainerUsers[2]._id,
            specializations: ['HIIT', 'Cardio', 'CrossFit'],
            experienceYears: 6,
            bio: 'High-intensity interval training specialist and CrossFit certified coach.',
            availability: [
                { day: 'Monday', startTime: '14:00', endTime: '22:00' },
                { day: 'Wednesday', startTime: '14:00', endTime: '22:00' },
                { day: 'Friday', startTime: '14:00', endTime: '22:00' }
            ]
        },
        {
            userId: trainerUsers[3]._id,
            specializations: ['Swimming', 'Aqua Aerobics'],
            experienceYears: 10,
            bio: 'Former national swimmer turned aqua fitness instructor with 10 years of coaching.',
            availability: [
                { day: 'Monday', startTime: '08:00', endTime: '16:00' },
                { day: 'Tuesday', startTime: '08:00', endTime: '16:00' },
                { day: 'Thursday', startTime: '08:00', endTime: '16:00' }
            ]
        },
        {
            userId: trainerUsers[4]._id,
            specializations: ['Spinning', 'Endurance Training', 'Nutrition'],
            experienceYears: 4,
            bio: 'Certified spinning instructor and nutrition advisor for endurance athletes.',
            availability: [
                { day: 'Tuesday', startTime: '15:00', endTime: '21:00' },
                { day: 'Thursday', startTime: '15:00', endTime: '21:00' },
                { day: 'Saturday', startTime: '09:00', endTime: '14:00' }
            ]
        }
    ]);
    console.log(`✅ Created ${trainers.length} trainers`);

    // ─── 3. Membership Plans ──────────────────────────────────────
    const plans = await MembershipPlan.create([
        {
            name: 'Monthly Basic',
            price: 3500,
            duration: 1,
            durationType: 'months',
            description: 'One month basic membership with workout and trainer',
            features: ['Gym Floor Access', 'Locker Room', 'Free Parking', '1 Guest Pass/Month'],
            isActive: true
        },
        {
            name: 'Pro',
            price: 8500,
            duration: 1,
            durationType: 'months',
            features: ['All Basic Features', 'Unlimited Group Classes', 'Sauna & Steam Room', 'Access to All Locations', 'Quarterly PT Session'],
            isActive: true
        },
        {
            name: 'Elite',
            price: 15000,
            duration: 1,
            durationType: 'months',
            features: ['All Pro Features', 'Unlimited Personal Training', 'Nutritional Consultations', 'Massage Therapy (1/month)', 'Private Locker', 'Laundry Service'],
            isActive: true
        },
        {
            name: 'Student',
            price: 2500,
            duration: 1,
            durationType: 'months',
            features: ['Gym Floor Access', 'Locker Room', 'Group Classes (select)', 'Study Area'],
            isActive: true
        }
    ]);
    console.log(`✅ Created ${plans.length} membership plans`);

    // ─── 4. Members ───────────────────────────────────────────────
    const memberData = [
        { userId: memberUsers[0]._id, memberNumber: 'SD-001', dateOfBirth: new Date('1995-03-15'), gender: 'male', height: { value: 175, unit: 'cm' }, currentWeight: { value: 78, unit: 'kg' }, targetWeight: { value: 72, unit: 'kg' }, activityLevel: 'moderately_active', fitnessGoals: ['weight_loss', 'general_fitness'], dietaryPreferences: ['none'], status: 'active' },
        { userId: memberUsers[1]._id, memberNumber: 'SD-002', dateOfBirth: new Date('1992-07-22'), gender: 'male', height: { value: 180, unit: 'cm' }, currentWeight: { value: 85, unit: 'kg' }, targetWeight: { value: 80, unit: 'kg' }, activityLevel: 'very_active', fitnessGoals: ['muscle_gain', 'strength'], dietaryPreferences: ['none'], status: 'active' },
        { userId: memberUsers[2]._id, memberNumber: 'SD-003', dateOfBirth: new Date('1998-11-08'), gender: 'female', height: { value: 162, unit: 'cm' }, currentWeight: { value: 58, unit: 'kg' }, targetWeight: { value: 55, unit: 'kg' }, activityLevel: 'lightly_active', fitnessGoals: ['flexibility', 'general_fitness'], dietaryPreferences: ['vegetarian'], status: 'active' },
        { userId: memberUsers[3]._id, memberNumber: 'SD-004', dateOfBirth: new Date('2000-01-30'), gender: 'female', height: { value: 158, unit: 'cm' }, currentWeight: { value: 52, unit: 'kg' }, activityLevel: 'moderately_active', fitnessGoals: ['endurance', 'flexibility'], dietaryPreferences: ['none'], status: 'active' },
        { userId: memberUsers[4]._id, memberNumber: 'SD-005', dateOfBirth: new Date('1990-05-12'), gender: 'male', height: { value: 172, unit: 'cm' }, currentWeight: { value: 90, unit: 'kg' }, targetWeight: { value: 75, unit: 'kg' }, activityLevel: 'sedentary', fitnessGoals: ['weight_loss'], dietaryPreferences: ['none'], status: 'active' },
        { userId: memberUsers[5]._id, memberNumber: 'SD-006', dateOfBirth: new Date('1997-09-25'), gender: 'female', height: { value: 165, unit: 'cm' }, currentWeight: { value: 62, unit: 'kg' }, activityLevel: 'very_active', fitnessGoals: ['athletic_performance', 'strength'], dietaryPreferences: ['keto'], status: 'active' },
        { userId: memberUsers[6]._id, memberNumber: 'SD-007', dateOfBirth: new Date('1988-12-03'), gender: 'male', height: { value: 168, unit: 'cm' }, currentWeight: { value: 95, unit: 'kg' }, targetWeight: { value: 80, unit: 'kg' }, activityLevel: 'lightly_active', fitnessGoals: ['weight_loss', 'general_fitness'], dietaryPreferences: ['none'], status: 'active' },
        { userId: memberUsers[7]._id, memberNumber: 'SD-008', dateOfBirth: new Date('1999-04-18'), gender: 'female', height: { value: 170, unit: 'cm' }, currentWeight: { value: 65, unit: 'kg' }, activityLevel: 'moderately_active', fitnessGoals: ['muscle_gain', 'endurance'], dietaryPreferences: ['gluten_free'], status: 'active' },
        { userId: memberUsers[8]._id, memberNumber: 'SD-009', dateOfBirth: new Date('1993-08-07'), gender: 'male', height: { value: 178, unit: 'cm' }, currentWeight: { value: 82, unit: 'kg' }, activityLevel: 'very_active', fitnessGoals: ['strength', 'athletic_performance'], dietaryPreferences: ['none'], status: 'frozen' },
        { userId: memberUsers[9]._id, memberNumber: 'SD-010', dateOfBirth: new Date('2001-06-14'), gender: 'female', height: { value: 155, unit: 'cm' }, currentWeight: { value: 48, unit: 'kg' }, activityLevel: 'lightly_active', fitnessGoals: ['general_fitness'], dietaryPreferences: ['vegan'], status: 'inactive' }
    ];
    const members = await Member.create(memberData);
    for (const member of members) {
        await User.findByIdAndUpdate(member.userId, { memberId: member._id });
    }
    console.log(`✅ Created ${members.length} members`);

    // ─── 5. Subscriptions ─────────────────────────────────────────
    const now = new Date();
    const subscriptions = await Subscription.create([
        { user: memberUsers[0]._id, plan: plans[0]._id, startDate: new Date(now - 15 * 86400000), endDate: new Date(now.getTime() + 15 * 86400000), status: 'active' },
        { user: memberUsers[1]._id, plan: plans[2]._id, startDate: new Date(now - 10 * 86400000), endDate: new Date(now.getTime() + 20 * 86400000), status: 'active' },
        { user: memberUsers[2]._id, plan: plans[1]._id, startDate: new Date(now - 25 * 86400000), endDate: new Date(now.getTime() + 5 * 86400000), status: 'active' },
        { user: memberUsers[3]._id, plan: plans[1]._id, startDate: new Date(now - 5 * 86400000), endDate: new Date(now.getTime() + 25 * 86400000), status: 'active' },
        { user: memberUsers[4]._id, plan: plans[0]._id, startDate: new Date(now - 20 * 86400000), endDate: new Date(now.getTime() + 10 * 86400000), status: 'active' },
        { user: memberUsers[5]._id, plan: plans[2]._id, startDate: new Date(now - 8 * 86400000), endDate: new Date(now.getTime() + 22 * 86400000), status: 'active' },
        { user: memberUsers[6]._id, plan: plans[0]._id, startDate: new Date(now - 28 * 86400000), endDate: new Date(now.getTime() + 2 * 86400000), status: 'active' },
        { user: memberUsers[7]._id, plan: plans[3]._id, startDate: new Date(now - 12 * 86400000), endDate: new Date(now.getTime() + 18 * 86400000), status: 'active' },
        { user: memberUsers[8]._id, plan: plans[1]._id, startDate: new Date(now - 40 * 86400000), endDate: new Date(now - 10 * 86400000), status: 'expired' },
        { user: memberUsers[9]._id, plan: plans[0]._id, startDate: new Date(now - 60 * 86400000), endDate: new Date(now - 30 * 86400000), status: 'cancelled' }
    ]);
    console.log(`✅ Created ${subscriptions.length} subscriptions`);

    // ─── 6. Classes ───────────────────────────────────────────────
    const classes = await Class.create([
        { name: 'Morning Yoga', description: 'Start your day with relaxing yoga poses and breathing exercises.', trainer: trainers[1]._id, schedule: { dayOfWeek: 'Tuesday', startTime: '07:00', endTime: '08:00' }, capacity: 25, enrolled: 18 },
        { name: 'HIIT Blast', description: 'High-intensity interval training to burn calories and build endurance.', trainer: trainers[2]._id, schedule: { dayOfWeek: 'Monday', startTime: '17:00', endTime: '18:00' }, capacity: 20, enrolled: 15 },
        { name: 'Spin Class', description: 'Indoor cycling session for cardio and leg strength.', trainer: trainers[4]._id, schedule: { dayOfWeek: 'Tuesday', startTime: '18:00', endTime: '19:00' }, capacity: 30, enrolled: 22 },
        { name: 'Strength Training 101', description: 'Learn proper form and technique for weight training.', trainer: trainers[0]._id, schedule: { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '10:30' }, capacity: 15, enrolled: 12 },
        { name: 'CrossFit WOD', description: 'Workout of the day — varied functional movements at high intensity.', trainer: trainers[2]._id, schedule: { dayOfWeek: 'Friday', startTime: '16:00', endTime: '17:00' }, capacity: 18, enrolled: 14 },
        { name: 'Aqua Aerobics', description: 'Low-impact water exercises for all fitness levels.', trainer: trainers[3]._id, schedule: { dayOfWeek: 'Thursday', startTime: '10:00', endTime: '11:00' }, capacity: 20, enrolled: 9 },
        { name: 'Pilates Core', description: 'Strengthen your core with controlled pilates movements.', trainer: trainers[1]._id, schedule: { dayOfWeek: 'Thursday', startTime: '08:00', endTime: '09:00' }, capacity: 20, enrolled: 16 },
        { name: 'Evening Power Lift', description: 'Advanced weightlifting session focusing on compound movements.', trainer: trainers[0]._id, schedule: { dayOfWeek: 'Friday', startTime: '18:00', endTime: '19:30' }, capacity: 12, enrolled: 10 }
    ]);
    console.log(`✅ Created ${classes.length} classes`);

    // ─── 7. Equipment ─────────────────────────────────────────────
    const equipment = await Equipment.create([
        { name: 'Treadmill #1', category: 'Cardio', status: 'active', purchaseDate: new Date('2023-01-15'), lastMaintenance: new Date('2024-11-01'), nextMaintenance: new Date('2025-05-01') },
        { name: 'Treadmill #2', category: 'Cardio', status: 'active', purchaseDate: new Date('2023-01-15'), lastMaintenance: new Date('2024-10-15'), nextMaintenance: new Date('2025-04-15') },
        { name: 'Treadmill #3', category: 'Cardio', status: 'maintenance', purchaseDate: new Date('2022-06-20'), lastMaintenance: new Date('2024-09-01'), nextMaintenance: new Date('2025-03-01') },
        { name: 'Elliptical Trainer', category: 'Cardio', status: 'active', purchaseDate: new Date('2023-03-10'), lastMaintenance: new Date('2024-12-01'), nextMaintenance: new Date('2025-06-01') },
        { name: 'Stationary Bike #1', category: 'Cardio', status: 'active', purchaseDate: new Date('2023-05-01'), lastMaintenance: new Date('2024-11-15'), nextMaintenance: new Date('2025-05-15') },
        { name: 'Stationary Bike #2', category: 'Cardio', status: 'active', purchaseDate: new Date('2023-05-01'), lastMaintenance: new Date('2024-11-15'), nextMaintenance: new Date('2025-05-15') },
        { name: 'Smith Machine', category: 'Strength', status: 'active', purchaseDate: new Date('2022-08-15'), lastMaintenance: new Date('2024-10-01'), nextMaintenance: new Date('2025-04-01') },
        { name: 'Cable Crossover Machine', category: 'Strength', status: 'active', purchaseDate: new Date('2023-02-28'), lastMaintenance: new Date('2024-12-15'), nextMaintenance: new Date('2025-06-15') },
        { name: 'Leg Press Machine', category: 'Strength', status: 'active', purchaseDate: new Date('2022-11-10'), lastMaintenance: new Date('2024-08-01'), nextMaintenance: new Date('2025-02-01') },
        { name: 'Dumbbell Set (5-50kg)', category: 'Free Weights', status: 'active', purchaseDate: new Date('2022-01-01'), lastMaintenance: new Date('2024-06-01'), nextMaintenance: new Date('2025-06-01') },
        { name: 'Olympic Barbell Set', category: 'Free Weights', status: 'active', purchaseDate: new Date('2022-01-01'), lastMaintenance: new Date('2024-07-01'), nextMaintenance: new Date('2025-07-01') },
        { name: 'Kettlebell Set (8-32kg)', category: 'Free Weights', status: 'active', purchaseDate: new Date('2023-04-01'), lastMaintenance: new Date('2024-10-01'), nextMaintenance: new Date('2025-10-01') },
        { name: 'Rowing Machine', category: 'Cardio', status: 'active', purchaseDate: new Date('2023-07-15'), lastMaintenance: new Date('2024-12-01'), nextMaintenance: new Date('2025-06-01') },
        { name: 'Battle Ropes', category: 'Functional', status: 'active', purchaseDate: new Date('2023-09-01') },
        { name: 'Punching Bag (Heavy)', category: 'Functional', status: 'retired', purchaseDate: new Date('2020-03-01'), lastMaintenance: new Date('2023-12-01') }
    ]);
    console.log(`✅ Created ${equipment.length} equipment items`);

    // ─── 8. Bookings ──────────────────────────────────────────────
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + ((1 - now.getDay() + 7) % 7 || 7));
    const nextTuesday = new Date(nextMonday); nextTuesday.setDate(nextMonday.getDate() + 1);
    const nextWednesday = new Date(nextMonday); nextWednesday.setDate(nextMonday.getDate() + 2);
    const nextThursday = new Date(nextMonday); nextThursday.setDate(nextMonday.getDate() + 3);
    const nextFriday = new Date(nextMonday); nextFriday.setDate(nextMonday.getDate() + 4);

    const bookings = await Booking.create([
        { user: memberUsers[0]._id, class: classes[1]._id, status: 'confirmed', classDate: nextMonday },
        { user: memberUsers[1]._id, class: classes[3]._id, status: 'confirmed', classDate: nextWednesday },
        { user: memberUsers[2]._id, class: classes[0]._id, status: 'confirmed', classDate: nextTuesday },
        { user: memberUsers[3]._id, class: classes[2]._id, status: 'attended', classDate: nextTuesday },
        { user: memberUsers[4]._id, class: classes[1]._id, status: 'confirmed', classDate: nextMonday },
        { user: memberUsers[5]._id, class: classes[4]._id, status: 'confirmed', classDate: nextFriday }
    ]);
    console.log(`✅ Created ${bookings.length} bookings`);

    // ─── 9. Attendance Records ────────────────────────────────────
    const attendanceRecords = [];
    for (let i = 0; i < 8; i++) {
        const user = memberUsers[i % memberUsers.length];
        for (let d = 0; d < 5; d++) {
            const checkIn = new Date(now - (d * 86400000) - (Math.random() * 3600000 * 4));
            const checkOut = new Date(checkIn.getTime() + (60 + Math.random() * 60) * 60000);
            attendanceRecords.push({
                user: user._id,
                checkInTime: checkIn,
                checkOutTime: d === 0 ? null : checkOut, // today = still checked in
                facility: ['Main Gym', 'Swimming Pool', 'Yoga Studio', 'CrossFit Area'][Math.floor(Math.random() * 4)]
            });
        }
    }
    await AttendanceRecord.create(attendanceRecords);
    console.log(`✅ Created ${attendanceRecords.length} attendance records`);

    // ─── 10. Notifications ────────────────────────────────────────
    const notifications = await Notification.create([
        { user: memberUsers[0]._id, title: 'Welcome to SDFitness!', message: 'Your membership has been activated. Let\'s get started!', type: 'system', isRead: true },
        { user: memberUsers[0]._id, title: 'Class Reminder', message: 'Your HIIT Blast class starts in 1 hour.', type: 'reminder', isRead: false },
        { user: memberUsers[1]._id, title: 'Membership Renewal', message: 'Your Elite membership renews in 5 days.', type: 'alert', isRead: false },
        { user: memberUsers[2]._id, title: 'New Class Available', message: 'Pilates Core has been added to the schedule. Book now!', type: 'system', isRead: false },
        { user: memberUsers[3]._id, title: 'Workout Streak!', message: 'You\'ve maintained a 7-day streak! Keep it up!', type: 'system', isRead: true },
        { user: memberUsers[4]._id, title: 'Payment Reminder', message: 'Your membership payment is due in 3 days.', type: 'alert', isRead: false },
        { user: admin._id, title: 'Equipment Alert', message: 'Treadmill #3 is scheduled for maintenance.', type: 'alert', isRead: false },
        { user: admin._id, title: 'New Member Joined', message: 'Sanduni Jayasundara has joined as a new member.', type: 'system', isRead: false }
    ]);
    console.log(`✅ Created ${notifications.length} notifications`);

    // ─── 11. Conversations & Messages ─────────────────────────────
    const conv1 = await Conversation.create({
        participants: [memberUsers[0]._id, trainerUsers[0]._id]
    });
    const conv2 = await Conversation.create({
        participants: [memberUsers[2]._id, trainerUsers[1]._id]
    });

    const msgs = await Message.create([
        { conversation: conv1._id, sender: memberUsers[0]._id, text: 'Hi coach, I wanted to ask about my training schedule for next week.' },
        { conversation: conv1._id, sender: trainerUsers[0]._id, text: 'Hey Saman! Sure, let\'s plan it out. How many days can you come in?' },
        { conversation: conv1._id, sender: memberUsers[0]._id, text: 'I can do Monday, Wednesday, and Friday.' },
        { conversation: conv1._id, sender: trainerUsers[0]._id, text: 'Perfect. I\'ll prepare a 3-day split focusing on your weight loss goals. See you Monday at 7 AM!' },
        { conversation: conv2._id, sender: memberUsers[2]._id, text: 'Good morning! Can I switch from Tuesday to Thursday yoga class?' },
        { conversation: conv2._id, sender: trainerUsers[1]._id, text: 'Of course Nimasha! Thursday at 8 AM works. I\'ll update the schedule.' }
    ]);

    await Conversation.findByIdAndUpdate(conv1._id, { lastMessage: msgs[3]._id });
    await Conversation.findByIdAndUpdate(conv2._id, { lastMessage: msgs[5]._id });
    console.log(`✅ Created ${2} conversations with ${msgs.length} messages`);

    // ─── 13. Scraper Review Queue ────────────────────────────────
    const ScraperReviewItem = mongoose.models.ScraperReviewItem || mongoose.model('ScraperReviewItem', new mongoose.Schema({
        rawName: { type: String, required: true },
        store: { type: String, required: true },
        price: Number,
        url: { type: String, default: '' },
        scrapedAt: { type: Date, default: Date.now },
        suggestedMatch: { type: String, default: null },
        matchConfidence: { type: Number, default: 0 },
        status: { type: String, enum: ['pending', 'matched', 'ignored'], default: 'pending' },
        linkedFoodId: { type: String, default: null },
        notes: { type: String, default: '' },
    }, { timestamps: true }));
    await ScraperReviewItem.deleteMany({});
    const scraperItems = await ScraperReviewItem.create([
        { rawName: 'KEELLS Chicken Drumstick 500g', store: 'Keells', price: 890, scrapedAt: new Date(), suggestedMatch: 'chicken_thigh', matchConfidence: 0.72, status: 'pending' },
        { rawName: 'Anchor Butter Unsalted 200g', store: 'Keells', price: 680, scrapedAt: new Date(), suggestedMatch: 'butter', matchConfidence: 0.91, status: 'pending' },
        { rawName: 'Cargills Magic Basmati Rice 1kg', store: 'Cargills', price: 490, scrapedAt: new Date(), suggestedMatch: 'rice', matchConfidence: 0.85, status: 'pending' },
        { rawName: 'Vim Dishwash Liquid 500ml', store: 'Keells', price: 350, scrapedAt: new Date(), status: 'pending' },
        { rawName: 'Ambewela Fresh Milk 1L', store: 'Cargills', price: 310, scrapedAt: new Date(), suggestedMatch: 'milk', matchConfidence: 0.94, status: 'pending' },
        { rawName: 'Signal Toothpaste 120g', store: 'Arpico', price: 280, scrapedAt: new Date(), status: 'pending' },
        { rawName: 'Lanka Soy Meat 90g', store: 'Sathosa', price: 95, scrapedAt: new Date(), suggestedMatch: 'soy_meat', matchConfidence: 0.88, status: 'pending' }
    ]);
    console.log(`✅ Created ${scraperItems.length} scraper review items`);

    console.log('\n🎉 Seed complete! Database populated with sample data.');
    console.log('   Admin login: admin@sdfitness.com / admin123');
    console.log('   Member login: saman@gmail.com / member123');
    console.log('   Trainer login: kamal@sdfitness.com / trainer123');
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
