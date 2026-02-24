"""
Phase 2.2 — Food Alias Table & Fuzzy Matching
Maps scraped product names → canonical food IDs in foods_db.py

Usage:
    from scrapers.food_aliases import fuzzy_match_to_food_id
    food_id = fuzzy_match_to_food_id("KEELLS Chicken Drumstick 500g")
    # → "chicken_breast" (confidence: 0.82)
"""

from thefuzz import fuzz
from thefuzz import process

# ─────────────────────────────────────────────────────────────
# Canonical food ID → list of known aliases / product name fragments
# Category is used to constrain matching (only match within same category)
# ─────────────────────────────────────────────────────────────
FOOD_ALIASES = {
    # ── Protein ──────────────────────────────────────────────
    "chicken_breast": {
        "category": "protein",
        "aliases": [
            "chicken breast", "chicken fillet", "chicken boneless",
            "chicken drumstick", "chicken thigh", "chicken whole",
            "broiler chicken", "farm chicken", "keells chicken",
            "cargills chicken", "ranfer chicken",
        ],
    },
    "eggs": {
        "category": "protein",
        "aliases": [
            "eggs", "egg", "free range eggs", "farm eggs",
            "brown eggs", "white eggs", "10 pack eggs", "6 pack eggs",
            "omega eggs", "village eggs",
        ],
    },
    "tuna": {
        "category": "protein",
        "aliases": [
            "tuna", "canned tuna", "tuna chunks", "tuna flakes",
            "john west tuna", "mega tuna", "sealord tuna",
            "skipjack tuna", "yellowfin tuna",
        ],
    },
    "soy_meat": {
        "category": "protein",
        "aliases": [
            "soy meat", "soya meat", "textured vegetable protein",
            "tvp", "lanka soy", "prima soy", "soya chunks",
        ],
    },
    "red_lentils": {
        "category": "protein",
        "aliases": [
            "red lentils", "parippu", "lentils", "masoor dal",
            "red dal", "dhal", "dal", "sathosa parippu",
        ],
    },
    "tofu": {
        "category": "protein",
        "aliases": [
            "tofu", "bean curd", "silken tofu", "firm tofu",
            "tofu block",
        ],
    },

    # ── Carbs ─────────────────────────────────────────────────
    "rice": {
        "category": "carbs",
        "aliases": [
            "white rice", "basmati rice", "samba", "keeri samba",
            "nadu rice", "raw rice", "parboiled rice",
            "cargills rice", "prima rice", "sathosa rice",
        ],
    },
    "brown_rice": {
        "category": "carbs",
        "aliases": [
            "brown rice", "red rice", "hand pounded rice",
            "whole grain rice", "unpolished rice",
        ],
    },
    "oats": {
        "category": "carbs",
        "aliases": [
            "oats", "rolled oats", "instant oats", "quaker oats",
            "morn oats", "porridge oats", "whole oats",
        ],
    },
    "sweet_potato": {
        "category": "carbs",
        "aliases": [
            "sweet potato", "bathala", "purple sweet potato",
            "orange sweet potato", "kumara",
        ],
    },
    "bread": {
        "category": "carbs",
        "aliases": [
            "bread", "white bread", "brown bread", "whole wheat bread",
            "toast bread", "harvest bread", "prima bread", "massimo bread",
        ],
    },

    # ── Vegetables ────────────────────────────────────────────
    "spinach": {
        "category": "vegetable",
        "aliases": [
            "spinach", "kangkung", "water spinach", "mukunuwenna",
            "leafy greens", "green leaves", "kankun",
        ],
    },
    "carrot": {
        "category": "vegetable",
        "aliases": [
            "carrot", "carrots", "baby carrots", "orange carrot",
        ],
    },
    "broccoli": {
        "category": "vegetable",
        "aliases": [
            "broccoli", "broccoli florets",
        ],
    },

    # ── Fruits ────────────────────────────────────────────────
    "banana": {
        "category": "fruit",
        "aliases": [
            "banana", "kolikuttu banana", "ambun banana", "ripe banana",
            "raw banana", "plantain", "kesel",
        ],
    },
    "papaya": {
        "category": "fruit",
        "aliases": [
            "papaya", "pawpaw", "ripe papaya", "papaw",
        ],
    },

    # ── Dairy ─────────────────────────────────────────────────
    "milk": {
        "category": "dairy",
        "aliases": [
            "fresh milk", "full cream milk", "low fat milk",
            "ambewela milk", "highland milk", "anchor milk",
            "cowbell milk", "uht milk", "1l milk",
        ],
    },
    "yogurt": {
        "category": "dairy",
        "aliases": [
            "yogurt", "yoghurt", "plain yogurt", "set yogurt",
            "ambewela yogurt", "highland yogurt", "curd",
            "buffalo curd", "cow curd",
        ],
    },
    "butter": {
        "category": "dairy",
        "aliases": [
            "butter", "unsalted butter", "salted butter",
            "anchor butter", "lurpak butter", "keells butter",
        ],
    },

    # ── Fats / Oils ───────────────────────────────────────────
    "coconut_oil": {
        "category": "fats",
        "aliases": [
            "coconut oil", "virgin coconut oil", "vco",
            "pure coconut oil", "parachute coconut oil",
            "coco oil", "coconut cooking oil",
        ],
    },
    "coconut_milk": {
        "category": "fats",
        "aliases": [
            "coconut milk", "thick coconut milk", "thin coconut milk",
            "coconut cream", "kiri", "maggi coconut milk",
            "cocomax coconut milk",
        ],
    },
}

# Build reverse lookup: alias fragment → (food_id, category)
_ALIAS_LOOKUP: list[tuple[str, str, str]] = []
for food_id, meta in FOOD_ALIASES.items():
    for alias in meta["aliases"]:
        _ALIAS_LOOKUP.append((alias.lower(), food_id, meta["category"]))


def fuzzy_match_to_food_id(
    scraped_name: str,
    threshold: float = 0.60,
    category_hint: str | None = None,
) -> dict | None:
    """
    Match a raw scraped product name to a canonical food_id.

    Args:
        scraped_name: Raw product name from scraper (e.g. "KEELLS Chicken Drumstick 500g")
        threshold: Minimum similarity score (0.0–1.0) to accept a match
        category_hint: Optional category to restrict matching scope

    Returns:
        dict with keys: food_id, category, confidence, matched_alias
        or None if no match above threshold
    """
    name_lower = scraped_name.lower()

    # Strip common noise words
    noise = ["500g", "1kg", "250g", "200ml", "1l", "pack", "box",
             "tin", "can", "bottle", "keells", "cargills", "arpico",
             "sathosa", "prima", "anchor", "fresh", "premium", "special"]
    cleaned = name_lower
    for word in noise:
        cleaned = cleaned.replace(word, "").strip()

    candidates = _ALIAS_LOOKUP
    if category_hint:
        candidates = [(a, fid, cat) for a, fid, cat in candidates if cat == category_hint]

    if not candidates:
        return None

    best_score = 0.0
    best_food_id = None
    best_alias = None
    best_category = None

    for alias, food_id, category in candidates:
        # Use token set ratio — handles word order differences well
        score = fuzz.token_set_ratio(cleaned, alias) / 100.0
        if score > best_score:
            best_score = score
            best_food_id = food_id
            best_alias = alias
            best_category = category

    if best_score >= threshold:
        return {
            "food_id": best_food_id,
            "category": best_category,
            "confidence": round(best_score, 3),
            "matched_alias": best_alias,
        }

    return None


def get_all_food_ids() -> list[str]:
    return list(FOOD_ALIASES.keys())


def get_category_for_food(food_id: str) -> str | None:
    return FOOD_ALIASES.get(food_id, {}).get("category")
