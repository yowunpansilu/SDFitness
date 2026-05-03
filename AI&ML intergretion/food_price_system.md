# SDFitness: Real-Time Food Price Tracking System
## Budget-Aware Shopping List Architecture

---

## The Problem with Static Prices

If you hardcode food prices (e.g., "chicken is $3/kg"), they become stale within days.  
A member's shopping list might show **LKR 8,000** but actually cost **LKR 11,000** at the store next week.  
That's a broken budget guarantee — unacceptable for an "AI that respects your budget."

**The solution:** Store food prices in MongoDB, refresh them automatically, and re-calculate the shopping list total whenever prices change.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     Price Data Sources                            │
│  [Supermarket Websites]  [Open Food Facts API]  [Manual Admin]   │
└────────────┬─────────────────┬──────────────────────┬────────────┘
             │ Web Scraper     │ Webhook / API Poll    │ Admin UI
             ▼                 ▼                       ▼
┌──────────────────────────────────────────────────────────────────┐
│              Node.js Price Ingestion Service (NEW)               │
│         Runs on a CRON schedule (e.g., every 12 hours)           │
│  - Normalizes price per 100g                                     │
│  - Validates data quality                                        │
│  - Stores to MongoDB foodPrices collection                       │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                  MongoDB: foodPrices Collection                   │
│  { foodId, name, pricePerUnit, unit, store, currency,            │
│    lastUpdated, source, isAvailable }                            │
└──────┬────────────────────────────────────────────────┬──────────┘
       │ ML Service reads prices                         │ Budget engine reads prices
       ▼                                                 ▼
┌─────────────────────┐                    ┌──────────────────────────┐
│  Python ML Service  │                    │  Node.js Budget Engine   │
│  Uses LIVE prices   │                    │  Recalculates shopping   │
│  during food        │                    │  list when prices change │
│  selection/scoring  │                    └──────────────────────────┘
└─────────────────────┘
```

---

## MongoDB Schema: foodPrices Collection

```javascript
// foodPrices collection document
{
  _id: ObjectId,
  foodId: "chicken_breast",          // matches food in USDA/your food DB
  name: "Chicken Breast",
  aliases: ["chicken", "breast fillet"],  // for fuzzy matching
  
  prices: [
    {
      store: "Keells Super",
      pricePerUnit: 1450,            // LKR
      unit: "kg",
      pricePerGram: 1.45,            // always normalize to per gram
      lastUpdated: ISODate("2026-02-24"),
      isAvailable: true,
      source: "scraper"
    },
    {
      store: "Arpico",
      pricePerUnit: 1380,
      unit: "kg", 
      pricePerGram: 1.38,
      lastUpdated: ISODate("2026-02-24"),
      isAvailable: true,
      source: "manual"
    }
  ],
  
  averagePricePerGram: 1.42,         // calculated average across stores
  lowestPricePerGram: 1.38,          // cheapest option
  currency: "LKR",
  category: "protein",               // protein / carb / fat / vegetable / fruit / dairy
  isVerified: true,                  // admin confirmed accuracy
  createdAt: ISODate,
  updatedAt: ISODate
}
```

---

## How Prices Enter the System: 3 Methods

### Method 1: Full Catalog Web Scraper (Recommended for Sri Lanka)
**Target sites:** Keells Online, Arpico Online, LAUGFS Supermarket

Instead of a hardcoded list of individual product URLs, the scraper **crawls category pages** and dynamically discovers all products — including new ones added to the store. Built in Node.js using **Cheerio** (or **Puppeteer** if the site uses JavaScript rendering). Runs via a **CRON job** every 12 hours.

#### Step 1 — Discover Product URLs from Category Pages

```javascript
// backend/services/priceScraperService.js
const cheerio = require('cheerio');
const axios = require('axios');
const cron = require('node-cron');

// Only maintain category-level URLs, not individual products
const CATEGORY_URLS = [
  'https://www.keells.com/category/meat-seafood',
  'https://www.keells.com/category/rice-grains',
  'https://www.keells.com/category/vegetables',
  'https://www.keells.com/category/dairy-eggs',
  'https://www.keells.com/category/fruits',
];

// Crawl a category page and recursively follow pagination
async function discoverProductUrls(categoryUrl) {
  const { data } = await axios.get(categoryUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const $ = cheerio.load(data);
  const productUrls = [];

  $('.product-card a, .product-item a').each((_, el) => {
    const href = $(el).attr('href');
    if (href) productUrls.push(new URL(href, 'https://www.keells.com').href);
  });

  // Follow "Next Page" pagination automatically
  const nextPage = $('.pagination .next').attr('href');
  if (nextPage) {
    const more = await discoverProductUrls(nextPage);
    productUrls.push(...more);
  }

  return [...new Set(productUrls)]; // deduplicate
}
```

#### Step 2 — Scrape Each Product Page

```javascript
async function scrapeProductPage(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  return {
    name:  $('h1.product-name').text().trim(),
    price: parseFloat($('.price').text().replace(/[^0-9.]/g, '')),
    unit:  $('.unit-label').text().trim() || 'kg',
    url
  };
}
```

#### Step 3 — Fuzzy Match Store Name → Your Food Database ID

The store sells `"Cargills Real Chicken Breast Fillets 500g"` but your ML model knows it as `"chicken_breast"`. You maintain a small **alias mapping table** instead of individual URLs:

```javascript
// backend/services/foodMatcherService.js
const stringSimilarity = require('string-similarity');

const FOOD_ALIASES = {
  'chicken_breast': ['chicken breast', 'breast fillet', 'chicken fillet'],
  'brown_rice':     ['brown rice', 'red raw rice', 'basmati'],
  'eggs':           ['egg', 'eggs', 'free range eggs'],
  'whole_milk':     ['full cream milk', 'fresh milk'],
  'red_lentils':    ['dhal', 'dal', 'lentils'],
  'spinach':        ['spinach', 'gotukola', 'green leaves'],
  // ~20-30 core food aliases covers 80% of meal plan ingredients
};

function fuzzyMatchToFoodId(scrapedName) {
  const nameLower = scrapedName.toLowerCase();
  let bestMatch = null, bestScore = 0;

  for (const [foodId, aliases] of Object.entries(FOOD_ALIASES)) {
    for (const alias of aliases) {
      const score = stringSimilarity.compareTwoStrings(nameLower, alias);
      if (score > bestScore) { bestScore = score; bestMatch = foodId; }
    }
  }
  return bestScore > 0.6 ? bestMatch : null; // null = send to admin review queue
}
```

Unmatched products go into an **admin review queue** — admin links `"Cargills Chicken Fillets"` → `chicken_breast` once, and it's permanently mapped. New products on the site are caught automatically on the next crawl.

#### Step 4 — Full Pipeline (CRON)

```javascript
cron.schedule('0 0,12 * * *', async () => {
  console.log('🔄 Running full catalog scrape...');
  for (const categoryUrl of CATEGORY_URLS) {
    const productUrls = await discoverProductUrls(categoryUrl);
    for (const url of productUrls) {
      await sleep(1500);                          // rate-limit: be polite
      const product = await scrapeProductPage(url);
      const foodId = fuzzyMatchToFoodId(product.name);
      if (foodId) {
        await upsertFoodPrice({ ...product, foodId, source: 'scraper_catalog' });
      } else {
        await addToAdminReviewQueue(product);     // unknown product → review
      }
    }
  }
});
```

**Benefits of catalog scraping over hardcoded URLs:**
- ✅ Automatically picks up new products added to the store
- ✅ No URL list to maintain — only the alias table
- ✅ Covers the entire store inventory, not just pre-selected items
- ✅ Scales to multiple supermarket sites with the same pattern

**Handling scraper failures gracefully:**
- Rotate User-Agent strings to avoid blocks
- Random delays between `1000–3000ms`
- Switch to Puppeteer (headless browser) if Cheerio fails on JS-rendered pages
- Admin manual prices always serve as fallback so the system never breaks

> **Note for presentation:** Full catalog crawling with fuzzy matching and a review queue demonstrates real-world engineering thinking — not just a simple GET request to a fixed URL.

---

### Method 2: Open Food Facts API (Free Webhook/API)
Open Food Facts has a free API with prices for many foods.

```javascript
// backend/services/openFoodFactsService.js
async function fetchOpenFoodFactsPrice(barcode) {
  const res = await axios.get(
    `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
  );
  return res.data.product;
}
```

Good for **branded packaged foods** (oats, canned goods, protein powder).  
Less useful for fresh produce — that still needs scraping or manual input.

---

### Method 3: Admin Manual Entry (Always Available as Fallback)
In your existing Admin Panel, add a **"Food Prices"** management page:
- Admin can search for a food item
- Enter price per unit + store name
- Mark as verified
- Set expiry date (e.g., price valid for 7 days)

This is the academic safety net — even if scraping breaks, prices stay current via admin.

---

## How the ML Model Uses Live Prices

The Python ML service, when it receives a diet plan request, **fetches current prices from MongoDB** before scoring foods:

```python
# ml-service/recommender.py

# Live prices are passed directly in the POST request payload from Node.js
# This avoids circular HTTP dependencies and keeps the ML service stateless.
def score_food_for_budget(food, live_prices_dict, user_budget_per_day, portion_grams):
    # Fallback to historical data if live price isn't in the payload
    live_price = live_prices_dict.get(food['id'], food['fallback_price_per_gram'])
    
    meal_cost = live_price * portion_grams
    budget_per_meal = user_budget_per_day / 4  # assume 4 meals/day
    
    # Higher score = better budget fit
    budget_score = 1.0 - min(meal_cost / budget_per_meal, 1.0)
    return budget_score
```

The ML model **combines** nutrition score + budget score to rank foods.  
If chicken prices spike this week, the model will naturally recommend cheaper proteins (lentils, eggs, tofu).

---

## Shopping List: Dynamic Budget Recalculation

### When a Plan is Generated (New Plan)
```
ML Model picks foods + portions
  → Fetch current prices from MongoDB
  → Calculate exact cost per ingredient
  → Sum = total shopping list cost
  → If total > budget: remove costly items, replace with cheaper alternatives
  → Final shopping list saved to MongoDB with priceSnapshot (today's prices)
```

### When Prices Change (Existing Plans)
A **price change watcher** runs whenever the scraper updates prices:

```javascript
// backend/services/priceWatcherService.js

async function onPriceUpdated(foodId, newPrice) {
  // Find all active shopping lists that contain this food
  const affectedPlans = await DietPlan.find({
    'shoppingList.foodId': foodId,
    status: 'active'
  });

  for (const plan of affectedPlans) {
    // Recalculate total
    const newTotal = recalculateShoppingListTotal(plan.shoppingList, newPrice);
    
    // Update the plan
    await DietPlan.updateOne({ _id: plan._id }, {
      'shoppingList.total': newTotal,
      'shoppingList.lastPriceUpdate': new Date(),
      'shoppingList.priceChanged': true  // flag for frontend to show notification
    });
    
    // Notify member if cost went over budget by >10%
    if (newTotal > plan.budget * 1.10) {
      await notificationService.send(plan.memberId, {
        type: 'BUDGET_ALERT',
        message: `⚠️ Price changes have increased your shopping list cost to LKR ${newTotal}. Consider regenerating your plan.`,
        data: { planId: plan._id, newTotal }
      });
    }
  }
}
```

### Frontend: Live Price Badge
In the React shopping list UI, show:
```
🛒 Your Shopping List           Total: LKR 9,840
                                ⚠️ Prices updated 2 hours ago
                                Budget: LKR 10,000 ✅

[ ] Chicken Breast   400g   LKR 580    📈 +LKR 40 since your plan was made
[ ] Brown Rice       500g   LKR 160
[ ] Broccoli         300g   LKR 210
...
[ Regenerate Plan with Current Prices ]
```

---

## Database: New Collections & Modified Collections

### New: `foodPrices` collection
Stores all food prices with history (see schema above).

### New: `priceLogs` collection
```javascript
{
  foodId: "chicken_breast",
  store: "Keells",
  oldPrice: 1380,
  newPrice: 1450,
  changePercent: +5.07,
  changedAt: ISODate,
  source: "scraper"
}
```
This gives you **price trend data** — great for analytics ("chicken prices rose 15% this month").

### Modified: `dietPlans` collection — add:
```javascript
{
  // ... existing fields ...
  shoppingList: {
    items: [
      {
        foodId: "chicken_breast",
        name: "Chicken Breast",
        quantity: 400,
        unit: "g",
        priceAtGeneration: 580,   // LKR — price when plan was made
        currentPrice: 620,         // LKR — live price from foodPrices
        store: "Keells",           // cheapest store recommendation
        category: "protein"
      }
    ],
    totalAtGeneration: 9800,       // original total when plan was created
    currentTotal: 10100,           // recalculated with live prices
    budget: 10000,                 // user's stated budget
    currency: "LKR",
    lastPriceUpdate: ISODate,
    priceChanged: true             // flag for frontend notification
  }
}
```

---

## New API Endpoints (Node.js)

```
GET  /api/prices                     List all food prices (paginated)
GET  /api/prices/:foodId             Get price for specific food
GET  /api/prices/batch?ids=a,b,c     Get prices for multiple foods
POST /api/prices                     Admin: manually set a price
PUT  /api/prices/:foodId             Admin: update a price
GET  /api/prices/:foodId/history     Price history / trend chart data
POST /api/prices/trigger-scrape      Admin: manually trigger price scraper
GET  /api/diet-plans/:id/cost        Recalculate current cost of a plan's shopping list
```

---

## What This Adds to the Academic Narrative

> *"Unlike static diet plan generators, SDFitness implements a real-time food price tracking system. Food prices are automatically updated via a scheduled web scraper targeting local supermarket websites, supplemented by the Open Food Facts API and manual admin input. These live prices are stored in MongoDB and fed directly into our ML model's budget scoring function. When food prices change, affected shopping lists are automatically recalculated, and members are notified if their plan exceeds budget — ensuring our budget guarantee is real, not hypothetical."*

**Key selling points for the panel:**
1. 📊 **Price elasticity** — you can show how the ML model adapts recommendations when prices spike
2. 🔔 **Proactive alerts** — system detects budget overruns from price changes automatically  
3. 📈 **Price trend data** — analytics on food price movements over time
4. ⚡ **Real-time** — shopping list total is never stale
5. 🛡️ **Graceful fallback** — if scraper fails, admin prices are used; if no admin price, last known price with a warning

---

## Scope Note

> [!NOTE]
> The catalog scraper will discover **all products** on the supermarket site automatically. The only thing you maintain manually is the **alias mapping table** (`FOOD_ALIASES`) — approximately 30-50 entries covering the common foods used in meal plans. Unrecognized products flow to the admin review queue and get linked on first encounter.
>
> **Core alias seeds to start with:** chicken breast, eggs, brown rice, white rice, oats, lentils (dhal), spinach, broccoli, sweet potato, banana, milk, yogurt, tofu, canned tuna, bread, olive oil — these 16 cover the majority of meal plan ingredients immediately.
