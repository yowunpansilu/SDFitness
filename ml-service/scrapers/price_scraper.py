"""
Phase 2.1 — Price Scraper using Scrapling
Targets: Keells, Cargills, Sathosa, Arpico (Sri Lankan supermarkets)

Strategy:
  - StealthyFetcher for JS-heavy / anti-bot protected sites
  - Fetcher (fast HTTP) for simpler sites
  - Results fuzzy-matched against FOOD_ALIASES
  - Unmatched items → saved to review queue via backend API
  - Runs as a scheduled job (called from Flask /scrape endpoint)

Run manually:
    cd ml-service
    python scrapers/price_scraper.py
"""

import asyncio
import json
import os
import logging
from datetime import datetime, timezone
from typing import Optional, List
import requests as http_requests

from scrapers.food_aliases import fuzzy_match_to_food_id, get_all_food_ids

# ─────────────────────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────────────────────
BACKEND_API = os.getenv("BACKEND_URL", "http://localhost:5000")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

logging.basicConfig(level=LOG_LEVEL, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# Store definitions — selectors tuned per site
# Each store entry: { name, url_template, item_selector, name_sel, price_sel, use_stealth }
# ─────────────────────────────────────────────────────────────────────────────
STORE_CONFIGS = [
    {
        "store": "Keells",
        # Keells Super grocery site — search URL format: /product?s=~QUERY
        "search_url": "https://www.keellssuper.com/product?s=~{query}",
        "item_selector": ".product-colV2",
        "name_selector": ".product-card-nameV2",
        "price_selector": ".product-card-amountV2",  # Updated from .product-card-final-priceV2
        "use_stealth": True,   # React SPA + Cloudflare — needs real browser
        "currency": "LKR",
        "enabled": True,
    },
    {
        "store": "Cargills",
        # cargillsonline.com search results use .card structure
        "search_url": "https://cargillsonline.com/product/{query}?PS={query}",
        "item_selector": ".card",
        "name_selector": ".card p",
        "price_selector": ".card h4",
        "use_stealth": True,
        "currency": "LKR",
        "enabled": True,
    },
    {
        "store": "Sathosa",
        "search_url": "https://www.sathosa.lk/search?s={query}",
        "item_selector": ".product, .product-wrap",
        "name_selector": ".product-title, h2.woocommerce-loop-product__title",
        "price_selector": ".price, .woocommerce-Price-amount",
        "use_stealth": False,
        "currency": "LKR",
        "enabled": False,  # DNS dead — disable until URL is confirmed
    },
    {
        "store": "Arpico",
        "search_url": "https://shop.arpico.lk/search?type=product&q={query}",
        "item_selector": ".grid-product, .product-item",
        "name_selector": ".grid-product__title, .product-item__title",
        "price_selector": ".grid-product__price, .product-item__price",
        "use_stealth": False,
        "currency": "LKR",
        "enabled": False,  # DNS dead — disable until URL is confirmed
    },
]

# Search terms to use per food category
SEARCH_QUERIES = {
    "protein": ["chicken breast", "eggs", "tuna", "lentils parippu", "soy meat"],
    "carbs":   ["white rice", "brown rice", "oats", "sweet potato", "bread"],
    "vegetable": ["spinach kangkung", "carrot", "broccoli"],
    "fruit":   ["banana", "papaya"],
    "dairy":   ["fresh milk", "yogurt curd", "butter"],
    "fats":    ["coconut oil", "coconut milk"],
}


# ─────────────────────────────────────────────────────────────────────────────
# Scraped item structure
# ─────────────────────────────────────────────────────────────────────────────
class ScrapedPrice:
    def __init__(self, store: str, raw_name: str, price: float, currency: str = "LKR", url: str = ""):
        self.store = store
        self.raw_name = raw_name
        self.price = price
        self.currency = currency
        self.url = url
        self.scraped_at = datetime.now(timezone.utc).isoformat()

    def to_dict(self) -> dict:
        return {
            "store": self.store,
            "rawName": self.raw_name,
            "price": self.price,
            "currency": self.currency,
            "url": self.url,
            "scrapedAt": self.scraped_at,
        }


# ─────────────────────────────────────────────────────────────────────────────
# Fetch + parse one store for one search query
# ─────────────────────────────────────────────────────────────────────────────
def _parse_price(price_text: str) -> Optional[float]:
    """Extract numeric price from text like 'LKR 1,450.00', 'Rs. 220', or 'Rs 775.00 / Unit'."""
    import re
    # Strip unit suffix like '/ Unit', '/ Kg', '/ 500g' etc.
    price_text = re.sub(r"/.*$", "", price_text, flags=re.IGNORECASE).strip()
    # Remove currency symbols, letters, spaces
    digits = re.sub(r"[^\d.]", "", price_text.replace(",", ""))
    try:
        return float(digits) if digits else None
    except ValueError:
        return None


def scrape_keells_api(query: str) -> List[ScrapedPrice]:
    """Uses Keells internal API for reliable search results."""
    results = []
    # outletCode SCDR is default for online orders.
    api_url = f"https://zebraliveback.keellssuper.com/2.0/WebV2/GetItemDetails?itemDescription={query.replace(' ', '+')}&pageNo=1&itemsPerPage=18&outletCode=SCDR"
    
    try:
        # Use simple HTTP for the API — usually works if we provide valid headers
        resp = http_requests.get(
            api_url, 
            headers={
                "accept": "application/json",
                "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            },
            timeout=15
        )
        if not resp.ok:
            log.warning(f"[Keells API] Failed to fetch: {resp.status_code}")
            return results
            
        data = resp.json()
        items = data.get("result", {}).get("itemDetailResult", {}).get("itemDetails", [])
        
        for item in items:
            raw_name = item.get("name")
            price = item.get("amount")
            item_id = item.get("itemID")
            if raw_name and price and float(price) > 0:
                results.append(ScrapedPrice(
                    store="Keells",
                    raw_name=raw_name,
                    price=float(price),
                    url=f"https://www.keellssuper.com/product-detail/{item_id}"
                ))
    except Exception as e:
        log.error(f"[Keells API] Error: {e}")
        
    return results


def scrape_store(store_config: dict, query: str) -> List[ScrapedPrice]:
    """Scrape one store for one search query. Returns list of ScrapedPrice."""
    store_name = store_config["store"]
    
    # ── Special handling for Keells (API is more reliable) ──────────────────
    if store_name == "Keells":
        return scrape_keells_api(query)

    # ── Special handling for Cargills (Fetch from Atlas) ────────────────────
    if store_name == "Cargills":
        log.info(f"[Cargills] Fetching live prices from Atlas for '{query}'...")
        from data.foods_db import get_live_prices_from_db
        prices = get_live_prices_from_db()
        # Return as ScrapedPrice objects
        results = []
        for food_id, p in prices.items():
            if p["store"] == "Cargills" or p["store"] == "Atlas":
                 results.append(ScrapedPrice(
                     store="Cargills",
                     raw_name=food_id,
                     price=p["pricePerGram"] * 1000, # Assuming Atlas has per gram, we need per unit (kg if possible)
                     url=""
                 ))
        return results

    results = []
    url = store_config["search_url"].format(query=query.replace(" ", "+"))
    
    try:
        # Choose fetcher based on store config
        if store_config["use_stealth"]:
            from scrapling.fetchers import StealthyFetcher
            try:
                # Wait for product elements instead of network_idle — SPAs never reach
                # Keells uses a skeleton/loading screen (sk-cube-grid) initially.
                # For Cargills, we wait for the price container.
                if store_name == "Keells":
                    wait_sel = ".product-card-button-addV2, .product-colV2"
                else:
                    wait_sel = store_config["item_selector"].split(",")[0].strip()

                page = StealthyFetcher.fetch(
                    url,
                    headless=True,
                    wait_selector=wait_sel,
                    timeout=60000,
                )
            except Exception as e:
                # Don't fall back to plain Fetcher for stealth stores — they're React SPAs
                # and plain HTTP only returns the empty JS shell (0 items).
                log.warning(f"[{store_name}] StealthyFetcher failed for '{query}': {e}")
                return results
        else:
            from scrapling.fetchers import Fetcher
            page = Fetcher.get(url, stealthy_headers=True)

        # Find product items
        items = page.css(store_config["item_selector"])
        if not items:
            log.debug(f"[{store_name}] No items found for '{query}' — selector may need updating")
            return results

        for item in items[:10]:  # Limit to top 10 results per search
            try:
                name_el = item.css(store_config["name_selector"])
                price_el = item.css(store_config["price_selector"])

                if not name_el or not price_el:
                    continue

                raw_name = name_el[0].text.strip()
                price_text = price_el[0].text.strip()
                price = _parse_price(price_text)

                if raw_name and price and price > 0:
                    results.append(ScrapedPrice(
                        store=store_name,
                        raw_name=raw_name,
                        price=price,
                        currency=store_config["currency"],
                        url=url,
                    ))
            except Exception as e:
                log.debug(f"[{store_name}] Item parse error: {e}")

    except Exception as e:
        log.error(f"[{store_name}] Failed to scrape '{query}': {e}")

    log.info(f"[{store_name}] '{query}' → {len(results)} items")
    return results


# ─────────────────────────────────────────────────────────────────────────────
# Match + aggregate scraped items
# ─────────────────────────────────────────────────────────────────────────────
def process_scraped_items(scraped: List[ScrapedPrice]) -> dict:
    """
    Fuzzy matches scraped items → food IDs.
    Returns:
      {
        "matched": { food_id: [{ store, price, matched_alias, confidence }] },
        "unmatched": [ { raw_name, store, price, url } ]
      }
    """
    matched: dict[str, list] = {}
    unmatched: list[dict] = []

    for item in scraped:
        result = fuzzy_match_to_food_id(item.raw_name)
        if result:
            food_id = result["food_id"]
            if food_id not in matched:
                matched[food_id] = []
            matched[food_id].append({
                "store": item.store,
                "price": item.price,
                "currency": item.currency,
                "rawName": item.raw_name,
                "matchedAlias": result["matched_alias"],
                "confidence": result["confidence"],
                "url": item.url,
                "scrapedAt": item.scraped_at,
            })
        else:
            unmatched.append({
                "rawName": item.raw_name,
                "store": item.store,
                "price": item.price,
                "url": item.url,
                "scrapedAt": item.scraped_at,
            })

    return {"matched": matched, "unmatched": unmatched}


# ─────────────────────────────────────────────────────────────────────────────
# Push to backend API
# ─────────────────────────────────────────────────────────────────────────────
def push_prices_to_backend(matched: dict) -> dict:
    """POST each matched food's prices to backend /api/prices/bulk-update."""
    payload = []
    for food_id, entries in matched.items():
        # Compute average and lowest price across stores
        prices = [e["price"] for e in entries]
        payload.append({
            "foodId": food_id,
            "averagePrice": round(sum(prices) / len(prices), 2),
            "lowestPrice": min(prices),
            "storeBreakdown": entries,
        })

    try:
        resp = http_requests.post(
            f"{BACKEND_API}/api/prices/bulk-update",
            json={"updates": payload},
            timeout=10,
        )
        return {"success": resp.ok, "updated": len(payload)}
    except Exception as e:
        log.error(f"Failed to push prices to backend: {e}")
        return {"success": False, "error": str(e)}


def push_unmatched_to_review_queue(unmatched: List[dict]) -> dict:
    """POST unmatched items to backend /api/scraper/review-queue."""
    if not unmatched:
        return {"queued": 0}
    try:
        resp = http_requests.post(
            f"{BACKEND_API}/api/scraper/review-queue",
            json={"items": unmatched},
            timeout=10,
        )
        return {"success": resp.ok, "queued": len(unmatched)}
    except Exception as e:
        log.error(f"Failed to push unmatched items: {e}")
        return {"success": False, "error": str(e)}


# ─────────────────────────────────────────────────────────────────────────────
# Main scrape job
# ─────────────────────────────────────────────────────────────────────────────
def run_scrape_job(stores: Optional[List[str]] = None, dry_run: bool = False) -> dict:
    """
    Full scrape cycle across all stores and food categories.
    Args:
        stores: Optional list of store names to restrict scraping to
        dry_run: If True, don't push to backend (just return results)
    """
    log.info("🕷️  Starting price scrape job...")
    start_time = datetime.now(timezone.utc)

    all_scraped: list[ScrapedPrice] = []
    errors: list[str] = []

    configs = STORE_CONFIGS
    if stores:
        # Accept store names case-insensitively (UI may send 'keells', 'cargills').
        stores_norm = {s.strip().lower() for s in stores if isinstance(s, str)}
        configs = [c for c in STORE_CONFIGS if str(c.get("store", "")).lower() in stores_norm]
    # Skip disabled stores
    configs = [c for c in configs if c.get("enabled", True)]

    for store_config in configs:
        for category, queries in SEARCH_QUERIES.items():
            for query in queries:
                try:
                    items = scrape_store(store_config, query)
                    all_scraped.extend(items)
                except Exception as e:
                    err = f"{store_config['store']} / '{query}': {e}"
                    log.error(err)
                    errors.append(err)

    log.info(f"✅ Raw scraped: {len(all_scraped)} items")

    processed = process_scraped_items(all_scraped)
    matched_count = sum(len(v) for v in processed["matched"].values())
    unmatched_count = len(processed["unmatched"])

    log.info(f"📊 Matched: {matched_count} | Unmatched: {unmatched_count}")

    push_result = {"skipped": "dry_run"}
    queue_result = {"skipped": "dry_run"}

    if not dry_run:
        push_result = push_prices_to_backend(processed["matched"])
        queue_result = push_unmatched_to_review_queue(processed["unmatched"])

    elapsed = (datetime.now(timezone.utc) - start_time).total_seconds()

    return {
        "success": True,
        "duration_seconds": round(elapsed, 1),
        "items_scraped": len(all_scraped),
        "items_matched": matched_count,
        "items_unmatched": unmatched_count,
        "food_ids_updated": list(processed["matched"].keys()),
        "errors": errors,
        "push_result": push_result,
        "queue_result": queue_result,
        "timestamp": start_time.isoformat(),
    }


if __name__ == "__main__":
    import sys
    dry = "--dry-run" in sys.argv
    result = run_scrape_job(dry_run=dry)
    print(json.dumps(result, indent=2))
