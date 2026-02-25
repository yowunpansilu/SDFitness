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
        "search_url": "https://www.keells.com/search?q={query}",
        "item_selector": ".product-item, .product-card, [data-product]",
        "name_selector": ".product-title, .product-name, h3.name",
        "price_selector": ".product-price, .price, span[class*='price']",
        "use_stealth": True,   # Keells uses JS rendering
        "currency": "LKR",
    },
    {
        "store": "Cargills",
        "search_url": "https://www.cargillsfood.com/search?q={query}",
        "item_selector": ".product-item, .item-card",
        "name_selector": ".item-name, .product-title, h4",
        "price_selector": ".item-price, .product-price, [class*='price']",
        "use_stealth": True,
        "currency": "LKR",
    },
    {
        "store": "Sathosa",
        "search_url": "https://www.sathosa.lk/search?s={query}",
        "item_selector": ".product, .product-wrap",
        "name_selector": ".product-title, h2.woocommerce-loop-product__title",
        "price_selector": ".price, .woocommerce-Price-amount",
        "use_stealth": False,  # Simpler WordPress site
        "currency": "LKR",
    },
    {
        "store": "Arpico",
        "search_url": "https://shop.arpico.lk/search?type=product&q={query}",
        "item_selector": ".grid-product, .product-item",
        "name_selector": ".grid-product__title, .product-item__title",
        "price_selector": ".grid-product__price, .product-item__price",
        "use_stealth": False,
        "currency": "LKR",
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
    """Extract numeric price from text like 'LKR 1,450.00' or 'Rs. 220'."""
    import re
    # Remove currency symbols, letters, spaces
    digits = re.sub(r"[^\d.]", "", price_text.replace(",", ""))
    try:
        return float(digits) if digits else None
    except ValueError:
        return None


def scrape_store(store_config: dict, query: str) -> List[ScrapedPrice]:
    """Scrape one store for one search query. Returns list of ScrapedPrice."""
    results = []
    url = store_config["search_url"].format(query=query.replace(" ", "+"))
    store_name = store_config["store"]

    try:
        # Choose fetcher based on store config
        if store_config["use_stealth"]:
            try:
                from scrapling.fetchers import StealthyFetcher
                page = StealthyFetcher.fetch(url, headless=True, network_idle=True)
            except Exception as e:
                log.warning(f"[{store_name}] StealthyFetcher failed ({e}), falling back to Fetcher")
                from scrapling.fetchers import Fetcher
                page = Fetcher.get(url, stealthy_headers=True)
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
        configs = [c for c in STORE_CONFIGS if c["store"] in stores]

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
