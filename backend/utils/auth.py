"""
CyberShield AI - Authentication & Security Utilities
JWT Token handling, Password hashing, etc.
"""
from functools import wraps
from datetime import datetime, timedelta
from flask import request, jsonify
import jwt
import bcrypt
from config import get_config

config = get_config()

class AuthUtil:
    """Authentication utilities"""
    
    @staticmethod
    def hash_password(password):
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(password, hashed_password):
        """Verify password against hash"""
        try:
            return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
        except Exception:
            return False
    
    @staticmethod
    def generate_token(user_id, expires_in=None):
        """Generate JWT token"""
        if expires_in is None:
            expires_in = config.JWT_ACCESS_TOKEN_EXPIRES
        
        payload = {
            'user_id': str(user_id),
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + expires_in
        }
        
        token = jwt.encode(
            payload,
            config.JWT_SECRET_KEY,
            algorithm='HS256'
        )
        return token
    
    @staticmethod
    def verify_token(token):
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(
                token,
                config.JWT_SECRET_KEY,
                algorithms=['HS256']
            )
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    @staticmethod
    def get_token_from_request(request):
        """Extract token from request headers"""
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None
        
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None
        
        return parts[1]

def token_required(f):
    """Decorator: Require valid JWT token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = AuthUtil.get_token_from_request(request)
        
        if not token:
            return jsonify({'error': 'Missing authorization token'}), 401
        
        payload = AuthUtil.verify_token(token)
        
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Add user_id to request context
        request.user_id = payload['user_id']
        return f(*args, **kwargs)
    
    return decorated_function

def validate_email(email):
    """Validate email format"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password_strength(password):
    """
    Validate password strength
    Returns: (is_valid, feedback)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password)
    
    if not (has_upper and has_lower and has_digit and has_special):
        return False, "Password must contain uppercase, lowercase, digit, and special character"
    
    return True, "Password is strong"
