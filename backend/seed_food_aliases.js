/**
 * SDFitness — Food Alias + Scraper Config Seeder
 *
 * Populates two Atlas collections:
 *   - foodaliases   (managed by FoodAlias.js Mongoose model)
 *   - scraper_config  (key/value config consumed by ml-service at runtime)
 *
 * Run once (safe to re-run — all writes use upsert):
 *   cd backend && node seed_food_aliases.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('❌  MONGO_URI not set in .env');
    process.exit(1);
}

// ─── Schemas ─────────────────────────────────────────────────────────────────

const foodAliasSchema = new mongoose.Schema(
    {
        foodId: { type: String, required: true, trim: true, lowercase: true },
        alias: { type: String, required: true, unique: true, trim: true, lowercase: true },
        category: { type: String, required: true },
        addedBy: { type: String, default: 'seed' },
    },
    { timestamps: true, collection: 'foodaliases' }
);

const scraperConfigSchema = new mongoose.Schema(
    {
        key: { type: String, required: true, unique: true },
        value: { type: mongoose.Schema.Types.Mixed, required: true },
        updatedBy: { type: String, default: 'seed' },
    },
    { timestamps: true, collection: 'scraper_config' }
);

const FoodAlias = mongoose.model('FoodAlias', foodAliasSchema);
const ScraperConfig = mongoose.model('ScraperConfig', scraperConfigSchema);

// ─── Alias Source Data ────────────────────────────────────────────────────────
// Each entry maps one foodId → category → N alias strings.
// Expanding these into individual FoodAlias documents (one row per alias)
// gives O(1) exact lookups and easy admin-panel CRUD.

const ALIAS_DATA = [
    {
        foodId: 'chicken_breast', category: 'protein',
        aliases: [
            'chicken breast', 'boneless chicken', 'chicken fillet', 'chicken kfc style',
            'breast chicken', 'skinless chicken breast', 'chilled chicken breast',
            'chicken drumstick', 'chicken thigh', 'chicken whole', 'broiler chicken',
            'farm chicken',
        ],
    },
    {
        foodId: 'chicken_thigh', category: 'protein',
        aliases: ['chicken thigh', 'chicken thighs', 'boneless thigh', 'chicken leg', 'thigh fillet'],
    },
    {
        foodId: 'eggs', category: 'protein',
        aliases: [
            'egg', 'eggs', 'free range eggs', 'farm eggs', 'chicken eggs',
            'brown eggs', 'white eggs', '10 eggs', '6 eggs', 'dozen eggs',
            'omega eggs', 'village eggs',
        ],
    },
    {
        foodId: 'canned_tuna', category: 'protein',
        aliases: [
            'tuna', 'canned tuna', 'tuna chunks', 'tuna in brine', 'tuna in oil',
            'john west tuna', 'elephant house tuna', 'diana tuna', 'skipjack tuna',
            'yellowfin tuna', 'tuna flakes',
        ],
    },
    {
        foodId: 'red_lentils', category: 'protein',
        aliases: [
            'dhal', 'dal', 'red lentils', 'masoor dal', 'parippu',
            'red dal', 'lentils', 'yellow lentils', 'sathosa parippu',
        ],
    },
    {
        foodId: 'tofu', category: 'protein',
        aliases: ['tofu', 'firm tofu', 'silken tofu', 'soy tofu', 'bean curd', 'tofu block'],
    },
    {
        foodId: 'soy_meat', category: 'protein',
        aliases: [
            'soy meat', 'soya meat', 'textured vegetable protein', 'tvp',
            'lanka soy', 'soya chunks',
        ],
    },
    {
        foodId: 'white_rice', category: 'carbs',
        aliases: [
            'white rice', 'samba rice', 'keeri samba', 'sudu kakulu',
            'basmati rice', 'ponni rice', 'steamed rice', 'raw rice',
            'parboiled rice', 'nadu rice',
        ],
    },
    {
        foodId: 'brown_rice', category: 'carbs',
        aliases: [
            'brown rice', 'whole grain rice', 'unpolished rice',
            'red raw rice', 'brown basmati', 'hand pounded rice',
        ],
    },
    {
        foodId: 'oats', category: 'carbs',
        aliases: [
            'oats', 'rolled oats', 'oatmeal', 'instant oats',
            'steel cut oats', 'porridge oats', 'whole oats',
        ],
    },
    {
        foodId: 'sweet_potato', category: 'carbs',
        aliases: [
            'sweet potato', 'sweet potatoes', 'yam', 'orange sweet potato',
            'batala', 'bathala', 'kumara', 'purple sweet potato',
        ],
    },
    {
        foodId: 'bread_wholemeal', category: 'carbs',
        aliases: [
            'wholemeal bread', 'whole wheat bread', 'brown bread', 'wheat bread',
            'high fibre bread', 'wholegrain bread', 'multi grain bread',
            'white bread', 'toast bread', 'harvest bread',
        ],
    },
    {
        foodId: 'spinach', category: 'vegetable',
        aliases: [
            'spinach', 'baby spinach', 'fresh spinach', 'palak', 'nivithi',
            'saag', 'kangkung', 'water spinach', 'mukunuwenna', 'leafy greens',
        ],
    },
    {
        foodId: 'carrot', category: 'vegetable',
        aliases: ['carrot', 'carrots', 'baby carrots', 'fresh carrots', 'orange carrot'],
    },
    {
        foodId: 'broccoli', category: 'vegetable',
        aliases: ['broccoli', 'fresh broccoli', 'broccoli florets', 'green broccoli'],
    },
    {
        foodId: 'banana', category: 'fruit',
        aliases: [
            'banana', 'bananas', 'ambul banana', 'kolikuttu', 'seeni banana',
            'ripe banana', 'cavendish banana', 'raw banana', 'plantain', 'kesel',
        ],
    },
    {
        foodId: 'papaya', category: 'fruit',
        aliases: ['papaya', 'pawpaw', 'ripe papaya', 'papaw'],
    },
    {
        foodId: 'whole_milk', category: 'dairy',
        aliases: [
            'milk', 'whole milk', 'fresh milk', 'full cream milk', 'cow milk',
            'full fat milk', 'uht milk', '1l milk', 'low fat milk',
        ],
    },
    {
        foodId: 'yogurt', category: 'dairy',
        aliases: [
            'yogurt', 'yoghurt', 'plain yogurt', 'curd', 'dahi',
            'low fat yogurt', 'greek yogurt', 'set yogurt', 'buffalo curd', 'cow curd',
        ],
    },
    {
        foodId: 'butter', category: 'dairy',
        aliases: ['butter', 'unsalted butter', 'salted butter'],
    },
    {
        foodId: 'coconut_oil', category: 'fats',
        aliases: [
            'coconut oil', 'virgin coconut oil', 'vco', 'pol tel', 'pol thel',
            'refined coconut oil', 'pure coconut oil', 'coco oil', 'coconut cooking oil',
        ],
    },
    {
        foodId: 'coconut_milk', category: 'fats',
        aliases: [
            'coconut milk', 'thick coconut milk', 'thin coconut milk',
            'coconut cream', 'kiri',
        ],
    },
    {
        foodId: 'olive_oil', category: 'fats',
        aliases: ['olive oil', 'extra virgin olive oil', 'evoo', 'pure olive oil', 'light olive oil'],
    },
    {
        foodId: 'peanut_butter', category: 'fats',
        aliases: [
            'peanut butter', 'peanut paste', 'smooth peanut butter',
            'crunchy peanut butter', 'groundnut paste',
        ],
    },
];

// ─── Scraper Config Entries ───────────────────────────────────────────────────
// Consumed at runtime by ml-service/scrapers/config_loader.py
// Add/change values here — Python picks up on next restart.

const SCRAPER_CONFIG = [
    {
        key: 'brand_prefixes',
        value: [
            'keells', 'cargills', 'arpico', 'sathosa', 'prima', 'anchor',
            'highland', 'ambewela', 'ranfer', 'massimo', 'cocomax',
            'maggi', 'nestlé', 'nestle', 'diana', 'parachute',
        ],
    },
    {
        key: 'fuzzy_threshold',
        value: 0.60,
    },
    {
        key: 'category_hint_relaxation',
        value: 0.10,          // subtract from threshold when category_hint is given
    },
    {
        key: 'uom_to_grams',   // conversion map for WeightExtractor
        value: { kg: 1000, g: 1, l: 1000, ml: 1, litre: 1000, liter: 1000 },
    },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log('✅  Connected to Atlas');

    // -- foodaliases --
    console.log('\n📌  Seeding foodaliases...');
    const aliasOps = ALIAS_DATA.flatMap(({ foodId, category, aliases }) =>
        aliases.map(alias => ({
            updateOne: {
                filter: { alias },
                update: { $set: { foodId, category, addedBy: 'seed', alias } },
                upsert: true,
            },
        }))
    );
    const aliasResult = await FoodAlias.bulkWrite(aliasOps, { ordered: false });
    const totalAliases = aliasOps.length;
    console.log(`   ✅  ${aliasResult.upsertedCount} inserted, ${aliasResult.modifiedCount} updated (${totalAliases} total aliases)`);

    // -- scraper_config --
    console.log('\n⚙️   Seeding scraper_config...');
    const configOps = SCRAPER_CONFIG.map(({ key, value }) => ({
        updateOne: {
            filter: { key },
            update: { $set: { key, value, updatedBy: 'seed' } },
            upsert: true,
        },
    }));
    const configResult = await ScraperConfig.bulkWrite(configOps, { ordered: false });
    console.log(`   ✅  ${configResult.upsertedCount} inserted, ${configResult.modifiedCount} updated (${SCRAPER_CONFIG.length} config keys)`);

    // -- summary --
    const aliasCount = await FoodAlias.countDocuments();
    const configCount = await ScraperConfig.countDocuments();
    console.log('\n📊  Atlas Summary:');
    console.log(`   foodaliases    : ${aliasCount} documents`);
    console.log(`   scraper_config : ${configCount} documents`);

    await mongoose.disconnect();
    console.log('\n✅  Seeding complete. ml-service will pick up config on next restart.');
}

seed().catch(err => {
    console.error('❌  Seed failed:', err.message);
    process.exit(1);
});
