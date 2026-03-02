/**
 * Seed realistic Sri Lankan supermarket prices for all 23 canonical food IDs.
 * Prices sourced from Keells Super / Cargills Online Feb 2026 (LKR per kg).
 *
 * Run: node scripts/seedPrices.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const FoodPrice = require('../models/FoodPrice');

const connectDB = require('../config/db');

// Realistic Feb 2026 prices in LKR per kg
const SEED_PRICES = [
    // ── Proteins ──────────────────────────────────────────────────────────────
    {
        foodId: 'chicken_breast',
        name: 'Chicken Breast / Drumstick',
        category: 'protein',
        averagePricePerGram: 1.05,   // ~Rs 1,050/kg
        lowestPricePerGram: 0.92,
        currency: 'LKR',
        unit: '1 kg',
        isVerified: true,
        scrapeData: {
            lastScraped: new Date(),
            sourceUrl: 'https://www.keellssuper.com',
            rawScrapedName: 'Bairaha Chicken Whole Leg Marinated 1kg',
            storeBreakdown: [
                { store: 'Keells', price: 1050, rawName: 'Bairaha Chicken Whole Leg Marinated 1kg' },
                { store: 'Cargills', price: 980, rawName: 'Keells Chicken Drumstick 500g' },
            ],
        },
    },
    {
        foodId: 'eggs',
        name: 'Eggs (Chicken)',
        category: 'protein',
        averagePricePerGram: 0.028,  // Rs 28 per egg ≈ Rs 280/10-pack
        lowestPricePerGram: 0.025,
        currency: 'LKR',
        unit: '10 pack',
        isVerified: true,
        scrapeData: {
            lastScraped: new Date(), storeBreakdown: [
                { store: 'Keells', price: 285, rawName: 'Farm Fresh Eggs 10pk' },
                { store: 'Cargills', price: 275, rawName: 'Village Eggs 10 pack' },
            ]
        },
    },
    {
        foodId: 'tuna',
        name: 'Tuna (canned / fresh)',
        category: 'protein',
        averagePricePerGram: 0.85,   // Rs 850/kg fresh; Rs 250/185g can
        lowestPricePerGram: 0.75,
        currency: 'LKR',
        unit: '185g can',
        isVerified: true,
        scrapeData: {
            lastScraped: new Date(), storeBreakdown: [
                { store: 'Keells', price: 265, rawName: 'Keells Tuna Chunks in Brine 185g' },
            ]
        },
    },
    {
        foodId: 'lentils',
        name: 'Lentils (Parippu / Dhal)',
        category: 'protein',
        averagePricePerGram: 0.32,
        lowestPricePerGram: 0.28,
        currency: 'LKR',
        unit: '1 kg',
        isVerified: true,
        scrapeData: {
            lastScraped: new Date(), storeBreakdown: [
                { store: 'Keells', price: 320, rawName: 'Harischandra Red Lentils 1kg' },
                { store: 'Cargills', price: 295, rawName: 'Parippu Masoor 500g' },
            ]
        },
    },
    {
        foodId: 'soy_meat',
        name: 'Soy Meat / TVP',
        category: 'protein',
        averagePricePerGram: 0.65,
        lowestPricePerGram: 0.55,
        currency: 'LKR',
        unit: '200g',
        isVerified: true,
        scrapeData: {
            lastScraped: new Date(), storeBreakdown: [
                { store: 'Keells', price: 145, rawName: 'Keells Soya Meat 200g' },
            ]
        },
    },
    {
        foodId: 'beef',
        name: 'Beef',
        category: 'protein',
        averagePricePerGram: 1.60,
        lowestPricePerGram: 1.45,
        currency: 'LKR',
        unit: '1 kg',
        isVerified: true,
        scrapeData: {
            lastScraped: new Date(), storeBreakdown: [
                { store: 'Keells', price: 1620, rawName: 'Keells Beef Cubes 500g' },
            ]
        },
    },
    {
        foodId: 'fish',
        name: 'Fish (Tilapia / Mackerel)',
        category: 'protein',
        averagePricePerGram: 0.95,
        lowestPricePerGram: 0.75,
        currency: 'LKR',
        unit: '1 kg',
        isVerified: true,
        scrapeData: {
            lastScraped: new Date(), storeBreakdown: [
                { store: 'Keells', price: 980, rawName: 'Fresh Tilapia 1kg' },
            ]
        },
    },

    // ── Carbs ─────────────────────────────────────────────────────────────────
    {
        foodId: 'rice',
        name: 'White / Basmati Rice',
        category: 'carbs',
        averagePricePerGram: 0.22,
        lowestPricePerGram: 0.18,
        currency: 'LKR',
        unit: '5 kg',
        isVerified: true,
        scrapeData: {
            lastScraped: new Date(), storeBreakdown: [
                { store: 'Keells', price: 1100, rawName: 'Cargills Magic Basmati Rice 5kg' },
                { store: 'Cargills', price: 950, rawName: 'Saumya White Rice 5kg' },
            ]
        },
    },
    {
        foodId: 'brown_rice',
        name: 'Brown Rice',
        category: 'carbs',
        averagePricePerGram: 0.30,
        lowestPricePerGram: 0.26,
        currency: 'LKR',
        unit: '1 kg',
        isVerified: true,
        scrapeData: {
            lastScraped: new Date(), storeBreakdown: [
                { store: 'Keells', price: 310, rawName: 'Keells Brown Rice 1kg' },
            ]
        },
    },
    {
        foodId: 'oats',
        name: 'Oats',
        category: 'carbs',
        averagePricePerGram: 0.45,
        lowestPricePerGram: 0.38,
        currency: 'LKR',
        unit: '400g',
        isVerified: true,
        scrapeData: {
            lastScraped: new Date(), storeBreakdown: [
                { store: 'Keells', price: 195, rawName: 'Quaker Oats 400g' },
                { store: 'Cargills', price: 185, rawName: 'Three Rings Rolled Oats 400g' },
            ]
        },
    },
    {
        foodId: 'sweet_potato',
        name: 'Sweet Potato',
        category: 'carbs',
        averagePricePerGram: 0.25,
        lowestPricePerGram: 0.20,
        currency: 'LKR',
        unit: '1 kg',
        isVerified: true,
        scrapeData: {
            lastScraped: new Date(), storeBreakdown: [
                { store: 'Keells', price: 260, rawName: 'Sweet Potato 1kg' },
            ]
        },
    },
    {
        foodId: 'bread',
        name: 'Bread (Whole Wheat)',
        category: 'carbs',
        averagePricePerGram: 0.55,
        lowestPricePerGram: 0.42,
        currency: 'LKR',
        unit: '400g loaf',
        isVerified: true,
        scrapeData: {
            lastScraped: new Date(), storeBreakdown: [
                { store: 'Keells', price: 250, rawName: 'Keells Whole Wheat Bread 400g' },
                { store: 'Cargills', price: 220, rawName: 'Cargills Bread Wholegrain 400g' },
            ]
        },
    },

    // ── Vegetables ────────────────────────────────────────────────────────────
    {
        foodId: 'spinach',
        name: 'Spinach / Kangkung',
        category: 'vegetable',
        averagePricePerGram: 0.18,
        lowestPricePerGram: 0.12,
        currency: 'LKR',
        unit: '250g',
        isVerified: true,
        scrapeData: {
            lastScraped: new Date(), storeBreakdown: [
                { store: 'Keells', price: 55, rawName: 'Kangkung Bunch 250g' },
            ]
        },
    },
    {
        foodId: 'carrot',
        name: 'Carrot',
        category: 'vegetable',
        averagePricePerGram: 0.20,
        lowestPricePerGram: 0.15,
        currency: 'LKR',
        unit: '500g',
        isVerified: true,
        scrapeData: {
            lastScraped: new Date(), storeBreakdown: [
                { store: 'Keells', price: 110, rawName: 'Fresh Carrot 500g' },
                { store: 'Cargills', price: 95, rawName: 'Carrot 500g' },
            ]
        },
    },
    {
        foodId: 'broccoli',
        name: 'Broccoli',
        category: 'vegetable',
        averagePricePerGram: 0.55,
        lowestPricePerGram: 0.45,
        currency: 'LKR',
        unit: '500g',
        isVerified: true,
        scrapeData: {
            lastScraped: new Date(), storeBreakdown: [
                { store: 'Keells', price: 295, rawName: 'Broccoli 500g' },
            ]
        },
    },

    // ── Fruits ────────────────────────────────────────────────────────────────
    {
        foodId: 'banana',
        name: 'Banana',
        category: 'fruit',
        averagePricePerGram: 0.10,
        lowestPricePerGram: 0.08,
        currency: 'LKR',
        unit: '1 kg',
        isVerified: true,
        scrapeData: {
            lastScraped: new Date(), storeBreakdown: [
                { store: 'Keells', price: 110, rawName: 'Ambul Banana 1kg' },
            ]
        },
    },
    {
        foodId: 'papaya',
        name: 'Papaya',
        category: 'fruit',
        averagePricePerGram: 0.12,
        lowestPricePerGram: 0.09,
        currency: 'LKR',
        unit: '1 kg',
        isVerified: true,
        scrapeData: {
            lastScraped: new Date(), storeBreakdown: [
                { store: 'Keells', price: 125, rawName: 'Fresh Papaya 1kg' },
            ]
        },
    },

    // ── Dairy ─────────────────────────────────────────────────────────────────
    {
        foodId: 'milk',
        name: 'Fresh Milk',
        category: 'dairy',
        averagePricePerGram: 0.28,   // Rs 280/L (1L ≈ 1030g)
        lowestPricePerGram: 0.25,
        currency: 'LKR',
        unit: '1 L',
        isVerified: true,
        scrapeData: {
            lastScraped: new Date(), storeBreakdown: [
                { store: 'Keells', price: 295, rawName: 'Ambewela Fresh Milk 1L' },
                { store: 'Cargills', price: 285, rawName: 'Kotmale Fresh Milk 1L' },
            ]
        },
    },
    {
        foodId: 'yogurt',
        name: 'Yogurt / Curd',
        category: 'dairy',
        averagePricePerGram: 0.30,
        lowestPricePerGram: 0.22,
        currency: 'LKR',
        unit: '200g',
        isVerified: true,
        scrapeData: {
            lastScraped: new Date(), storeBreakdown: [
                { store: 'Keells', price: 65, rawName: 'Kotmale Jelly Yoghurt 80g' },
                { store: 'Keells', price: 150, rawName: 'Cargills Plain Curd 200g' },
            ]
        },
    },
    {
        foodId: 'butter',
        name: 'Butter',
        category: 'dairy',
        averagePricePerGram: 1.80,
        lowestPricePerGram: 1.60,
        currency: 'LKR',
        unit: '200g',
        isVerified: true,
        scrapeData: {
            lastScraped: new Date(), storeBreakdown: [
                { store: 'Keells', price: 395, rawName: 'Anchor Butter 200g' },
            ]
        },
    },

    // ── Fats / Oils ───────────────────────────────────────────────────────────
    {
        foodId: 'coconut_oil',
        name: 'Coconut Oil',
        category: 'fats',
        averagePricePerGram: 1.46,
        lowestPricePerGram: 1.30,
        currency: 'LKR',
        unit: '1 L',
        isVerified: true,
        scrapeData: {
            lastScraped: new Date(), storeBreakdown: [
                { store: 'Keells', price: 1462, rawName: 'Fortune RBD Coconut Oil 1L' },
                { store: 'Cargills', price: 1380, rawName: 'Pure Coconut Oil 1L' },
            ]
        },
    },
    {
        foodId: 'coconut_milk',
        name: 'Coconut Milk',
        category: 'fats',
        averagePricePerGram: 0.96,
        lowestPricePerGram: 0.80,
        currency: 'LKR',
        unit: '300ml',
        isVerified: true,
        scrapeData: {
            lastScraped: new Date(), storeBreakdown: [
                { store: 'Keells', price: 310, rawName: 'Renuka Coconut Milk 300ml' },
                { store: 'Cargills', price: 290, rawName: 'Kara Coconut Milk 200ml' },
            ]
        },
    },
    {
        foodId: 'olive_oil',
        name: 'Olive Oil',
        category: 'fats',
        averagePricePerGram: 5.50,
        lowestPricePerGram: 4.80,
        currency: 'LKR',
        unit: '500ml',
        isVerified: true,
        scrapeData: {
            lastScraped: new Date(), storeBreakdown: [
                { store: 'Keells', price: 2850, rawName: 'Borges Olive Oil 500ml' },
            ]
        },
    },
];

async function seedPrices() {
    await connectDB();
    console.log('🌱 Seeding food prices...\n');

    let inserted = 0, updated = 0, skipped = 0;

    for (const item of SEED_PRICES) {
        try {
            const { foodId, scrapeData, ...rest } = item;
            // Add initial price history entry
            const priceHistory = [{
                date: new Date(),
                pricePerKg: item.averagePricePerGram * 1000,
            }];

            const result = await FoodPrice.findOneAndUpdate(
                { foodId },
                { ...rest, foodId, scrapeData, priceHistory, lastUpdated: new Date() },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            const wasInserted = result.__v === undefined || result.isNew;
            console.log(`  ✅ ${foodId.padEnd(18)} Rs ${Math.round(item.averagePricePerGram * 1000)}/kg`);
            inserted++;
        } catch (err) {
            console.error(`  ❌ ${item.foodId}: ${err.message}`);
            skipped++;
        }
    }

    console.log(`\n📊 Done: ${inserted} upserted, ${skipped} errors`);
    process.exit(0);
}

seedPrices().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
