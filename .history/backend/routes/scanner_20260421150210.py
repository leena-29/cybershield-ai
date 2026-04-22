"""
CyberShield AI - Scanner Routes
API endpoints for all security scanners
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
import logging

from database import insert_scan
from utils.auth import token_required
from services.password_analyzer import PasswordAnalyzer
from services.website_scanner import WebsiteScanner
from ai_models.phishing_detector import phishing_model
from services.domain_intelligence import DomainIntelligence
from services.breach_detector import BreachDetector
from services.ip_analyzer import IPIntelligence
from services.email_analyzer import EmailSecurityAnalyzer
from services.risk_scorer import RiskScoringEngine

logger = logging.getLogger(__name__)

scanner_bp = Blueprint('scanner', __name__, url_prefix='/api/scan')

@scanner_bp.route('/password', methods=['POST'])
@token_required
def scan_password():
    """Analyze password strength"""
    try:
        data = request.get_json()
        password = data.get('password', '')
        
        if not password:
            return jsonify({'error': 'Password required'}), 400
        
        result = PasswordAnalyzer.analyze(password)
        
        # Save scan
        scan_data = {
            'user_id': request.user_id,
            'scan_type': 'password',
            'target': '***',
            'result': result,
            'status': 'completed'
        }
        scan_id = insert_scan(scan_data)
        
        return jsonify({
            'scan_id': str(scan_id),
            'result': result
        }), 200
    
    except Exception as e:
        logger.error(f"Password scan error: {e}")
        return jsonify({'error': str(e)}), 500

@scanner_bp.route('/website', methods=['POST'])
@token_required
def scan_website():
    """Scan website security"""
    try:
        data = request.get_json() or {}
        url = (data.get('url') or '').strip()

        if not url:
            return jsonify({'error': 'Website URL cannot be empty'}), 400

        is_valid, validation_error, _ = WebsiteScanner.validate_url(url)
        if not is_valid:
            return jsonify({'error': validation_error}), 400
        
        result = WebsiteScanner.scan(url)

        if not result.get('scannable'):
            status_code = 400 if result.get('error') in {
                'Website URL cannot be empty',
                'Enter a valid website URL',
                'Credentials in URL are not allowed',
                'Target host is not allowed',
                'Could not resolve target host'
            } else 502
            return jsonify({'error': result.get('error', 'Website scan failed'), 'result': result}), status_code
        
        # Save scan
        scan_data = {
            'user_id': request.user_id,
            'scan_type': 'website',
            'target': url,
            'result': result,
            'status': 'completed'
        }
        scan_id = insert_scan(scan_data)
        
        return jsonify({
            'scan_id': str(scan_id),
            'result': result
        }), 200
    
    except Exception as e:
        logger.error(f"Website scan error: {e}")
        return jsonify({'error': str(e)}), 500

@scanner_bp.route('/phishing', methods=['POST'])
@token_required
def scan_phishing():
    """Detect phishing URL"""
    try:
        data = request.get_json()
        url = data.get('url', '')
        
        if not url:
            return jsonify({'error': 'URL required'}), 400
        
        is_phishing, confidence = phishing_model.predict(url)
        
        result = {
            'url': url,
            'is_phishing': is_phishing,
            'confidence': round(confidence, 2),
            'risk': 'High' if is_phishing else 'Low'
        }
        
        # Save scan
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
    
    except Exception as e:
        logger.error(f"Phishing scan error: {e}")
        return jsonify({'error': str(e)}), 500

@scanner_bp.route('/domain', methods=['POST'])
@token_required
def scan_domain():
    """Analyze domain"""
    try:
        data = request.get_json()
        domain = data.get('domain', '')
        
        if not domain:
            return jsonify({'error': 'Domain required'}), 400
        
        result = DomainIntelligence.analyze(domain)
        
        # Save scan
        scan_data = {
            'user_id': request.user_id,
            'scan_type': 'domain',
            'target': domain,
            'result': result,
            'status': 'completed'
        }
        scan_id = insert_scan(scan_data)
        
        return jsonify({
            'scan_id': str(scan_id),
            'result': result
        }), 200
    
    except Exception as e:
        logger.error(f"Domain scan error: {e}")
        return jsonify({'error': str(e)}), 500

@scanner_bp.route('/breach', methods=['POST'])
@token_required
def scan_breach():
    """Check for data breaches"""
    try:
        data = request.get_json()
        email = data.get('email', '')
        
        if not email:
            return jsonify({'error': 'Email required'}), 400
        
        result = BreachDetector.analyze(email, 'email')
        
        # Save scan
        scan_data = {
            'user_id': request.user_id,
            'scan_type': 'breach',
            'target': email,
            'result': result,
            'status': 'completed'
        }
        scan_id = insert_scan(scan_data)
        
        return jsonify({
            'scan_id': str(scan_id),
            'result': result
        }), 200
    
    except Exception as e:
        logger.error(f"Breach scan error: {e}")
        return jsonify({'error': str(e)}), 500

@scanner_bp.route('/ip', methods=['POST'])
@token_required
def scan_ip():
    """Analyze IP address"""
    try:
        data = request.get_json()
        ip = data.get('ip', '')
        
        if not ip:
            return jsonify({'error': 'IP address required'}), 400
        
        result = IPIntelligence.analyze(ip)
        
        # Save scan
        scan_data = {
            'user_id': request.user_id,
            'scan_type': 'ip',
            'target': ip,
            'result': result,
            'status': 'completed'
        }
        scan_id = insert_scan(scan_data)
        
        return jsonify({
            'scan_id': str(scan_id),
            'result': result
        }), 200
    
    except Exception as e:
        logger.error(f"IP scan error: {e}")
        return jsonify({'error': str(e)}), 500

@scanner_bp.route('/email', methods=['POST'])
@token_required
def scan_email():
    """Analyze email security"""
    try:
        data = request.get_json()
        email = data.get('email', '')
        domain = data.get('domain', '')
        content = data.get('content', '')
        
        if not email:
            return jsonify({'error': 'Email address required'}), 400
        
        result = EmailSecurityAnalyzer.analyze({
            'from': email,
            'domain': domain,
            'content': content
        })
        
        # Save scan
        scan_data = {
            'user_id': request.user_id,
            'scan_type': 'email',
            'target': email,
            'result': result,
            'status': 'completed'
        }
        scan_id = insert_scan(scan_data)
        
        return jsonify({
            'scan_id': str(scan_id),
            'result': result
        }), 200
    
    except Exception as e:
        logger.error(f"Email scan error: {e}")
        return jsonify({'error': str(e)}), 500

@scanner_bp.route('/risk-analysis', methods=['POST'])
@token_required
def risk_analysis():
    """Calculate unified risk score"""
    try:
        data = request.get_json()
        scan_results = data.get('results', {})
        
        unified_score = RiskScoringEngine.calculate_unified_score(scan_results)
        alert = RiskScoringEngine.generate_alert(unified_score['score'])
        recommendations = RiskScoringEngine.get_recommendations(scan_results)
        
        return jsonify({
            'unified_score': unified_score,
            'alert': alert,
            'recommendations': recommendations
        }), 200
    
    except Exception as e:
        logger.error(f"Risk analysis error: {e}")
        return jsonify({'error': str(e)}), 500
