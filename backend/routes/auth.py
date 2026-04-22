"""
CyberShield AI - Authentication Routes
Signup, Login, Logout, Token refresh
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
import logging

from database import insert_user, get_user_by_email
from utils.auth import AuthUtil, validate_email, validate_password_strength

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """User signup endpoint"""
    try:
        data = request.get_json()
        
        # Validation
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip()
        password = data.get('password', '')
        name = data.get('name', '').strip()
        
        if not all([email, password, name]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        is_valid, feedback = validate_password_strength(password)
        if not is_valid:
            return jsonify({'error': f'Password too weak: {feedback}'}), 400
        
        # Check if user exists
        if get_user_by_email(email):
            return jsonify({'error': 'Email already registered'}), 409
        
        # Hash password
        hashed_password = AuthUtil.hash_password(password)
        
        # Create user
        user_data = {
            'name': name,
            'email': email,
            'password': hashed_password,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        user_id = insert_user(user_data)
        
        # Generate token
        token = AuthUtil.generate_token(user_id)
        
        return jsonify({
            'message': 'Signup successful',
            'user_id': str(user_id),
            'token': token
        }), 201
    
    except Exception as e:
        logger.error(f"Signup error: {e}")
        return jsonify({'error': 'Signup failed'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        if not all([email, password]):
            return jsonify({'error': 'Missing email or password'}), 400
        
        # Find user
        user = get_user_by_email(email)
        
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Verify password
        if not AuthUtil.verify_password(password, user['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate token
        token = AuthUtil.generate_token(user['_id'])
        
        return jsonify({
            'message': 'Login successful',
            'user_id': str(user['_id']),
            'token': token,
            'user': {
                'id': str(user['_id']),
                'name': user['name'],
                'email': user['email']
            }
        }), 200
    
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'error': 'Login failed'}), 500

@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    """Verify if token is valid"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'No token provided'}), 400
        
        payload = AuthUtil.verify_token(token)
        
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        return jsonify({
            'valid': True,
            'user_id': payload['user_id']
        }), 200
    
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        return jsonify({'error': 'Verification failed'}), 500
