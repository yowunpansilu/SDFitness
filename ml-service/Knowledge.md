# Scraper Status & Knowledge Base

## Overview
This document tracks the current state, findings, and test results for the SDFitness Price Scraper within the `ml-service`.

## Current Status (2026-03-24)
- **Service**: ML Service is running in Docker (port 5001). `/health` is OK.
- **Scraper**: The existing scraper is **broken** (returns 0 items or hangs).
- **Backend**: Backend is running (port 5005).

---

## 🔍 Findings so Far

### Keells Super (https://www.keellssuper.com)
- **Status**: Code exists but returns 0 items.
- **Issue**: 
    - The price selector in `price_scraper.py` (`.product-card-final-priceV2`) was found to be slightly outdated.
    - The actual price element is now `.product-card-amountV2`.
    - **Initial Hang**: When `scrapling` (headless browser) fetches the page, it often gets caught on the loading spinner (`sk-cube-grid`).
- **New Recommended Selectors (V2 Architecture)**:
    - **Product Card**: `.product-cardV2`
    - **Product Column**: `.product-colV2`
    - **Name**: `.product-card-nameV2`
    - **Price**: `.product-card-amountV2`
    - **Add Button**: `.product-card-button-addV2`
- **Internal API Discovery**:
    - **Endpoint**: `https://zebraliveback.keellssuper.com/2.0/WebV2/GetItemDetails`
    - **Benefit**: Provides structured JSON directly (highly robust compared to DOM scraping).

### Cargills Online (https://cargillsonline.com)
- **Status**: Code exists but not actively test-validated yet.
- **Findings**:
    - High anti-bot and SPA-heavy site.
    - The current `item_selector` (`.product-card-price-containerV2`) seems correct, but needs a very stable `wait_selector` for the JS to finish rendering.

---

## 🧪 Tests Performed

### 1. Locally Run Scraper
- **Action**: Tried running `scrapers/run_scraper.py` using local venv.
- **Result**: FAILED with `ImportError: dlopen` (likely a venv/numpy issue on the host system).
- **Outcome**: Switched to running and debugging inside the Docker container for environment consistency.

### 2. Manual Scrape Test (Inside Docker)
- **Action**: Created `test_scrape.py` script and executed it via `docker exec`.
- **Result**: Confirmed that `scrapling` hits the loading spinner if no long-wait/retry is used.
- **Outcome**: Verified that the selectors in the code need mapping to the latest "V2" structure.

### 3. Trigger Scrape via API
- **Action**: `POST /scrape` with `dry_run: true`.
- **Result**: The job starts in the background but hangs or takes exceptionally long (likely due to the scraper being unable to find items or hitting timeouts on the loading screen).

---

## 🛠️ Planned Fixes (Next Steps)
1. **Selector Update**: Update `STORE_CONFIGS` in `price_scraper.py` for Keells (specifically the price selector).
2. **Robustness Improvement**: Add explicit `wait_selector` for the real content (e.g., search results) to avoid grabbing the loading screen.
3. **Store Selection**: Restrict to one working store first to ensure the end-to-end "Match -> Push to Backend" pipeline works.
