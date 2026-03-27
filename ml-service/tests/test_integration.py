import os, sys
from dotenv import load_dotenv

# Add the main ml-service folder to path to allow imports from scrapers/data
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

load_dotenv(dotenv_path="../../.env")

from data.foods_db import get_live_prices_from_db

print("--- Testing Live Price Matching from Atlas ---")
prices = get_live_prices_from_db()

if not prices:
    print("❌ No matches found or connection failed.")
else:
    print(f"✅ Found matches for {len(prices)} foods:")
    print("-" * 50)
    for food_id, data in prices.items():
        print(f"Food ID: {food_id:20} | Price/g: {data['pricePerGram']:.4f} | Conf: {data['confidence']:.2f} | Name: {data['matched_name']}")
    print("-" * 50)
