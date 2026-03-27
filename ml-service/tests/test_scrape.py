from scrapling.fetchers import StealthyFetcher
import sys

# Try the URL the user has open
url = "https://cargillsonline.com/product/chicken%20breast?PS=chicken%20breast"
print(f"Fetching {url}...")
try:
    page = StealthyFetcher.fetch(url, headless=True, timeout=60000)
    print(f"Status: {page.status}")
    
    # Check for items
    # Looking at the screenshot, items are likely in a grid.
    # The current code uses .product-card-price-containerV2
    items = page.css(".product-card-price-containerV2, .product-item, .item-card")
    print(f"Found {len(items)} items")
    
    for item in items[:3]:
        # Try finding name and price
        name_el = item.css(".product-card-nameV2, .item-name, h4")
        price_el = item.css(".product-card-final-priceV2, .item-price, .product-price")
        
        name = name_el[0].text.strip() if name_el else "N/A"
        price = price_el[0].text.strip() if price_el else "N/A"
        print(f" - Item: {name} | Price: {price}")
        
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")
