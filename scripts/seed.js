/**
 * SDFitness — Seed Script
 * Seeds: foodprices (with aliases) + dietplans (sample)
 * Run: node scripts/seed.js
 */

require('./backend/node_modules/dotenv').config({ path: './backend/.env' });
const mongoose = require('./backend/node_modules/mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sdfitness';

// ─── Schemas (inline to avoid module path issues) ────────────────────────────
const foodPriceSchema = new mongoose.Schema({
    foodId: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true },
    category: { type: String, enum: ['protein', 'carbs', 'fats', 'vegetable', 'fruit', 'dairy', 'other'], required: true },
    nutritionPer100g: {
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fat: { type: Number, default: 0 },
        fiber: { type: Number, default: 0 }
    },
    prices: [{
        store: String, pricePerUnit: Number, unit: { type: String, default: 'kg' },
        pricePerGram: Number, isAvailable: { type: Boolean, default: true },
        source: { type: String, enum: ['scraper_catalog', 'api', 'manual'] },
        lastUpdated: { type: Date, default: Date.now }
    }],
    averagePricePerGram: { type: Number, default: 0 },
    lowestPricePerGram: { type: Number, default: 0 },
    currency: { type: String, default: 'LKR' },
    aliases: [{ type: String, trim: true, lowercase: true }],
    isVerified: { type: Boolean, default: false }
}, { timestamps: true });

foodPriceSchema.pre('save', function (next) {
    if (this.prices && this.prices.length > 0) {
        const avail = this.prices.filter(p => p.isAvailable);
        if (avail.length > 0) {
            const sum = avail.reduce((a, p) => a + p.pricePerGram, 0);
            this.averagePricePerGram = parseFloat((sum / avail.length).toFixed(4));
            this.lowestPricePerGram = Math.min(...avail.map(p => p.pricePerGram));
        }
    }
    next();
});

const dietPlanSchema = new mongoose.Schema({
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    planName: { type: String, default: 'Custom Diet Plan' },
    generatedAt: { type: Date, default: Date.now },
    validUntil: Date,
    targetCalories: { type: Number, required: true },
    macroSplit: {
        protein: { grams: Number, percentage: Number },
        carbs: { grams: Number, percentage: Number },
        fats: { grams: Number, percentage: Number }
    },
    budget: { amount: Number, currency: { type: String, default: 'LKR' }, period: String },
    days: [{
        dayOfWeek: Number, dayName: String,
        meals: [{
            mealType: String, name: String,
            items: [{ foodId: String, food: String, quantity: Number, unit: { type: String, default: 'g' } }],
            calories: Number,
            macros: { protein: Number, carbs: Number, fats: Number, fiber: Number },
            estimatedCost: { amount: Number, currency: { type: String, default: 'LKR' } },
            instructions: [String], prepTime: Number, cookTime: Number, description: String
        }]
    }],
    shoppingList: {
        items: [{
            foodId: String, name: String, quantity: Number, unit: String,
            category: String, priceAtGeneration: Number, currentPrice: Number, store: String
        }],
        totalAtGeneration: Number, currentTotal: Number,
        lastPriceUpdate: Date, priceChanged: { type: Boolean, default: false }
    },
    aiMetadata: {
        mlModelVersion: String, mlConfidenceScore: Number, mlInferenceTimeMs: Number,
        gptModel: String, generationMethod: { type: String, default: 'ml_plus_gpt' },
        featureImportance: [{ feature: String, importance: Number }]
    },
    isActive: { type: Boolean, default: true },
    isFavorite: { type: Boolean, default: false },
    status: { type: String, enum: ['generating', 'completed', 'failed'], default: 'generating' },
    rating: Number, feedback: String
}, { timestamps: true });

const FoodPrice = mongoose.model('FoodPrice', foodPriceSchema);
const DietPlan = mongoose.model('DietPlan', dietPlanSchema);

// ─── Food Aliases Seed Data ───────────────────────────────────────────────────
const FOOD_ALIASES = [
    {
        foodId: 'chicken_breast', name: 'Chicken Breast', category: 'protein',
        nutritionPer100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
        aliases: ['chicken breast', 'boneless chicken', 'chicken fillet', 'chicken kfc style', 'breast chicken', 'skinless chicken breast', 'chilled chicken breast'],
        currency: 'LKR', isVerified: true
    },

    {
        foodId: 'eggs', name: 'Eggs', category: 'protein',
        nutritionPer100g: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
        aliases: ['egg', 'eggs', 'free range eggs', 'farm eggs', 'chicken eggs', 'brown eggs', 'white eggs', '10 eggs', '6 eggs', 'dozen eggs'],
        currency: 'LKR', isVerified: true
    },

    {
        foodId: 'brown_rice', name: 'Brown Rice', category: 'carbs',
        nutritionPer100g: { calories: 370, protein: 7.9, carbs: 77, fat: 2.9, fiber: 3.5 },
        aliases: ['brown rice', 'whole grain rice', 'unpolished rice', 'red raw rice', 'brown basmati', 'keeri samba brown'],
        currency: 'LKR', isVerified: true
    },

    {
        foodId: 'white_rice', name: 'White Rice', category: 'carbs',
        nutritionPer100g: { calories: 365, protein: 7.1, carbs: 80, fat: 0.7, fiber: 1.3 },
        aliases: ['white rice', 'samba rice', 'keeri samba', 'sudu kakulu', 'basmati rice', 'ponni rice', 'steamed rice', 'raw rice'],
        currency: 'LKR', isVerified: true
    },

    {
        foodId: 'oats', name: 'Oats', category: 'carbs',
        nutritionPer100g: { calories: 389, protein: 16.9, carbs: 66, fat: 6.9, fiber: 10.6 },
        aliases: ['oats', 'rolled oats', 'oatmeal', 'quaker oats', 'instant oats', 'steel cut oats', 'porridge oats'],
        currency: 'LKR', isVerified: true
    },

    {
        foodId: 'red_lentils', name: 'Red Lentils (Dhal)', category: 'protein',
        nutritionPer100g: { calories: 352, protein: 25, carbs: 63, fat: 1.1, fiber: 10.7 },
        aliases: ['dhal', 'dal', 'red lentils', 'masoor dal', 'parippu', 'red dal', 'lentils', 'yellow lentils'],
        currency: 'LKR', isVerified: true
    },

    {
        foodId: 'spinach', name: 'Spinach', category: 'vegetable',
        nutritionPer100g: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
        aliases: ['spinach', 'baby spinach', 'fresh spinach', 'palak', 'nivithi', 'saag'],
        currency: 'LKR', isVerified: true
    },

    {
        foodId: 'broccoli', name: 'Broccoli', category: 'vegetable',
        nutritionPer100g: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
        aliases: ['broccoli', 'fresh broccoli', 'broccoli florets', 'green broccoli'],
        currency: 'LKR', isVerified: true
    },

    {
        foodId: 'sweet_potato', name: 'Sweet Potato', category: 'carbs',
        nutritionPer100g: { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3 },
        aliases: ['sweet potato', 'sweet potatoes', 'yam', 'orange sweet potato', 'batala', 'bathala'],
        currency: 'LKR', isVerified: true
    },

    {
        foodId: 'banana', name: 'Banana', category: 'fruit',
        nutritionPer100g: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
        aliases: ['banana', 'bananas', 'ambul banana', 'kolikuttu', 'seeni banana', 'ripe banana', 'cavendish banana'],
        currency: 'LKR', isVerified: true
    },

    {
        foodId: 'whole_milk', name: 'Whole Milk', category: 'dairy',
        nutritionPer100g: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0 },
        aliases: ['milk', 'whole milk', 'fresh milk', 'full cream milk', 'cow milk', 'full fat milk', 'nestle milk', 'anchor milk'],
        currency: 'LKR', isVerified: true
    },

    {
        foodId: 'yogurt', name: 'Plain Yogurt', category: 'dairy',
        nutritionPer100g: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0 },
        aliases: ['yogurt', 'plain yogurt', 'curd', 'dahi', 'low fat yogurt', 'greek yogurt', 'natural yogurt', 'set yogurt'],
        currency: 'LKR', isVerified: true
    },

    {
        foodId: 'tofu', name: 'Tofu', category: 'protein',
        nutritionPer100g: { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3 },
        aliases: ['tofu', 'firm tofu', 'silken tofu', 'soy tofu', 'bean curd'],
        currency: 'LKR', isVerified: true
    },

    {
        foodId: 'canned_tuna', name: 'Canned Tuna', category: 'protein',
        nutritionPer100g: { calories: 116, protein: 26, carbs: 0, fat: 1, fiber: 0 },
        aliases: ['tuna', 'canned tuna', 'tuna chunks', 'tuna in brine', 'tuna in oil', 'john west tuna', 'elephant house tuna', 'diana tuna'],
        currency: 'LKR', isVerified: true
    },

    {
        foodId: 'bread_wholemeal', name: 'Wholemeal Bread', category: 'carbs',
        nutritionPer100g: { calories: 247, protein: 13, carbs: 41, fat: 3.4, fiber: 7 },
        aliases: ['wholemeal bread', 'whole wheat bread', 'brown bread', 'wheat bread', 'high fibre bread', 'wholegrain bread', 'multi grain bread'],
        currency: 'LKR', isVerified: true
    },

    {
        foodId: 'olive_oil', name: 'Olive Oil', category: 'fats',
        nutritionPer100g: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
        aliases: ['olive oil', 'extra virgin olive oil', 'evoo', 'pure olive oil', 'light olive oil'],
        currency: 'LKR', isVerified: true
    },

    {
        foodId: 'coconut_oil', name: 'Coconut Oil', category: 'fats',
        nutritionPer100g: { calories: 862, protein: 0, carbs: 0, fat: 100, fiber: 0 },
        aliases: ['coconut oil', 'virgin coconut oil', 'vco', 'pol tel', 'pol thel', 'refined coconut oil'],
        currency: 'LKR', isVerified: true
    },

    {
        foodId: 'chicken_thigh', name: 'Chicken Thigh', category: 'protein',
        nutritionPer100g: { calories: 209, protein: 26, carbs: 0, fat: 10.9, fiber: 0 },
        aliases: ['chicken thigh', 'chicken thighs', 'boneless thigh', 'chicken leg', 'thigh fillet'],
        currency: 'LKR', isVerified: true
    },

    {
        foodId: 'carrot', name: 'Carrot', category: 'vegetable',
        nutritionPer100g: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 },
        aliases: ['carrot', 'carrots', 'baby carrots', 'fresh carrots', 'orange carrot'],
        currency: 'LKR', isVerified: true
    },

    {
        foodId: 'peanut_butter', name: 'Peanut Butter', category: 'fats',
        nutritionPer100g: { calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6 },
        aliases: ['peanut butter', 'peanut paste', 'smooth peanut butter', 'crunchy peanut butter', 'groundnut paste'],
        currency: 'LKR', isVerified: true
    },
];

// ─── Sample Diet Plan ─────────────────────────────────────────────────────────
// Uses a fake memberId ObjectId for demo purposes
const SAMPLE_MEMBER_ID = new mongoose.Types.ObjectId();

const SAMPLE_DIET_PLANS = [
    {
        memberId: SAMPLE_MEMBER_ID,
        planName: 'Muscle Gain Plan — March 2026',
        status: 'completed',
        targetCalories: 2700,
        macroSplit: {
            protein: { grams: 203, percentage: 30 },
            carbs: { grams: 338, percentage: 50 },
            fats: { grams: 60, percentage: 20 }
        },
        budget: { amount: 1500, currency: 'LKR', period: 'daily' },
        aiMetadata: {
            mlModelVersion: '1.0.0',
            mlConfidenceScore: 0.842,
            mlInferenceTimeMs: 18.3,
            gptModel: 'gemini-1.5-flash',
            generationMethod: 'ml_plus_gpt',
            featureImportance: [
                { feature: 'food_calories', importance: 0.4127 },
                { feature: 'food_fat', importance: 0.1846 },
                { feature: 'goal', importance: 0.1333 }
            ]
        },
        days: [
            {
                dayOfWeek: 0, dayName: 'Monday',
                meals: [
                    {
                        mealType: 'breakfast', name: 'High-Protein Breakfast',
                        items: [
                            { foodId: 'eggs', food: 'Eggs', quantity: 200, unit: 'g' },
                            { foodId: 'brown_rice', food: 'Brown Rice', quantity: 150, unit: 'g' },
                            { foodId: 'spinach', food: 'Spinach', quantity: 100, unit: 'g' }
                        ],
                        calories: 520, macros: { protein: 36, carbs: 130, fats: 12, fiber: 6 },
                        estimatedCost: { amount: 280, currency: 'LKR' },
                        prepTime: 5, cookTime: 15,
                        description: 'Scrambled eggs with brown rice and sautéed spinach'
                    },
                    {
                        mealType: 'lunch', name: 'Protein Power Lunch',
                        items: [
                            { foodId: 'chicken_breast', food: 'Chicken Breast', quantity: 250, unit: 'g' },
                            { foodId: 'white_rice', food: 'White Rice', quantity: 200, unit: 'g' },
                            { foodId: 'broccoli', food: 'Broccoli', quantity: 150, unit: 'g' }
                        ],
                        calories: 740, macros: { protein: 88, carbs: 170, fats: 9, fiber: 4 },
                        estimatedCost: { amount: 560, currency: 'LKR' },
                        prepTime: 5, cookTime: 25,
                        description: 'Grilled chicken breast with steamed rice and broccoli'
                    },
                    {
                        mealType: 'dinner', name: 'Recovery Dinner',
                        items: [
                            { foodId: 'red_lentils', food: 'Red Lentils', quantity: 200, unit: 'g' },
                            { foodId: 'brown_rice', food: 'Brown Rice', quantity: 200, unit: 'g' },
                            { foodId: 'carrot', food: 'Carrot', quantity: 100, unit: 'g' }
                        ],
                        calories: 890, macros: { protein: 56, carbs: 175, fats: 4, fiber: 18 },
                        estimatedCost: { amount: 220, currency: 'LKR' },
                        prepTime: 10, cookTime: 30,
                        description: 'Red lentil curry with brown rice and steamed carrots'
                    }
                ]
            }
        ],
        shoppingList: {
            items: [
                { foodId: 'chicken_breast', name: 'Chicken Breast', quantity: 1750, unit: 'g', category: 'protein', priceAtGeneration: 1.45 },
                { foodId: 'eggs', name: 'Eggs', quantity: 1400, unit: 'g', category: 'protein', priceAtGeneration: 0.75 },
                { foodId: 'brown_rice', name: 'Brown Rice', quantity: 2450, unit: 'g', category: 'grains', priceAtGeneration: 0.38 },
                { foodId: 'red_lentils', name: 'Red Lentils', quantity: 1400, unit: 'g', category: 'protein', priceAtGeneration: 0.55 },
                { foodId: 'spinach', name: 'Spinach', quantity: 700, unit: 'g', category: 'produce', priceAtGeneration: 0.28 },
                { foodId: 'broccoli', name: 'Broccoli', quantity: 1050, unit: 'g', category: 'produce', priceAtGeneration: 0.75 }
            ],
            totalAtGeneration: 7350, currentTotal: 7350,
            lastPriceUpdate: new Date(), priceChanged: false
        },
        isActive: true, isFavorite: false, rating: 4,
        feedback: 'Good plan, needs more variety in breakfast options'
    },
    {
        memberId: SAMPLE_MEMBER_ID,
        planName: 'Weight Loss Plan — March 2026',
        status: 'completed',
        targetCalories: 1800,
        macroSplit: {
            protein: { grams: 180, percentage: 40 },
            carbs: { grams: 158, percentage: 35 },
            fats: { grams: 45, percentage: 25 }
        },
        budget: { amount: 1000, currency: 'LKR', period: 'daily' },
        aiMetadata: {
            mlModelVersion: '1.0.0',
            mlConfidenceScore: 0.791,
            mlInferenceTimeMs: 21.4,
            gptModel: 'gemini-1.5-flash',
            generationMethod: 'ml_plus_gpt',
            featureImportance: [
                { feature: 'food_calories', importance: 0.4127 },
                { feature: 'goal', importance: 0.1333 }
            ]
        },
        days: [
            {
                dayOfWeek: 0, dayName: 'Monday',
                meals: [
                    {
                        mealType: 'breakfast', name: 'Light Start',
                        items: [
                            { foodId: 'oats', food: 'Oats', quantity: 80, unit: 'g' },
                            { foodId: 'banana', food: 'Banana', quantity: 120, unit: 'g' },
                            { foodId: 'yogurt', food: 'Yogurt', quantity: 200, unit: 'g' }
                        ],
                        calories: 480, macros: { protein: 28, carbs: 72, fats: 8, fiber: 14 },
                        estimatedCost: { amount: 220, currency: 'LKR' },
                        prepTime: 2, cookTime: 5,
                        description: 'Oatmeal with sliced banana and low-fat yogurt'
                    }
                ]
            }
        ],
        shoppingList: {
            items: [
                { foodId: 'oats', name: 'Oats', quantity: 560, unit: 'g', category: 'grains', priceAtGeneration: 0.62 },
                { foodId: 'banana', name: 'Banana', quantity: 840, unit: 'g', category: 'produce', priceAtGeneration: 0.18 },
                { foodId: 'yogurt', name: 'Yogurt', quantity: 1400, unit: 'g', category: 'dairy', priceAtGeneration: 0.44 }
            ],
            totalAtGeneration: 2100, currentTotal: 2100,
            lastPriceUpdate: new Date(), priceChanged: false
        },
        isActive: false, isFavorite: true, rating: 5,
        feedback: 'Excellent plan, very easy to follow!'
    }
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB:', MONGO_URI);

        // --- Seed FoodPrice with aliases ---
        console.log('\n📌 Seeding food aliases (via FoodPrice)...');
        let aliasCount = 0;
        for (const food of FOOD_ALIASES) {
            await FoodPrice.findOneAndUpdate(
                { foodId: food.foodId },
                { $set: food },
                { upsert: true, new: true }
            );
            aliasCount++;
        }
        console.log(`   ✅ Upserted ${aliasCount} foods with aliases`);

        // --- Seed DietPlans ---
        console.log('\n🥗  Seeding diet plans...');
        await DietPlan.deleteMany({});
        const inserted = await DietPlan.insertMany(SAMPLE_DIET_PLANS);
        console.log(`   ✅ Inserted ${inserted.length} diet plans`);

        // --- Summary ---
        const fpCount = await FoodPrice.countDocuments();
        const dpCount = await DietPlan.countDocuments();
        console.log('\n📊 Database Summary:');
        console.log(`   foodprices : ${fpCount} documents`);
        console.log(`   dietplans  : ${dpCount} documents`);

        await mongoose.disconnect();
        console.log('\n✅ Seeding complete!');
    } catch (err) {
        console.error('❌ Seed error:', err.message);
        process.exit(1);
    }
}

seed();
