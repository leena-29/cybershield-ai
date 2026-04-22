"""
CyberShield AI - Email Security Analyzer
Spoofing detection, header analysis, phishing patterns
"""
import re
import logging

logger = logging.getLogger(__name__)

class EmailSecurityAnalyzer:
    """Email security analysis"""

    EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    PHISHING_KEYWORDS = {
        'urgent', 'verify', 'click here', 'password', 'bank', 'login',
        'confirm', 'update information', 'act now', 'reset password',
        'account suspended', 'limited time', 'confirm identity',
        'unusual activity', 'unauthorized access'
    }
    SECURITY_TIPS = {
        'LOW': [
            'Verify sender details before replying',
            'Keep spam filters enabled',
            'Check the email domain carefully'
        ],
        'MEDIUM': [
            'Do not click links unless the sender is verified',
            'Inspect the sender domain closely',
            'Use spam and phishing filters'
        ],
        'HIGH': [
            'Do not click links or open attachments',
            'Verify the sender through a separate trusted channel',
            'Report or quarantine the message immediately'
        ]
    }

    TRUSTED_ORGANIZATIONS = {
        'google.com', 'gmail.com', 'microsoft.com', 'outlook.com', 'office.com',
        'amazon.com', 'amazonaws.com', 'facebook.com', 'meta.com', 'paypal.com',
        'apple.com', 'icloud.com', 'github.com', 'cloudflare.com'
    }

    SUSPICIOUS_PREFIXES = {'noreply', 'no-reply', 'support', 'admin', 'notification'}
    
    @staticmethod
    def validate_email(email):
        """Validate email format"""
        return bool(EmailSecurityAnalyzer.EMAIL_REGEX.match((email or '').strip()))
    
    @staticmethod
    def extract_domain(email):
        """Extract domain from email"""
        if '@' not in (email or ''):
            return None
        return email.split('@', 1)[1].strip().lower().rstrip('.')

    @staticmethod
    def _normalize_domain(domain):
        return (domain or '').strip().lower().rstrip('.')

    @staticmethod
    def _score_from_indicators(indicators):
        score = 0
        for indicator, weight in indicators:
            score += weight
        return min(100, score)

    @staticmethod
    def _risk_from_score(score):
        if score <= 30:
            return 'LOW'
        if score <= 60:
            return 'MEDIUM'
        return 'HIGH'

    @staticmethod
    def _keyword_hits(content):
        lower_content = (content or '').lower()
        hits = []
        for keyword in EmailSecurityAnalyzer.PHISHING_KEYWORDS:
            if keyword in lower_content:
                hits.append(keyword)
        return hits

    @staticmethod
    def _build_security_tips(risk_level):
        return EmailSecurityAnalyzer.SECURITY_TIPS.get(risk_level, EmailSecurityAnalyzer.SECURITY_TIPS['LOW'])
    
    @staticmethod
    def check_spoofing(sender_email, expected_domain):
        """Check for email spoofing patterns"""
        sender_domain = EmailSecurityAnalyzer.extract_domain(sender_email)
        normalized_expected = EmailSecurityAnalyzer._normalize_domain(expected_domain)

        issues = []
        score_parts = []

        if not sender_domain:
            return {
                'is_spoofed': False,
                'issues': [],
                'risk': 'LOW',
                'score': 0,
                'sender_domain': None,
                'expected_domain': normalized_expected or None
            }
        
        if normalized_expected:
            if sender_domain != normalized_expected:
                issues.append(f"Domain mismatch: sender domain is {sender_domain}, expected {normalized_expected}")
                score_parts.append(('Domain mismatch', 40))
        else:
            if sender_domain not in EmailSecurityAnalyzer.TRUSTED_ORGANIZATIONS:
                issues.append('Unknown sender domain')
                score_parts.append(('Unknown sender domain', 10))

        local_part = sender_email.split('@', 1)[0].lower()
        if any(local_part.startswith(prefix) or prefix in local_part for prefix in EmailSecurityAnalyzer.SUSPICIOUS_PREFIXES):
            issues.append('Suspicious sender pattern')
            score_parts.append(('Suspicious sender pattern', 15))

        if normalized_expected and sender_domain == normalized_expected:
            issues.append('Expected domain matches sender domain')

        score = EmailSecurityAnalyzer._score_from_indicators(score_parts)
        risk = EmailSecurityAnalyzer._risk_from_score(score)

        return {
            'is_spoofed': len(issues) > 0,
            'issues': issues,
            'risk': risk,
            'score': score,
            'sender_domain': sender_domain,
            'expected_domain': normalized_expected or None
        }
    
    @staticmethod
    def analyze_content(email_content):
        """Analyze email content for phishing patterns"""
        issues = []
        lower_content = email_content.lower()

        hits = EmailSecurityAnalyzer._keyword_hits(email_content)
        for keyword in hits:
            issues.append(f"Contains suspicious keyword: '{keyword}'")

        if re.search(r'!{2,}|\b(urgent|immediate|now|asap)\b', email_content, re.IGNORECASE):
            issues.append('Contains urgency language')

        sensitive_patterns = ['password', 'bank', 'login', 'credit card', 'account number', 'cvv', 'verify']
        for pattern in sensitive_patterns:
            if pattern in lower_content:
                issues.append(f"Requests sensitive information: {pattern}")

        if re.search(r'https?://|href=["\']([^"\']+)["\']', email_content, re.IGNORECASE):
            issues.append('Contains embedded links')

        score = min(100, len(issues) * 15)
        if score <= 30:
            risk = 'LOW'
        elif score <= 60:
            risk = 'MEDIUM'
        else:
            risk = 'HIGH'
        
        return {
            'vulnerable': len(issues) > 0,
            'issues': issues,
            'risk': risk,
            'score': score
        }
    
    @staticmethod
    def check_headers(headers_dict):
        """Analyze email headers for authentication"""
        checks = {
            'SPF': headers_dict.get('SPF', 'FAIL'),
            'DKIM': headers_dict.get('DKIM', 'FAIL'),
            'DMARC': headers_dict.get('DMARC', 'FAIL')
        }
        
        passed = sum(1 for v in checks.values() if v == 'PASS')
        
        return {
            'authentication': checks,
            'score': (passed / 3) * 100,
            'risk': 'Low' if passed == 3 else 'Medium' if passed >= 1 else 'High'
        }

    @staticmethod
    def _calculate_overall_score(spoofing_score, content_score, auth_score):
        score = 0
        score += min(40, spoofing_score)
        score += min(35, content_score)
        if auth_score is not None:
            score += max(0, 25 - int(auth_score / 4))
        return min(100, score)
    
    @staticmethod
    def analyze(email_data):
        """Complete email analysis"""
        try:
            sender_email = (email_data.get('from') or '').strip()
            domain = (email_data.get('domain') or '').strip()
            content = (email_data.get('content') or '').strip()
            headers = email_data.get('headers', {})
            
            if not sender_email:
                return {'error': 'Enter a valid email address', 'risk': 'Unknown'}
            
            if not EmailSecurityAnalyzer.validate_email(sender_email):
                return {'error': 'Enter a valid email address', 'risk': 'Unknown'}
            
            sender_domain = EmailSecurityAnalyzer.extract_domain(sender_email)
            spoofing = EmailSecurityAnalyzer.check_spoofing(sender_email, domain) if domain else {
                'is_spoofed': False,
                'issues': ['Unknown domain'],
                'risk': 'LOW',
                'score': 10,
                'sender_domain': sender_domain,
                'expected_domain': None
            }
            content_analysis = EmailSecurityAnalyzer.analyze_content(content) if content else {
                'vulnerable': False,
                'issues': [],
                'risk': 'LOW',
                'score': 0
            }
            header_auth = EmailSecurityAnalyzer.check_headers(headers) if headers else {'authentication': {}, 'score': 0, 'risk': 'Unknown'}
            
            overall_score = EmailSecurityAnalyzer._calculate_overall_score(
                spoofing.get('score', 0),
                content_analysis.get('score', 0),
                header_auth.get('score', 0)
            )

            if overall_score <= 30:
                overall_risk = 'LOW'
            elif overall_score <= 60:
                overall_risk = 'MEDIUM'
            else:
                overall_risk = 'HIGH'

            indicators = []
            indicators.extend(spoofing.get('issues', []))
            indicators.extend(content_analysis.get('issues', []))
            if domain and sender_domain and EmailSecurityAnalyzer._normalize_domain(domain) != EmailSecurityAnalyzer._normalize_domain(sender_domain):
                indicators.append('Domain mismatch detected')

            if not domain:
                indicators.append('Expected domain not provided')

            unique_indicators = []
            for item in indicators:
                if item not in unique_indicators:
                    unique_indicators.append(item)

            if overall_risk == 'LOW':
                security_tips = EmailSecurityAnalyzer.SECURITY_TIPS['LOW']
            elif overall_risk == 'MEDIUM':
                security_tips = EmailSecurityAnalyzer.SECURITY_TIPS['MEDIUM']
            else:
                security_tips = EmailSecurityAnalyzer.SECURITY_TIPS['HIGH']
            
            return {
                'senderEmail': sender_email,
                'senderDomain': sender_domain,
                'expectedDomain': EmailSecurityAnalyzer._normalize_domain(domain) if domain else '',
                'overallRisk': overall_risk,
                'riskLevel': overall_risk,
                'score': overall_score,
                'spoofing': spoofing,
                'content': content_analysis,
                'authentication': header_auth,
                'indicators': unique_indicators,
                'securityTips': security_tips
            }
        
        except Exception as e:
            logger.error(f"Email analysis error: {e}")
            return {
                'overallRisk': 'HIGH',
                'riskLevel': 'HIGH',
                'error': 'Unable to analyze email'
            }
