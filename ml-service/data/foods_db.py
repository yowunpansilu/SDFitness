"""
SDFitness ML Service — Food Database

This contains the 20 core foods with full nutritional data.
In production, this would be loaded from MongoDB. For the ML model
training and inference, we keep a local copy as a CSV/dict for speed.
"""

import pandas as pd
import os
from pymongo import MongoClient

# MongoDB Config
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "keelsPriceDB")

def _get_mongo_client():
    """Helper to get a connected MongoDB client."""
    if not MONGO_URI:
        return None
    try:
        # Just use the URI directly. 
        # If it has special characters, the user should have encoded them in the env var.
        return MongoClient(MONGO_URI)
    except Exception as e:
        print(f"⚠️  MongoDB Connection Error: {e}")
        return None


def get_foods_dataframe():
    """Return the food database as a pandas DataFrame by fetching from Atlas."""
    client = _get_mongo_client()
    if not client:
        return pd.DataFrame()

    try:
        db = client[DB_NAME]
        # Fetch all verified food metadata
        foods = list(db.foods_metadata.find({}, {"_id": 0}))
        client.close()
        return pd.DataFrame(foods)
    except Exception as e:
        print(f"⚠️  Failed to fetch food metadata from Atlas: {e}")
        return pd.DataFrame()


def get_live_prices_from_db():
    """Fetch live prices from MongoDB and perform fuzzy matching."""
    if not MONGO_URI:
        return {}

    try:
        client = MongoClient(MONGO_URI)
        # Use 'test' database as discovered across the Atlas cluster
        db = client["test"]
        
        # Load fuzzy matching logic
        from scrapers.food_aliases import fuzzy_match_to_food_id
        
        # Fetch all products from the scraped collection
        all_products = list(db.products.find({"isAvailable": True}))
        
        price_dict = {}
        for p in all_products:
            raw_name = p.get("name", "")
            match = fuzzy_match_to_food_id(raw_name)
            
            if match and match["confidence"] > 0.75:
                food_id = match["food_id"]
                price = p.get("currentPrice", 0)
                uom = str(p.get("uom", "KG")).upper()
                
                # Normalize to price per gram
                price_per_gram = 0
                if uom == "KG":
                    price_per_gram = price / 1000
                elif uom == "G":
                    price_per_gram = price
                elif "500G" in raw_name.upper():
                    price_per_gram = price / 500
                elif "250G" in raw_name.upper():
                    price_per_gram = price / 250
                else:
                    # Default assumption for items like eggs (per unit, so we use a fallback weight)
                    price_per_gram = price / 50 # 50g avg per item

                # Keep the lowest price found for this foodId
                if food_id not in price_dict or price_per_gram < price_dict[food_id]["pricePerGram"]:
                    price_dict[food_id] = {
                        "pricePerGram": round(price_per_gram, 4),
                        "store": "Cargills/Keells (Atlas)",
                        "matched_name": raw_name,
                        "confidence": match["confidence"]
                    }
        
        client.close()
        return price_dict
    except Exception as e:
        print(f"⚠️  Failed to fetch live prices from Atlas: {e}")
        return {}


def get_foods_by_dietary(is_vegetarian=False, is_vegan=False, is_gluten_free=False, is_dairy_free=False):
    """Filter foods by dietary constraints."""
    df = get_foods_dataframe()
    if is_vegan:
        df = df[df['is_vegan'] == True]
    elif is_vegetarian:
        df = df[df['is_vegetarian'] == True]
    if is_gluten_free:
        df = df[df['is_gluten_free'] == True]
    if is_dairy_free:
        df = df[df['is_dairy_free'] == True]
    return df


if __name__ == '__main__':
    df = get_foods_dataframe()
    print(f"Total foods: {len(df)}")
    print(f"\nBy category:")
    print(df.groupby('category').size())
    print(f"\nVegan options: {len(get_foods_by_dietary(is_vegan=True))}")
    print(f"Vegetarian options: {len(get_foods_by_dietary(is_vegetarian=True))}")
