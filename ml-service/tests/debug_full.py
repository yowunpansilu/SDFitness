import os
import sys
import json
import logging

# Ensure we can import from the root
sys.path.append(os.getcwd())

from scrapers.price_scraper import run_scrape_job
import scrapers.price_scraper as ps

# Force logging to stdout
logging.basicConfig(level=logging.INFO)

# Mock BACKEND_URL for docker internal networking if needed
os.environ["BACKEND_URL"] = "http://backend:5000"

print("🚀 Starting FULL end-to-end debug scrape...")
print("Step 1: Overriding SEARCH_QUERIES to minimize run time...")
ps.SEARCH_QUERIES = {"protein": ["chicken breast"]}

print("Step 2: Running scrape job for Keells (Production Mode)...")
try:
    result = ps.run_scrape_job(stores=["Keells"], dry_run=False)
    print("\n📊 SCRAPE RESULT:")
    print(json.dumps(result, indent=2))
    
    if result.get("items_matched", 0) > 0:
        print("\n✅ SUCCESS: Found and matched items!")
    else:
        print("\n⚠️ WARNING: No items matched. Check selectors or fuzzy logic.")
        
except Exception as e:
    print(f"\n❌ FATAL ERROR: {e}")
    import traceback
    traceback.print_exc()
