"""
SDFitness Price Scraper — Verbose Runner
Run: python scrapers/run_scraper.py
Shows real-time progress for every store × query combination.
"""
import sys
import time
import logging
from datetime import datetime, timezone

# ── Set up rich logging ───────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
    stream=sys.stdout,
    force=True
)
log = logging.getLogger(__name__)

from price_scraper import (
    STORE_CONFIGS, SEARCH_QUERIES,
    scrape_store, process_scraped_items,
    _parse_price
)

ENABLED_STORES = [c for c in STORE_CONFIGS if c.get("enabled", True)]

# Count total tasks for progress bar
total_tasks = sum(
    len(queries)
    for c in ENABLED_STORES
    for queries in [SEARCH_QUERIES.get(cat, []) for cat in SEARCH_QUERIES]
)

all_scraped = []
errors = []
done = 0

bar_width = 30

def render_bar(done, total):
    pct = done / total if total else 0
    filled = int(bar_width * pct)
    bar = "█" * filled + "░" * (bar_width - filled)
    return f"[{bar}] {done}/{total} ({pct*100:.0f}%)"

print("\n" + "═" * 60)
print("  🛒  SDFitness Price Scraper — Live Run")
print(f"  Stores : {', '.join(c['store'] for c in ENABLED_STORES)}")
print(f"  Queries: {total_tasks} total")
print("═" * 60 + "\n")

start_all = time.time()

for store_config in ENABLED_STORES:
    store_name = store_config["store"]
    print(f"\n┌── Store: {store_name} {'(Stealth Browser)' if store_config['use_stealth'] else '(HTTP)'}")

    for category, queries in SEARCH_QUERIES.items():
        for query in queries:
            done += 1
            bar = render_bar(done, total_tasks)
            print(f"│  {bar}  Searching: \"{query}\" [{category}]", end="", flush=True)

            t0 = time.time()
            try:
                items = scrape_store(store_config, query)
                elapsed = time.time() - t0
                all_scraped.extend(items)

                if items:
                    prices = [f"LKR {i.price}" for i in items[:3]]
                    print(f"\r│  {bar}  ✅ \"{query}\" → {len(items)} items  ({elapsed:.1f}s)  e.g. {', '.join(prices)}")
                else:
                    print(f"\r│  {bar}  ⚠️  \"{query}\" → 0 items ({elapsed:.1f}s)")

            except Exception as e:
                elapsed = time.time() - t0
                err = f"{store_name}/'{query}': {e}"
                errors.append(err)
                print(f"\r│  {bar}  ❌ \"{query}\" → ERROR ({elapsed:.1f}s): {type(e).__name__}")

    print(f"└── Done with {store_name}")

# ── Summary ───────────────────────────────────────────────────────────────────
total_time = time.time() - start_all
print("\n" + "═" * 60)
print(f"  ✅ Scrape complete in {total_time:.1f}s")
print(f"  📦 Raw items scraped : {len(all_scraped)}")
print(f"  ❌ Errors            : {len(errors)}")

if errors:
    print("\n  Errors:")
    for e in errors:
        print(f"    • {e}")

if all_scraped:
    processed = process_scraped_items(all_scraped)
    matched = sum(len(v) for v in processed["matched"].values())
    unmatched = len(processed.get("unmatched", []))
    print(f"\n  🎯 Matched to food IDs : {matched}")
    print(f"  ❓ Unmatched (review)  : {unmatched}")
    if unmatched:
        print("\n  Unmatched items (→ scraperreviewitems):")
        for u in processed["unmatched"][:10]:
            print(f"    • [{u['store']}] {u['rawName']} = LKR {u['price']}")
else:
    print("\n  ⚠️  No items scraped. The sites may require Playwright install.")
    print("     Run: playwright install chromium")

print("═" * 60 + "\n")
