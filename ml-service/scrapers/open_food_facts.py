"""
Phase 2.5 — Open Food Facts Integration
Secondary data source for packaged food nutrition + price data.
Uses the Open Food Facts public API (no key required).

Usage:
    from scrapers.open_food_facts import lookup_barcode, search_product
"""

import requests
import logging
from typing import Optional

from scrapers.food_aliases import fuzzy_match_to_food_id

log = logging.getLogger(__name__)

OPENFOODFACTS_API = "https://world.openfoodfacts.org"
APP_USER_AGENT = "SDFitness-ML/1.0 (academic project)"


def lookup_barcode(barcode: str) -> Optional[dict]:
    """
    Look up a product by barcode. Returns mapped FoodPrice-compatible dict or None.
    
    Args:
        barcode: EAN/UPC barcode string (e.g. "8901030863050")
    """
    try:
        url = f"{OPENFOODFACTS_API}/api/v2/product/{barcode}.json"
        resp = requests.get(url, headers={"User-Agent": APP_USER_AGENT}, timeout=10)
        data = resp.json()

        if data.get("status") != 1 or "product" not in data:
            return None

        product = data["product"]
        product_name = product.get("product_name") or product.get("product_name_en", "")
        nutriments = product.get("nutriments", {})

        # Try to match product name against our food aliases
        match = fuzzy_match_to_food_id(product_name)

        return {
            "barcode": barcode,
            "rawName": product_name,
            "brand": product.get("brands", ""),
            "categories": product.get("categories", ""),
            "foodId": match["food_id"] if match else None,
            "matchConfidence": match["confidence"] if match else 0,
            "nutrition": {
                "energyKcal": nutriments.get("energy-kcal_100g"),
                "protein": nutriments.get("proteins_100g"),
                "carbs": nutriments.get("carbohydrates_100g"),
                "fat": nutriments.get("fat_100g"),
                "fiber": nutriments.get("fiber_100g"),
                "sugar": nutriments.get("sugars_100g"),
                "sodium": nutriments.get("sodium_100g"),
            },
            "imageFrontUrl": product.get("image_front_url", ""),
            "source": "open_food_facts",
        }

    except Exception as e:
        log.error(f"Open Food Facts barcode lookup failed ({barcode}): {e}")
        return None


def search_product(query: str, country: str = "lk", page_size: int = 5) -> list[dict]:
    """
    Search Open Food Facts for products matching a query term.
    Prioritizes Sri Lankan products (country=lk).

    Args:
        query: Search string (e.g. "coconut oil")
        country: ISO country code to filter by
        page_size: Max results to return
    """
    try:
        url = f"{OPENFOODFACTS_API}/cgi/search.pl"
        params = {
            "search_terms": query,
            "search_simple": 1,
            "action": "process",
            "json": 1,
            "page_size": page_size,
            "countries_tags": f"en:{country}",  # Filter by Sri Lanka
        }
        resp = requests.get(
            url,
            params=params,
            headers={"User-Agent": APP_USER_AGENT},
            timeout=10,
        )
        data = resp.json()
        products = data.get("products", [])

        results = []
        for p in products:
            name = p.get("product_name") or p.get("product_name_en", "")
            if not name:
                continue

            match = fuzzy_match_to_food_id(name)
            results.append({
                "rawName": name,
                "brand": p.get("brands", ""),
                "barcode": p.get("code", ""),
                "foodId": match["food_id"] if match else None,
                "matchConfidence": match["confidence"] if match else 0,
                "source": "open_food_facts",
            })

        return results

    except Exception as e:
        log.error(f"Open Food Facts search failed ('{query}'): {e}")
        return []


def enrich_scraped_item(scraped_name: str) -> Optional[dict]:
    """
    Try to enrich a scraped product name with Open Food Facts nutrition data.
    Useful for newly matched items that don't have nutrition data yet.
    """
    results = search_product(scraped_name)
    if results:
        return results[0]
    return None


if __name__ == "__main__":
    # Quick test
    import json
    print("🔍 Testing barcode lookup: 8901030863050 (Anchor Full Cream Milk)")
    result = lookup_barcode("8901030863050")
    print(json.dumps(result, indent=2) if result else "Not found")

    print("\n🔍 Testing search: 'coconut oil sri lanka'")
    results = search_product("coconut oil")
    print(json.dumps(results[:2], indent=2))
