"""
Dump Cargills HTML via StealthyFetcher to find real selectors.
"""
import sys
sys.path.insert(0, "/app")

from scrapling.fetchers import StealthyFetcher

url = "https://cargillsonline.com/product/chicken%20breast?PS=chicken%20breast"
print(f"Fetching with StealthyFetcher: {url}")

page = StealthyFetcher.fetch(url, headless=True, timeout=60000)
print(f"Status: {page.status}")
print(f"Content size: {len(page.html_content)}")

# Save for inspection
with open("cargills_stealth.html", "w") as f:
    f.write(page.html_content)

print("Saved to cargills_stealth.html")

# Try all classes that appear multiple times (likely repeating item structure)
import re
classes = re.findall(r'class="([^"]+)"', page.html_content)
from collections import Counter
class_counts = Counter()
for c in classes:
    for cls in c.split():
        class_counts[cls] += 1

print("\nTop repeated classes (likely item containers):")
for cls, count in class_counts.most_common(30):
    print(f"  .{cls}: {count}")
