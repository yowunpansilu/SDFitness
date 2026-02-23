"""
SDFitness ML Service — Flask API

Endpoints:
  POST /recommend    — Generate diet plan recommendation
  GET  /health       — Health check
  GET  /model-info   — Model version, accuracy, feature importance
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json

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


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'SDFitness ML Service',
        'model_loaded': MODEL_LOADED,
        'model_version': recommender.version if MODEL_LOADED else None
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

    # Extract user profile (required fields)
    required = ['age', 'weight_kg', 'height_cm', 'gender', 'goal']
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({'error': f'Missing required fields: {missing}'}), 400

    # Extract optional live prices dict
    live_prices = data.get('live_prices_dict', {})

    # Build user profile
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
        return jsonify({
            'success': True,
            'data': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    port = int(os.environ.get('ML_PORT', 5001))
    print(f"🚀 ML Service running on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
