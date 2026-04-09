from scrapling.fetchers import StealthyFetcher
import sys

url = sys.argv[1] if len(sys.argv) > 1 else "https://www.keellssuper.com/product?s=~chicken+breast"
print(f"Fetching {url}...")
try:
    page = StealthyFetcher.fetch(url, headless=True, timeout=60000)
    print(f"Status: {page.status}")
    
    # Save to debug file
    with open("keells_debug.html", "w") as f:
        f.write(page.html_content)
    
    print(f"Done. Content written to keells_debug.html. Size: {len(page.html_content)}")
    
    # Check for items again
    items = page.css(".product-colV2")
    print(f"Found {len(items)} items using .product-colV2")
    
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
