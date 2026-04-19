const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const MembershipPlan = require('../models/MembershipPlan');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const verifyPlans = async () => {
    try {
        console.log('Connecting to MongoDB...');
        // Try MONGO_URI from backend/.env, fallback to localhost
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/sdfitness';
        
        // Ensure we connect to localhost if running on the host machine
        const connectionString = uri.replace('mongodb://mongo:27017', 'mongodb://localhost:27017');
        
        await mongoose.connect(connectionString);
        console.log('MongoDB Connected to', connectionString);

        console.log('Fetching Membership Plans...');
        const plans = await MembershipPlan.find({});
        console.log(`Found ${plans.length} plans.`);

        let issuesFound = 0;

        for (const plan of plans) {
            let hasIssue = false;

            if (plan.price === undefined || plan.price === null || isNaN(plan.price)) {
                console.log(`Plan "${plan.name}" (ID: ${plan._id}) is missing a valid price. Setting default to 0.`);
                plan.price = 0;
                hasIssue = true;
            }

            if (!plan.duration || isNaN(plan.duration) || plan.duration < 1) {
                // Check if it has legacy durationDays
                if (plan.durationDays) {
                    console.log(`Plan "${plan.name}" has legacy durationDays. Converting to months.`);
                    plan.duration = Math.max(1, Math.round(plan.durationDays / 30));
                    plan.durationType = 'months';
                } else {
                    console.log(`Plan "${plan.name}" (ID: ${plan._id}) is missing a valid duration. Setting default to 1 month.`);
                    plan.duration = 1;
                    plan.durationType = 'months';
                }
                hasIssue = true;
            }

            if (!['days', 'months'].includes(plan.durationType)) {
                console.log(`Plan "${plan.name}" (ID: ${plan._id}) has invalid durationType: ${plan.durationType}. Setting default to months.`);
                plan.durationType = 'months';
                hasIssue = true;
            }

            if (hasIssue) {
                issuesFound++;
                await plan.save();
                console.log(`Fixed plan "${plan.name}".`);
            }
        }

        if (issuesFound > 0) {
            console.log(`\nVerification complete. Fixed ${issuesFound} plans.`);
        } else {
            console.log('\nVerification complete. All plans are correctly formatted.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error verifying plans:', err);
        process.exit(1);
    }
};

verifyPlans();
