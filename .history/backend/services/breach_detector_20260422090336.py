"""
CyberShield AI - Breach Detection System
Email/password breach detection
"""
import logging
import hashlib
import random
import re

logger = logging.getLogger(__name__)

class BreachDetector:
    """Check for data breaches"""

    EMAIL_REGEX = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')

    # Simulated breach database (in production, replace with HaveIBeenPwned API integration)
    SIMULATED_BREACHES = {
        'admin@company.com': [
            {'name': 'LinkedIn', 'date': '2021', 'dataExposed': ['Email', 'Password']},
            {'name': 'Twitter', 'date': '2022', 'dataExposed': ['Email', 'Username']},
            {'name': 'Facebook', 'date': '2019', 'dataExposed': ['Email', 'Phone Number']}
        ],
        'user@gmail.com': [
            {'name': 'Yahoo', 'date': '2021', 'dataExposed': ['Email', 'Password']},
            {'name': 'Adobe', 'date': '2020', 'dataExposed': ['Email', 'Password Hint']}
        ],
        'test@email.com': [
            {'name': 'Dropbox', 'date': '2016', 'dataExposed': ['Email', 'Password']}
        ],
        'john@domain.com': [
            {'name': 'Equifax', 'date': '2017', 'dataExposed': ['Email', 'Address']},
            {'name': 'Target', 'date': '2013', 'dataExposed': ['Email', 'Phone Number']}
        ]
    }

    BREACH_CATALOG = [
        {'name': 'LinkedIn', 'date': '2021', 'dataExposed': ['Email', 'Password']},
        {'name': 'Twitter', 'date': '2022', 'dataExposed': ['Email', 'Username']},
        {'name': 'Facebook', 'date': '2019', 'dataExposed': ['Email', 'Phone Number']},
        {'name': 'Adobe', 'date': '2020', 'dataExposed': ['Email', 'Password Hint']},
        {'name': 'Dropbox', 'date': '2016', 'dataExposed': ['Email', 'Password']},
        {'name': 'Canva', 'date': '2019', 'dataExposed': ['Email', 'Name']},
        {'name': 'MyFitnessPal', 'date': '2018', 'dataExposed': ['Email', 'Username']}
    ]

    SECURITY_TIPS = [
        'Change passwords for breached accounts immediately',
        'Enable 2FA on important accounts',
        'Avoid password reuse across services'
    ]

    @staticmethod
    def normalize_email(email):
        return (email or '').strip().lower()

    @staticmethod
    def is_valid_email(email):
        return bool(BreachDetector.EMAIL_REGEX.match(email or ''))

    @staticmethod
    def calculate_risk(breach_count):
        if breach_count <= 0:
            return 'LOW', 10
        if breach_count == 1:
            return 'MEDIUM', 40
        if breach_count == 2:
            return 'MEDIUM', 60
        # 3+ breaches: HIGH with escalating score up to 100
        score = min(100, 80 + ((breach_count - 3) * 10))
        return 'HIGH', score

    @staticmethod
    def _build_result(email, breaches):
        breach_count = len(breaches)
        risk_level, score = BreachDetector.calculate_risk(breach_count)

        indicators = (
            ['No breaches found']
            if breach_count == 0
            else [f'Email found in {breach_count} breach{'es' if breach_count != 1 else ''}']
        )

        return {
            'email': email,
            'breached': breach_count > 0,
            'breachCount': breach_count,
            'riskLevel': risk_level,
            'score': score,
            'breaches': breaches,
            'indicators': indicators,
            'securityTips': BreachDetector.SECURITY_TIPS
        }
    
    @staticmethod
    def check_email(email):
        """Check if email is in known breaches"""
        email_lower = BreachDetector.normalize_email(email)

        # Check simulated database
        if email_lower in BreachDetector.SIMULATED_BREACHES:
            breaches = BreachDetector.SIMULATED_BREACHES[email_lower]
            return BreachDetector._build_result(email_lower, breaches)

        # Generate simulated result for demo
        email_hash = int(hashlib.md5(email_lower.encode()).hexdigest(), 16)

        if email_hash % 7 == 0:  # Simulate 1 in 7 chance of breach
            breach_count = (email_hash % 3) + 1
            random.seed(email_hash)
            breaches = random.sample(BreachDetector.BREACH_CATALOG, breach_count)
            return BreachDetector._build_result(email_lower, breaches)

        return BreachDetector._build_result(email_lower, [])
    
    @staticmethod
    def check_password(password):
        """Check if password is in breach databases"""
        # Simplified check - in production use Troy Hunt's API
        import hashlib
        
        common_breached = [
            '123456', 'password', '12345678', 'qwerty', '123456789',
            '12345', '1234567', '1234567890', '123123', '000000',
            'password123', 'admin', 'letmein', 'welcome', 'monkey'
        ]
        
        if password in common_breached:
            return {
                'breached': True,
                'seen_count': 'Millions',
                'risk': 'Critical',
                'recommendations': ['Never use this password', 'Choose a unique strong password']
            }
        
        return {
            'breached': False,
            'seen_count': 0,
            'risk': 'Low',
            'recommendations': ['Password appears to be safe']
        }
    
    @staticmethod
    def analyze(input_data, data_type='email'):
        """Analyze breach status"""
        try:
            if data_type == 'email':
                email = BreachDetector.normalize_email(input_data)
                if not email:
                    return {'error': 'Email cannot be empty'}
                if not BreachDetector.is_valid_email(email):
                    return {'error': 'Enter a valid email address'}
                return BreachDetector.check_email(input_data)
            elif data_type == 'password':
                return BreachDetector.check_password(input_data)
            else:
                return {
                    'error': f'Unknown data type: {data_type}',
                    'risk': 'Unknown'
                }
        except Exception as e:
            logger.error(f"Breach detection error: {e}")
            return {
                'error': str(e),
                'risk': 'Unknown'
            }
