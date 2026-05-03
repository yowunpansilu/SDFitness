"""
SDFitness ML Service — Atlas Config Loader

Single responsibility: fetch all runtime config from Atlas at startup.
Raises EnvironmentError (fail-fast) if required config is missing.

Collections read:
    foodaliases    — one doc per alias: {foodId, alias, category}
    scraper_config — key/value pairs:   {key, value}
                     Required keys:
                       brand_prefixes          list[str]
                       fuzzy_threshold         float
                       category_hint_relaxation float
                       uom_to_grams            dict[str, float]
"""

from __future__ import annotations

import logging
import os
from typing import Any

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure

log = logging.getLogger(__name__)


class AliasConfig:
    """
    Loads food aliases and scraper configuration from Atlas.

    Attributes:
        aliases (dict):   {foodId: {"category": str, "aliases": list[str]}}
        brands  (frozenset): lower-cased brand prefixes to strip
        threshold (float):  fuzzy match acceptance threshold
        relaxation (float): threshold relaxation applied when category_hint is set
        uom_to_grams (dict): unit-of-measure → grams multiplier
    """

    _REQUIRED_CONFIG_KEYS = (
        "brand_prefixes",
        "fuzzy_threshold",
        "category_hint_relaxation",
        "uom_to_grams",
    )

    def __init__(self, client: MongoClient, db_name: str) -> None:
        db = client[db_name]
        self.aliases   = self._load_aliases(db)
        config         = self._load_config(db)
        self.brands    = frozenset(b.lower() for b in config["brand_prefixes"])
        self.threshold = float(config["fuzzy_threshold"])
        self.relaxation = float(config["category_hint_relaxation"])
        self.uom_to_grams: dict[str, float] = {
            k.lower(): float(v) for k, v in config["uom_to_grams"].items()
        }
        log.info(
            "AliasConfig loaded: %d food IDs, %d brand prefixes, threshold=%.2f",
            len(self.aliases),
            len(self.brands),
            self.threshold,
        )

    # ── Private helpers ───────────────────────────────────────────────────────

    @staticmethod
    def _load_aliases(db) -> dict[str, dict[str, Any]]:
        docs = list(db.foodaliases.find({}, {"_id": 0, "foodId": 1, "alias": 1, "category": 1}))
        if not docs:
            raise EnvironmentError(
                "foodaliases collection is empty. Run: cd backend && node seed_food_aliases.js"
            )
        result: dict[str, dict] = {}
        for doc in docs:
            fid = doc["foodId"]
            if fid not in result:
                result[fid] = {"category": doc["category"], "aliases": []}
            result[fid]["aliases"].append(doc["alias"].lower())
        return result

    @classmethod
    def _load_config(cls, db) -> dict[str, Any]:
        docs = list(db.scraper_config.find({}, {"_id": 0, "key": 1, "value": 1}))
        config = {d["key"]: d["value"] for d in docs}
        missing = [k for k in cls._REQUIRED_CONFIG_KEYS if k not in config]
        if missing:
            raise EnvironmentError(
                f"Missing scraper_config key(s) in Atlas: {missing}. "
                "Run: cd backend && node seed_food_aliases.js"
            )
        return config

    # ── Factory ───────────────────────────────────────────────────────────────

    @classmethod
    def from_env(cls) -> "AliasConfig":
        """Build config from environment variables. Raises on failure."""
        uri = os.getenv("MONGO_URI")
        if not uri:
            raise EnvironmentError("MONGO_URI environment variable is not set.")
        db_name = os.getenv("DB_NAME", "test")
        try:
            client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            client.admin.command("ping")   # fail-fast connectivity check
        except (ConnectionFailure, OperationFailure) as exc:
            raise EnvironmentError(f"Cannot reach Atlas: {exc}") from exc
        return cls(client, db_name)
