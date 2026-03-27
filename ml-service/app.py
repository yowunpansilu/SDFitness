"""
SDFitness ML Service — Flask API

Endpoints:
  POST /recommend        — Generate diet plan recommendation
  GET  /health           — Health check
  GET  /model-info       — Model version, accuracy, feature importance
  POST /scrape           — Trigger price scraper job
  GET  /scrape/status    — Last scrape job result
  POST /fuzzy-match      — Test fuzzy product name matching
  GET  /barcode/:code    — Open Food Facts barcode lookup
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import threading

from model.recommender import DietRecommender

app = Flask(__name__)
CORS(app)

# Load model on startup
print("🔄 Loading ML model...")
try:
    recommender = DietRecommender()
    MODEL_LOADED = True
except FileNotFoundError as e:
    print(f"⚠️  {e}")
    print("   Run 'python model/train.py' first to train the model.")
    recommender = None
    MODEL_LOADED = False

# Scrape job state (in-memory; production would use Redis/DB)
_scrape_status = {"running": False, "last_result": None}


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy' if MODEL_LOADED else 'degraded',
        'service': 'SDFitness ML Service',
        'model_loaded': MODEL_LOADED,
        'model_version': recommender.version if MODEL_LOADED else None,
        'scraper_available': True,
    })


@app.route('/model-info', methods=['GET'])
def model_info():
    if not MODEL_LOADED:
        return jsonify({'error': 'Model not loaded'}), 503

    return jsonify({
        'version': recommender.version,
        'metrics': recommender.metrics,
        'feature_names': recommender.feature_names
    })


@app.route('/recommend', methods=['POST'])
def recommend():
    if not MODEL_LOADED:
        return jsonify({'error': 'Model not loaded. Train the model first.'}), 503

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body must be JSON'}), 400

    required = ['age', 'weight_kg', 'height_cm', 'gender', 'goal']
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({'error': f'Missing required fields: {missing}'}), 400

    live_prices = data.get('live_prices_dict', {})
    if not live_prices:
        from data.foods_db import get_live_prices_from_db
        live_prices = get_live_prices_from_db()

    user_profile = {
        'age': data['age'],
        'weight_kg': data['weight_kg'],
        'height_cm': data['height_cm'],
        'gender': data['gender'],
        'activity_level': data.get('activity_level', 'moderately_active'),
        'goal': data['goal'],
        'dietary_preferences': data.get('dietary_preferences', []),
        'diet_budget': data.get('diet_budget', {
            'amount': 7000,
            'currency': 'LKR',
            'period': 'weekly'
        })
    }

    try:
        result = recommender.recommend(user_profile, live_prices)
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# Phase 2: Scraper Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.route('/scrape', methods=['POST'])
def trigger_scrape():
    """
    Trigger the price scraper job (runs in background thread).
    Body (optional):
      { "stores": ["Keells", "Sathosa"], "dry_run": false }
    """
    if _scrape_status["running"]:
        return jsonify({"success": False, "error": "Scrape job already running"}), 409

    body = request.get_json(silent=True) or {}
    stores = body.get("stores")  # None = all stores
    dry_run = body.get("dry_run", False)

    def _run():
        _scrape_status["running"] = True
        try:
            from scrapers.price_scraper import run_scrape_job
            result = run_scrape_job(stores=stores, dry_run=dry_run)
            _scrape_status["last_result"] = result
        except Exception as e:
            _scrape_status["last_result"] = {"success": False, "error": str(e)}
        finally:
            _scrape_status["running"] = False

    thread = threading.Thread(target=_run, daemon=True)
    thread.start()

    return jsonify({
        "success": True,
        "message": "Scrape job started in background",
        "dry_run": dry_run,
        "stores": stores or "all",
    })


@app.route('/scrape/status', methods=['GET'])
def scrape_status():
    """Return the status and result of the last scrape job."""
    return jsonify({
        "running": _scrape_status["running"],
        "last_result": _scrape_status["last_result"],
    })


@app.route('/fuzzy-match', methods=['POST'])
def fuzzy_match():
    """
    Test fuzzy matching for a raw scraped product name.
    Body: { "name": "KEELLS Chicken Drumstick 500g" }
    """
    body = request.get_json(silent=True) or {}
    name = body.get("name", "")
    if not name:
        return jsonify({"error": "name is required"}), 400

    from scrapers.food_aliases import fuzzy_match_to_food_id
    result = fuzzy_match_to_food_id(name)
    return jsonify({
        "input": name,
        "match": result,
        "matched": result is not None,
    })


@app.route('/barcode/<code>', methods=['GET'])
def barcode_lookup(code: str):
    """Look up a product by EAN/UPC barcode via Open Food Facts."""
    from scrapers.open_food_facts import lookup_barcode
    result = lookup_barcode(code)
    if result:
        return jsonify({"success": True, "data": result})
    return jsonify({"success": False, "error": "Product not found"}), 404


if __name__ == '__main__':
    port = int(os.environ.get('ML_PORT', 5001))
    print(f"🚀 ML Service running on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
