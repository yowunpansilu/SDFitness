/**
 * Seed data for ~20 core food items used in meal plans.
 * Nutrition data from USDA FoodData Central.
 * Prices are approximate LKR values for Sri Lankan supermarkets.
 *
 * Run: node scripts/seedFoodPrices.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../config/db');
const FoodPrice = require('../models/FoodPrice');

const coreFoods = [
    {
        foodId: 'chicken_breast',
        name: 'Chicken Breast',
        category: 'protein',
        nutritionPer100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
        aliases: ['chicken breast', 'breast fillet', 'chicken fillet', 'boneless chicken'],
        prices: [{ store: 'Keells', pricePerUnit: 1450, unit: 'kg', pricePerGram: 1.45, source: 'manual', isAvailable: true }],
        isVerified: true
    },
    {
        foodId: 'eggs',
        name: 'Eggs',
        category: 'protein',
        nutritionPer100g: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
        aliases: ['egg', 'eggs', 'free range eggs', 'farm eggs'],
        prices: [{ store: 'Keells', pricePerUnit: 45, unit: 'piece', pricePerGram: 0.75, source: 'manual', isAvailable: true }],
        isVerified: true
    },
    {
        foodId: 'brown_rice',
        name: 'Brown Rice',
        category: 'carbs',
        nutritionPer100g: { calories: 370, protein: 7.9, carbs: 77, fat: 2.9, fiber: 3.5 },
        aliases: ['brown rice', 'red raw rice', 'whole grain rice'],
        prices: [{ store: 'Keells', pricePerUnit: 380, unit: 'kg', pricePerGram: 0.38, source: 'manual', isAvailable: true }],
        isVerified: true
    },
    {
        foodId: 'white_rice',
        name: 'White Rice',
        category: 'carbs',
        nutritionPer100g: { calories: 365, protein: 7.1, carbs: 80, fat: 0.7, fiber: 1.3 },
        aliases: ['white rice', 'samba rice', 'basmati rice', 'polished rice'],
        prices: [{ store: 'Keells', pricePerUnit: 290, unit: 'kg', pricePerGram: 0.29, source: 'manual', isAvailable: true }],
        isVerified: true
    },
    {
        foodId: 'oats',
        name: 'Oats',
        category: 'carbs',
        nutritionPer100g: { calories: 389, protein: 16.9, carbs: 66, fat: 6.9, fiber: 10.6 },
        aliases: ['oats', 'rolled oats', 'oatmeal', 'porridge oats'],
        prices: [{ store: 'Keells', pricePerUnit: 620, unit: 'kg', pricePerGram: 0.62, source: 'manual', isAvailable: true }],
        isVerified: true
    },
    {
        foodId: 'red_lentils',
        name: 'Red Lentils (Dhal)',
        category: 'protein',
        nutritionPer100g: { calories: 352, protein: 25, carbs: 63, fat: 1.1, fiber: 10.7 },
        aliases: ['dhal', 'dal', 'lentils', 'red lentils', 'masoor dal', 'parippu'],
        prices: [{ store: 'Keells', pricePerUnit: 550, unit: 'kg', pricePerGram: 0.55, source: 'manual', isAvailable: true }],
        isVerified: true
    },
    {
        foodId: 'spinach',
        name: 'Spinach',
        category: 'vegetable',
        nutritionPer100g: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
        aliases: ['spinach', 'gotukola', 'green leaves', 'nivithi'],
        prices: [{ store: 'Keells', pricePerUnit: 280, unit: 'kg', pricePerGram: 0.28, source: 'manual', isAvailable: true }],
        isVerified: true
    },
    {
        foodId: 'broccoli',
        name: 'Broccoli',
        category: 'vegetable',
        nutritionPer100g: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
        aliases: ['broccoli', 'broccoli florets'],
        prices: [{ store: 'Keells', pricePerUnit: 750, unit: 'kg', pricePerGram: 0.75, source: 'manual', isAvailable: true }],
        isVerified: true
    },
    {
        foodId: 'sweet_potato',
        name: 'Sweet Potato',
        category: 'carbs',
        nutritionPer100g: { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3 },
        aliases: ['sweet potato', 'bathala', 'yam'],
        prices: [{ store: 'Keells', pricePerUnit: 320, unit: 'kg', pricePerGram: 0.32, source: 'manual', isAvailable: true }],
        isVerified: true
    },
    {
        foodId: 'banana',
        name: 'Banana',
        category: 'fruit',
        nutritionPer100g: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
        aliases: ['banana', 'ripe banana', 'plantain', 'kesel'],
        prices: [{ store: 'Keells', pricePerUnit: 180, unit: 'kg', pricePerGram: 0.18, source: 'manual', isAvailable: true }],
        isVerified: true
    },
    {
        foodId: 'whole_milk',
        name: 'Whole Milk',
        category: 'dairy',
        nutritionPer100g: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0 },
        aliases: ['full cream milk', 'fresh milk', 'whole milk', 'milk'],
        prices: [{ store: 'Keells', pricePerUnit: 320, unit: 'liter', pricePerGram: 0.32, source: 'manual', isAvailable: true }],
        isVerified: true
    },
    {
        foodId: 'yogurt',
        name: 'Plain Yogurt',
        category: 'dairy',
        nutritionPer100g: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0 },
        aliases: ['yogurt', 'curd', 'plain yogurt', 'meekiri'],
        prices: [{ store: 'Keells', pricePerUnit: 440, unit: 'kg', pricePerGram: 0.44, source: 'manual', isAvailable: true }],
        isVerified: true
    },
    {
        foodId: 'tofu',
        name: 'Tofu',
        category: 'protein',
        nutritionPer100g: { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3 },
        aliases: ['tofu', 'bean curd', 'soy paneer'],
        prices: [{ store: 'Keells', pricePerUnit: 480, unit: 'kg', pricePerGram: 0.48, source: 'manual', isAvailable: true }],
        isVerified: true
    },
    {
        foodId: 'canned_tuna',
        name: 'Canned Tuna',
        category: 'protein',
        nutritionPer100g: { calories: 116, protein: 26, carbs: 0, fat: 1, fiber: 0 },
        aliases: ['tuna', 'canned tuna', 'tuna fish', 'tuna chunks'],
        prices: [{ store: 'Keells', pricePerUnit: 390, unit: '185g', pricePerGram: 2.11, source: 'manual', isAvailable: true }],
        isVerified: true
    },
    {
        foodId: 'bread_wholemeal',
        name: 'Wholemeal Bread',
        category: 'carbs',
        nutritionPer100g: { calories: 247, protein: 13, carbs: 41, fat: 3.4, fiber: 7 },
        aliases: ['bread', 'wholemeal bread', 'whole wheat bread', 'brown bread'],
        prices: [{ store: 'Keells', pricePerUnit: 280, unit: 'loaf', pricePerGram: 0.56, source: 'manual', isAvailable: true }],
        isVerified: true
    },
    {
        foodId: 'olive_oil',
        name: 'Olive Oil',
        category: 'fats',
        nutritionPer100g: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
        aliases: ['olive oil', 'extra virgin olive oil'],
        prices: [{ store: 'Keells', pricePerUnit: 2800, unit: 'liter', pricePerGram: 2.80, source: 'manual', isAvailable: true }],
        isVerified: true
    },
    {
        foodId: 'coconut_oil',
        name: 'Coconut Oil',
        category: 'fats',
        nutritionPer100g: { calories: 862, protein: 0, carbs: 0, fat: 100, fiber: 0 },
        aliases: ['coconut oil', 'pol thel'],
        prices: [{ store: 'Keells', pricePerUnit: 680, unit: 'liter', pricePerGram: 0.68, source: 'manual', isAvailable: true }],
        isVerified: true
    },
    {
        foodId: 'chicken_thigh',
        name: 'Chicken Thigh',
        category: 'protein',
        nutritionPer100g: { calories: 209, protein: 26, carbs: 0, fat: 10.9, fiber: 0 },
        aliases: ['chicken thigh', 'chicken leg', 'dark meat chicken'],
        prices: [{ store: 'Keells', pricePerUnit: 1200, unit: 'kg', pricePerGram: 1.20, source: 'manual', isAvailable: true }],
        isVerified: true
    },
    {
        foodId: 'carrot',
        name: 'Carrot',
        category: 'vegetable',
        nutritionPer100g: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 },
        aliases: ['carrot', 'carrots'],
        prices: [{ store: 'Keells', pricePerUnit: 350, unit: 'kg', pricePerGram: 0.35, source: 'manual', isAvailable: true }],
        isVerified: true
    },
    {
        foodId: 'peanut_butter',
        name: 'Peanut Butter',
        category: 'fats',
        nutritionPer100g: { calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6 },
        aliases: ['peanut butter', 'peanut spread'],
        prices: [{ store: 'Keells', pricePerUnit: 950, unit: '400g', pricePerGram: 2.38, source: 'manual', isAvailable: true }],
        isVerified: true
    }
];

const seedFoodPrices = async () => {
    try {
        await connectDB();
        console.log('🗑️  Clearing existing food prices...');
        await FoodPrice.deleteMany({});

        console.log(`🌱 Seeding ${coreFoods.length} core food items...`);
        for (const food of coreFoods) {
            const doc = new FoodPrice(food);
            await doc.save(); // triggers the pre-save hook to calculate averages
        }

        console.log(`✅ Seeded ${coreFoods.length} food items successfully!`);

        // Verify
        const count = await FoodPrice.countDocuments();
        const sample = await FoodPrice.findOne({ foodId: 'chicken_breast' });
        console.log(`📊 Total documents: ${count}`);
        console.log(`📊 Sample — chicken_breast averagePricePerGram: ${sample.averagePricePerGram}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
};

seedFoodPrices();
