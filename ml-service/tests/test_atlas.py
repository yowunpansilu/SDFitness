import os, urllib.parse
from pymongo import MongoClient
from dotenv import load_dotenv

# Load .env from root
load_dotenv(dotenv_path="../../.env")

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "keelsPriceDB")

def get_connection():
    uri = MONGO_URI
    if "@" in MONGO_URI:
        if uri.startswith("mongodb+srv://") or uri.startswith("mongodb://"):
            prefix = "mongodb+srv://" if uri.startswith("mongodb+srv://") else "mongodb://"
            body = uri[len(prefix):]
            if "@" in body:
                last_at = body.rfind("@")
                creds = body[:last_at]
                host_part = body[last_at+1:]
                if ":" in creds:
                    user, pwd = creds.split(":", 1)
                    uri = f"{prefix}{urllib.parse.quote(user)}:{urllib.parse.quote(pwd)}@{host_part}"
    return uri

try:
    client = MongoClient(get_connection())
    db = client["test"]
    
    # List collections to verify connection
    collections = db.list_collection_names()
    print(f"✅ Connected to Atlas! Collections: {collections}")
    
    if "products" in collections:
        count = db.products.count_documents({})
        print(f"Found {count} documents in products.")
    else:
        print("⚠️ products collection NOT found.")
        
    client.close()
except Exception as e:
    print(f"❌ Error: {e}")
