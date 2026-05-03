"""
SDFitness ML Service — Fuzzy Matching Bridge v2

Public API (unchanged from v1):
    fuzzy_match_to_food_id(name, category_hint=None) → dict | None
    get_all_food_ids()                                → list[str]
    get_category_for_food(food_id)                    → str | None

Internal pipeline (new):
    1. Sanitizer.clean()        — strip Unicode noise + brand prefixes (Atlas-driven)
    2. WeightExtractor.extract() — strip UOM tokens, return weight in grams
    3. WaterfallMatcher.match() — 3-stage: Exact → Fuzzy → Category-scoped Fuzzy
"""

from __future__ import annotations

import logging
import re
from functools import lru_cache
from typing import Optional

from thefuzz import fuzz

log = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Sanitizer
# ─────────────────────────────────────────────────────────────────────────────

class Sanitizer:
    """
    Strips non-ASCII characters and brand-name prefixes from a product name.

    All brand prefixes are injected at construction time from Atlas
    (scraper_config.brand_prefixes) — nothing is hardcoded here.
    """

    _UNICODE_NOISE = re.compile(r"[^\x00-\x7F]+")
    _MULTI_SPACE   = re.compile(r"\s{2,}")

    def __init__(self, brand_prefixes: frozenset[str]) -> None:
        self._brands = brand_prefixes  # already lower-cased by AliasConfig

    def clean(self, text: str) -> str:
        # Remove non-ASCII inline (replace with "") so embedded chars in words
        # don't split the word: "cârrots" → "carrots", not "c rrots"
        text = self._UNICODE_NOISE.sub("", text)
        tokens = [t for t in text.lower().split() if t not in self._brands]
        return self._MULTI_SPACE.sub(" ", " ".join(tokens)).strip()


# ─────────────────────────────────────────────────────────────────────────────
# WeightExtractor
# ─────────────────────────────────────────────────────────────────────────────

class WeightExtractor:
    """
    Detects and strips a UOM quantity token (e.g. "500g", "1kg", "200ml")
    from a product name string and converts it to grams.

    Unit → grams multipliers are injected from Atlas
    (scraper_config.uom_to_grams) — nothing is hardcoded.
    """

    # Matches: "500g", "1.5 kg", "200 ml", "1 litre", "1liter", "1L"
    _UOM_PATTERN = re.compile(
        r"(\d+\.?\d*)\s*(kg|g|ml|l|litre|liter|grams?|millilit(?:re|er)s?)\b",
        re.IGNORECASE,
    )

    def __init__(self, uom_to_grams: dict[str, float]) -> None:
        # keys are already lower-cased by AliasConfig
        self._uom_map = uom_to_grams

    def extract(self, text: str) -> tuple[Optional[float], str]:
        """
        Returns (weight_in_grams, cleaned_text).
        If no UOM token found, returns (None, original_text).
        """
        match = self._UOM_PATTERN.search(text)
        if not match:
            return None, text

        qty  = float(match.group(1))
        unit = match.group(2).lower()

        # Normalise plurals / alternate spellings to map key
        unit_key = (
            "kg"    if unit == "kg"     else
            "g"     if unit in ("g", "grams", "gram") else
            "ml"    if unit in ("ml", "millilitre", "milliliter", "millilitres", "milliliters") else
            "l"     if unit in ("l", "litre", "liter") else
            unit
        )
        multiplier = self._uom_map.get(unit_key)
        if multiplier is None:
            log.debug("WeightExtractor: unknown unit key '%s', skipping conversion", unit_key)
            return None, text

        weight_g = qty * multiplier
        cleaned  = self._UOM_PATTERN.sub("", text).strip()
        return weight_g, cleaned


# ─────────────────────────────────────────────────────────────────────────────
# WaterfallMatcher
# ─────────────────────────────────────────────────────────────────────────────

class WaterfallMatcher:
    """
    3-stage waterfall matcher. Returns on the first stage that produces a hit.

    Stage 1: Exact token match         → confidence 1.0
    Stage 2: Fuzzy token_set_ratio     ≥ threshold
    Stage 3: Category-scoped fuzzy     ≥ (threshold − relaxation)

    All tuning parameters (threshold, relaxation) come from Atlas via AliasConfig.
    """

    def __init__(
        self,
        aliases: dict[str, dict],          # {foodId: {category, aliases[]}}
        threshold: float,
        relaxation: float,
        sanitizer: Sanitizer,
        extractor: WeightExtractor,
    ) -> None:
        self._aliases    = aliases
        self._threshold  = threshold
        self._relaxation = relaxation
        self._sanitizer  = sanitizer
        self._extractor  = extractor

        # Build flat lookup: alias_token → (foodId, category)
        self._lookup: list[tuple[str, str, str]] = [
            (alias, food_id, meta["category"])
            for food_id, meta in aliases.items()
            for alias in meta["aliases"]
        ]

    def match(
        self,
        raw_name: str,
        category_hint: Optional[str] = None,
    ) -> Optional[dict]:
        """
        Match a raw scraped product name to a canonical food_id.

        Returns:
            dict with keys: food_id, category, confidence, matched_alias, weight_g
            or None if no stage produces a match.
        """
        # Pre-processing
        cleaned   = self._sanitizer.clean(raw_name)
        weight_g, cleaned = self._extractor.extract(cleaned)

        # Stage 1 — Exact match
        result = self._exact_match(cleaned, category_hint)
        if result:
            result["weight_g"] = weight_g
            return result

        # Stage 2 — Fuzzy match
        result = self._fuzzy_match(cleaned, self._threshold, category_hint)
        if result:
            result["weight_g"] = weight_g
            return result

        # Stage 3 — Category-scoped with relaxed threshold
        if category_hint:
            relaxed = max(0.0, self._threshold - self._relaxation)
            result  = self._fuzzy_match(cleaned, relaxed, category_hint)
            if result:
                result["weight_g"] = weight_g
                return result

        return None

    # ── Internal stages ────────────────────────────────────────────────────────

    def _exact_match(self, cleaned: str, category_hint: Optional[str]) -> Optional[dict]:
        candidates = self._filter_by_category(category_hint)
        for alias, food_id, category in candidates:
            if alias == cleaned:
                return {
                    "food_id":      food_id,
                    "category":     category,
                    "confidence":   1.0,
                    "matched_alias": alias,
                }
        return None

    def _fuzzy_match(
        self,
        cleaned: str,
        threshold: float,
        category_hint: Optional[str],
    ) -> Optional[dict]:
        candidates  = self._filter_by_category(category_hint)
        best_score  = 0.0
        best: Optional[tuple] = None

        for alias, food_id, category in candidates:
            score = fuzz.token_set_ratio(cleaned, alias) / 100.0
            if score > best_score:
                best_score = score
                best = (food_id, category, alias)

        if best and best_score >= threshold:
            return {
                "food_id":       best[0],
                "category":      best[1],
                "confidence":    round(best_score, 3),
                "matched_alias": best[2],
            }
        return None

    def _filter_by_category(
        self, category_hint: Optional[str]
    ) -> list[tuple[str, str, str]]:
        if not category_hint:
            return self._lookup
        return [
            (a, fid, cat)
            for a, fid, cat in self._lookup
            if cat == category_hint
        ]


# ─────────────────────────────────────────────────────────────────────────────
# Singleton Factory
# ─────────────────────────────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _get_matcher() -> WaterfallMatcher:
    """
    Build and cache the WaterfallMatcher from Atlas config.
    Called once on first use; cached for the process lifetime.
    Raises EnvironmentError on Atlas connectivity or config issues.
    """
    from scrapers.config_loader import AliasConfig  # local import avoids circular

    cfg       = AliasConfig.from_env()
    sanitizer = Sanitizer(cfg.brands)
    extractor = WeightExtractor(cfg.uom_to_grams)
    return WaterfallMatcher(
        aliases=cfg.aliases,
        threshold=cfg.threshold,
        relaxation=cfg.relaxation,
        sanitizer=sanitizer,
        extractor=extractor,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Public API  (signature identical to v1 — no call-site changes needed)
# ─────────────────────────────────────────────────────────────────────────────

def fuzzy_match_to_food_id(
    scraped_name: str,
    category_hint: Optional[str] = None,
) -> Optional[dict]:
    """
    Match a raw scraped product name to a canonical food_id.

    Args:
        scraped_name:  Raw product name from scraper (e.g. "KEELLS Chicken 500g")
        category_hint: Optional category to restrict search scope

    Returns:
        dict: {food_id, category, confidence, matched_alias, weight_g} or None
    """
    return _get_matcher().match(scraped_name, category_hint)


def get_all_food_ids() -> list[str]:
    return list(_get_matcher()._aliases.keys())


def get_category_for_food(food_id: str) -> Optional[str]:
    aliases = _get_matcher()._aliases
    return aliases.get(food_id, {}).get("category")
