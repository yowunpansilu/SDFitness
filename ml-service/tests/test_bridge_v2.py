"""
Phase 2.2 — Bridge v2 Unit Tests

All tests are fully isolated from Atlas.
AliasConfig is injected via mock so these run in CI without a DB connection.

Run:
    cd ml-service
    python -m pytest tests/test_bridge_v2.py -v
"""

from __future__ import annotations

import types
import unittest
from unittest.mock import MagicMock, patch

# ─── Minimal fixture config ──────────────────────────────────────────────────

_BRANDS = frozenset({"keells", "cargills", "arpico", "sathosa", "prima", "anchor"})

_UOM_MAP = {"kg": 1000.0, "g": 1.0, "l": 1000.0, "ml": 1.0, "litre": 1000.0, "liter": 1000.0}

_ALIASES = {
    "chicken_breast": {
        "category": "protein",
        "aliases": ["chicken breast", "boneless chicken", "chicken fillet"],
    },
    "red_lentils": {
        "category": "protein",
        "aliases": ["red lentils", "parippu", "dhal", "dal", "lentils"],
    },
    "white_rice": {
        "category": "carbs",
        "aliases": ["white rice", "samba rice", "basmati rice", "raw rice"],
    },
    "spinach": {
        "category": "vegetable",
        "aliases": ["spinach", "baby spinach", "kangkung"],
    },
}

_THRESHOLD  = 0.60
_RELAXATION = 0.10


def _make_matcher():
    """Construct a WaterfallMatcher injected with fixture config (no Atlas)."""
    from scrapers.food_aliases import Sanitizer, WeightExtractor, WaterfallMatcher
    sanitizer = Sanitizer(_BRANDS)
    extractor = WeightExtractor(_UOM_MAP)
    return WaterfallMatcher(
        aliases=_ALIASES,
        threshold=_THRESHOLD,
        relaxation=_RELAXATION,
        sanitizer=sanitizer,
        extractor=extractor,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Sanitizer
# ─────────────────────────────────────────────────────────────────────────────

class TestSanitizer(unittest.TestCase):
    def setUp(self):
        from scrapers.food_aliases import Sanitizer
        self.san = Sanitizer(_BRANDS)

    def test_strips_unicode_noise(self):
        # Real scraper artifacts: stray multi-byte sequences between ASCII words
        # e.g. Keells catalog exports "carrots \xe2\x80\x93 organic" (UTF-8 en-dash corruption)
        # Sanitizer should strip non-ASCII chars, preserve surrounding words
        noise = "carrots \u00e2\u20ac\u201c organic"   # en-dash mojibake bytes
        result = self.san.clean(noise)
        self.assertIn("carrots", result)
        self.assertIn("organic", result)
        # All non-ASCII removed
        self.assertTrue(result.isascii())

    def test_strips_brand_prefix(self):
        self.assertEqual(self.san.clean("KEELLS Chicken"), "chicken")

    def test_strips_multiple_brands(self):
        # e.g. "Cargills Fresh Anchor Butter" → "fresh butter"
        result = self.san.clean("Cargills Fresh Anchor Butter")
        self.assertNotIn("cargills", result)
        self.assertNotIn("anchor",   result)
        self.assertIn("butter",      result)

    def test_preserves_non_brand_tokens(self):
        result = self.san.clean("Organic Red Lentils")
        self.assertIn("organic",     result)
        self.assertIn("red lentils", result)

    def test_collapses_extra_spaces(self):
        result = self.san.clean("  chicken   breast  ")
        self.assertEqual(result, "chicken breast")


# ─────────────────────────────────────────────────────────────────────────────
# WeightExtractor
# ─────────────────────────────────────────────────────────────────────────────

class TestWeightExtractor(unittest.TestCase):
    def setUp(self):
        from scrapers.food_aliases import WeightExtractor
        self.ext = WeightExtractor(_UOM_MAP)

    def test_extracts_kg(self):
        weight, text = self.ext.extract("Chicken Breast 1kg")
        self.assertAlmostEqual(weight, 1000.0)
        self.assertNotIn("1kg", text)

    def test_extracts_grams(self):
        weight, text = self.ext.extract("Chicken Fillet 500g")
        self.assertAlmostEqual(weight, 500.0)

    def test_extracts_litres(self):
        weight, text = self.ext.extract("Fresh Milk 1 litre")
        self.assertAlmostEqual(weight, 1000.0)

    def test_extracts_ml(self):
        weight, text = self.ext.extract("Coconut Oil 200ml")
        self.assertAlmostEqual(weight, 200.0)

    def test_no_uom_returns_none(self):
        weight, text = self.ext.extract("Eggs pack")
        self.assertIsNone(weight)
        self.assertEqual(text, "Eggs pack")

    def test_decimal_quantity(self):
        weight, text = self.ext.extract("Rice 1.5kg")
        self.assertAlmostEqual(weight, 1500.0)


# ─────────────────────────────────────────────────────────────────────────────
# WaterfallMatcher — Stage 1: Exact
# ─────────────────────────────────────────────────────────────────────────────

class TestWaterfallExactMatch(unittest.TestCase):
    def setUp(self):
        self.matcher = _make_matcher()

    def test_exact_match_confidence_one(self):
        result = self.matcher.match("red lentils")
        self.assertIsNotNone(result)
        self.assertEqual(result["food_id"],    "red_lentils")
        self.assertAlmostEqual(result["confidence"], 1.0)

    def test_exact_match_case_insensitive(self):
        result = self.matcher.match("Red Lentils")
        self.assertIsNotNone(result)
        self.assertEqual(result["food_id"], "red_lentils")

    def test_exact_match_after_brand_strip(self):
        # "KEELLS Red Lentils" → sanitized to "red lentils" → exact hit
        result = self.matcher.match("KEELLS Red Lentils")
        self.assertIsNotNone(result)
        self.assertEqual(result["food_id"], "red_lentils")


# ─────────────────────────────────────────────────────────────────────────────
# WaterfallMatcher — Stage 2: Fuzzy
# ─────────────────────────────────────────────────────────────────────────────

class TestWaterfallFuzzyMatch(unittest.TestCase):
    def setUp(self):
        self.matcher = _make_matcher()

    def test_fuzzy_match_partial_alias(self):
        # "lentils parippu" is a blend of two separate aliases → fuzzy should hit
        result = self.matcher.match("lentils parippu")
        self.assertIsNotNone(result)
        self.assertEqual(result["food_id"], "red_lentils")
        self.assertGreaterEqual(result["confidence"], _THRESHOLD)

    def test_fuzzy_match_with_uom_stripped(self):
        result = self.matcher.match("Chicken Breast 500g KEELLS")
        self.assertIsNotNone(result)
        self.assertEqual(result["food_id"], "chicken_breast")
        self.assertAlmostEqual(result["weight_g"], 500.0)

    def test_no_match_returns_none(self):
        result = self.matcher.match("HDMI Cable 2m")
        self.assertIsNone(result)


# ─────────────────────────────────────────────────────────────────────────────
# WaterfallMatcher — Stage 3: Category-scoped relaxation
# ─────────────────────────────────────────────────────────────────────────────

class TestWaterfallCategoryHint(unittest.TestCase):
    def setUp(self):
        self.matcher = _make_matcher()

    def test_category_hint_restricts_scope(self):
        # "basmati" alone might weakly match — with hint=carbs it should hit white_rice
        result = self.matcher.match("basmati", category_hint="carbs")
        self.assertIsNotNone(result)
        self.assertEqual(result["category"], "carbs")

    def test_category_hint_prevents_cross_category_match(self):
        # "spinach" asked with category_hint=carbs → should not match vegetable spinach
        result = self.matcher.match("spinach", category_hint="carbs")
        # Either None or a carbs item — must NOT be vegetable
        if result:
            self.assertEqual(result["category"], "carbs")


# ─────────────────────────────────────────────────────────────────────────────
# Public API smoke test (mocking Atlas)
# ─────────────────────────────────────────────────────────────────────────────

class TestPublicAPI(unittest.TestCase):
    """
    Smoke-tests the public fuzzy_match_to_food_id() function
    by patching _get_matcher() to return an injected matcher.
    """

    def _patch_matcher(self):
        return patch("scrapers.food_aliases._get_matcher", return_value=_make_matcher())

    def test_public_function_returns_dict(self):
        with self._patch_matcher():
            from scrapers.food_aliases import fuzzy_match_to_food_id
            result = fuzzy_match_to_food_id("red lentils")
        self.assertIsInstance(result, dict)
        self.assertIn("food_id",      result)
        self.assertIn("confidence",   result)
        self.assertIn("matched_alias", result)
        self.assertIn("weight_g",     result)

    def test_get_all_food_ids(self):
        with self._patch_matcher():
            from scrapers.food_aliases import get_all_food_ids
            ids = get_all_food_ids()
        self.assertIn("red_lentils",    ids)
        self.assertIn("chicken_breast", ids)

    def test_get_category_for_food(self):
        with self._patch_matcher():
            from scrapers.food_aliases import get_category_for_food
            self.assertEqual(get_category_for_food("red_lentils"),    "protein")
            self.assertEqual(get_category_for_food("white_rice"),     "carbs")
            self.assertIsNone(get_category_for_food("nonexistent_id"))


if __name__ == "__main__":
    unittest.main()
