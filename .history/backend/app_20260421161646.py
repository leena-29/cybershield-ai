"""
CyberShield AI - Main Flask Application
Production-grade cybersecurity platform
"""
import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from config import get_config
from database import db
from database import insert_scan
from utils.auth import token_required
from ai_models.phishing_detector import PhishingHeuristics

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app(env=None):
    """Application factory"""
    app = Flask(__name__)
    
    # Load configuration
    config = get_config(env)
    app.config.from_object(config)
    
    # Initialize CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config.get('CORS_ORIGINS', ['http://localhost:3000']),
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.scanner import scanner_bp
    from routes.history import history_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(scanner_bp)
    app.register_blueprint(history_bp)

    @app.route('/api/phishing-detect', methods=['POST'])
    @token_required
    def phishing_detect_root():
        data = request.get_json() or {}
        url = (data.get('url') or '').strip()

        if not url:
            return jsonify({'error': 'URL cannot be empty'}), 400

        result = PhishingHeuristics.analyze(url)

        scan_data = {
            'user_id': request.user_id,
            'scan_type': 'phishing',
            'target': url,
            'result': result,
            'status': 'completed'
        }
        scan_id = insert_scan(scan_data)

        return jsonify({
            'scan_id': str(scan_id),
            'result': result
        }), 200
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({
            'status': 'healthy',
            'service': 'CyberShield AI',
            'version': '1.0.0'
        }), 200
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({'error': 'Method not allowed'}), 405
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {error}")
        return jsonify({'error': 'Internal server error'}), 500
    
    @app.errorhandler(Exception)
    def handle_exception(e):
        if isinstance(e, HTTPException):
            return jsonify({'error': e.description}), e.code
        logger.error(f"Unhandled exception: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    
    logger.info("✓ CyberShield AI application initialized")
    return app

# Create app instance
app = create_app()

if __name__ == '__main__':
    logger.info("🛡️ Starting CyberShield AI server...")
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
