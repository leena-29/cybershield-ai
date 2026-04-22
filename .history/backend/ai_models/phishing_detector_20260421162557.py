"""
CyberShield AI - ML Models Training
Phishing Detection, URL Analysis, etc.
"""
import pickle
import os
import logging
import ipaddress
import re
from urllib.parse import urlparse
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import numpy as np

logger = logging.getLogger(__name__)

MODEL_DIR = os.path.join(os.path.dirname(__file__))


class PhishingHeuristics:
    """Deterministic phishing detection rules."""

    SUSPICIOUS_KEYWORDS = {
        'login', 'verify', 'secure', 'update', 'account', 'banking'
    }

    PRIMARY_KEYWORDS = {
        'login', 'verify', 'secure', 'update'
    }

    BRANDS = {
        'paypal', 'google', 'facebook', 'bank', 'amazon', 'apple', 'microsoft', 'netflix', 'linkedin'
    }

    LEGITIMATE_BRAND_DOMAINS = {
        'google.com',
        'facebook.com',
        'paypal.com',
        'amazon.com',
        'apple.com',
        'microsoft.com',
        'netflix.com',
        'linkedin.com'
    }

    SUBSTITUTIONS = str.maketrans({
        '0': 'o',
        '1': 'l',
        '3': 'e',
        '4': 'a',
        '5': 's',
        '7': 't',
        '@': 'a',
        '$': 's'
    })

    @staticmethod
    def sanitize_url(url):
        return url.strip() if isinstance(url, str) else ''

    @staticmethod
    def validate_url(url):
        sanitized = PhishingHeuristics.sanitize_url(url)
        if not sanitized:
            return False, 'URL cannot be empty', None

        parsed = urlparse(sanitized)
        if parsed.scheme not in {'http', 'https'} or not parsed.netloc:
            return False, 'Enter a valid URL', None

        if parsed.username or parsed.password:
            return False, 'Enter a valid URL', None

        return True, '', parsed

    @staticmethod
    def is_blocked_internal_host(hostname):
        if not hostname:
            return True

        normalized = hostname.lower().strip('[]')
        if normalized in {'localhost', '127.0.0.1', '0.0.0.0', '::1'}:
            return True

        try:
            ip_obj = ipaddress.ip_address(normalized)
            return (
                ip_obj.is_private
                or ip_obj.is_loopback
                or ip_obj.is_link_local
                or ip_obj.is_reserved
                or ip_obj.is_unspecified
            )
        except ValueError:
            return False

    @staticmethod
    def is_ip_host(hostname):
        try:
            ipaddress.ip_address(hostname)
            return True
        except ValueError:
            return False

    @staticmethod
    def normalize_domain(hostname):
        hostname = hostname.lower().strip('.').replace('www.', '', 1)
        return hostname

    @staticmethod
    def detect_brand_impersonation(hostname):
        reasons = []
        normalized = PhishingHeuristics.normalize_domain(hostname)
        base_domain = '.'.join(normalized.split('.')[-2:]) if len(normalized.split('.')) >= 2 else normalized

        if base_domain in PhishingHeuristics.LEGITIMATE_BRAND_DOMAINS:
            return reasons

        transformed = normalized.translate(PhishingHeuristics.SUBSTITUTIONS)

        for brand in PhishingHeuristics.BRANDS:
            if brand in normalized and normalized != brand and not normalized.endswith(f'.{brand}'):
                reasons.append(f'Possible brand impersonation of {brand}')
                break

            if brand in transformed and normalized != brand and not normalized.endswith(f'.{brand}'):
                reasons.append(f'Possible brand impersonation of {brand}')
                break

        return reasons

    @staticmethod
    def has_fake_domain_pattern(hostname, keyword_hits):
        normalized = PhishingHeuristics.normalize_domain(hostname)
        first_label = normalized.split('.')[0] if normalized else ''

        contains_brand = any(brand in first_label for brand in PhishingHeuristics.BRANDS)
        contains_keyword = any(keyword in first_label for keyword in keyword_hits)
        contains_digits = any(char.isdigit() for char in first_label)
        contains_separators = '-' in first_label or '_' in first_label

        return contains_brand and (contains_keyword or contains_digits or contains_separators)

    @staticmethod
    def analyze(url):
        is_valid, error, parsed = PhishingHeuristics.validate_url(url)
        if not is_valid:
            return {
                'risk': 'High',
                'score': 100,
                'reasons': [error],
                'is_phishing': True,
                'confidence': 100,
                'url': PhishingHeuristics.sanitize_url(url)
            }

        reasons = []
        score = 0

        hostname = parsed.hostname or ''
        full_url = parsed.geturl()
        url_lower = full_url.lower()

        if PhishingHeuristics.is_blocked_internal_host(hostname):
            return {
                'url': full_url,
                'risk': 'High',
                'score': 100,
                'reasons': ['Target host is not allowed'],
                'is_phishing': True,
                'confidence': 100,
                'error': 'Target host is not allowed'
            }

        keyword_hits = [kw for kw in PhishingHeuristics.SUSPICIOUS_KEYWORDS if kw in url_lower]
        if keyword_hits:
            reasons.append(f"Contains suspicious keyword(s): {', '.join(sorted(keyword_hits))}")
            score += 20 * len(keyword_hits)

        if len(full_url) > 75:
            reasons.append('URL length is unusually long')
            score += 10

        if '@' in full_url:
            reasons.append('Contains @ symbol')
            score += 35

        if PhishingHeuristics.is_ip_host(hostname):
            reasons.append('Uses IP address instead of domain')
            score += 30

        subdomain_count = max(0, len([part for part in hostname.split('.') if part]) - 2)
        if subdomain_count >= 3:
            reasons.append('Contains too many subdomains')
            score += 12
        elif subdomain_count == 2:
            reasons.append('Contains multiple subdomains')
            score += 6

        if hostname.startswith('xn--') or '.xn--' in hostname:
            reasons.append('Uses an internationalized/punycode domain')
            score += 10

        brand_reasons = PhishingHeuristics.detect_brand_impersonation(hostname)
        if brand_reasons:
            reasons.extend(brand_reasons)
            score += 40

        if brand_reasons and keyword_hits:
            reasons.append('Contains both suspicious keyword and brand impersonation signals')
            score += 20

        if PhishingHeuristics.has_fake_domain_pattern(hostname, keyword_hits):
            reasons.append('Domain format appears fake or crafted for phishing')
            score += 20

        # HTTPS alone is not trusted as a safe signal, so we do not reduce risk for it.
        score = min(100, score)

        if score >= 61:
            risk = 'High'
        elif score >= 31:
            risk = 'Medium'
        else:
            risk = 'Low'

        if not reasons:
            reasons.append('No phishing indicators detected')

        confidence = score
        is_phishing = risk == 'High'

        return {
            'url': full_url,
            'risk': risk,
            'score': score,
            'reasons': reasons,
            'is_phishing': is_phishing,
            'confidence': confidence
        }

class URLFeatureExtractor:
    """Extract features from URLs for ML analysis"""
    
    @staticmethod
    def extract_features(url):
        """Extract numerical features from URL"""
        try:
            parsed = urlparse(url)
            
            features = {
                'url_length': len(url),
                'domain_length': len(parsed.netloc),
                'path_length': len(parsed.path),
                'num_slashes': url.count('/'),
                'num_dots': url.count('.'),
                'num_hyphens': url.count('-'),
                'num_underscores': url.count('_'),
                'num_percent': url.count('%'),
                'num_params': len(parsed.query.split('&')) if parsed.query else 0,
                'has_https': 1 if parsed.scheme == 'https' else 0,
                'has_ip_address': 1 if _is_ip_address(parsed.netloc.split(':')[0]) else 0,
                'num_digits': sum(1 for c in url if c.isdigit()),
                'num_special_chars': sum(1 for c in url if not c.isalnum() and c not in [':', '/', '.', '-', '_', '?', '=', '&'])
            }
            
            return features
        except Exception as e:
            logger.error(f"Error extracting URL features: {e}")
            return None
    
    @staticmethod
    def features_to_vector(features):
        """Convert features dict to numpy vector"""
        if not features:
            return None
        keys = sorted(features.keys())
        return np.array([features[k] for k in keys]).reshape(1, -1)

def _is_ip_address(domain):
    """Check if domain is an IP address"""
    import re
    ip_pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
    return bool(re.match(ip_pattern, domain))

class PhishingDetectionModel:
    """Pre-trained Phishing Detection Model"""
    
    def __init__(self):
        self.model_path = os.path.join(MODEL_DIR, 'phishing_model.pkl')
        self.scaler_path = os.path.join(MODEL_DIR, 'phishing_scaler.pkl')
        self.model = None
        self.scaler = None
        self._load_or_train_model()
    
    def _load_or_train_model(self):
        """Load trained model or train a new one"""
        if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
            try:
                with open(self.model_path, 'rb') as f:
                    self.model = pickle.load(f)
                with open(self.scaler_path, 'rb') as f:
                    self.scaler = pickle.load(f)
                logger.info("✓ Phishing model loaded from disk")
                return
            except Exception as e:
                logger.warning(f"Could not load model: {e}")
        
        # Train new model if not found
        logger.info("Training new phishing detection model...")
        self._train_model()
    
    def _train_model(self):
        """Train phishing detection model"""
        # Sample training data (legitimate URLs)
        legit_urls = [
            'https://www.google.com',
            'https://github.com',
            'https://stackoverflow.com',
            'https://python.org',
            'https://www.netflix.com',
            'https://amazon.com',
            'https://twitter.com',
            'https://facebook.com',
            'https://linkedin.com',
            'https://www.wikipedia.org',
            'https://www.youtube.com',
            'https://www.reddit.com',
            'https://medium.com',
            'https://developer.mozilla.org',
            'https://www.w3schools.com',
        ]
        
        # Sample training data (phishing URLs)
        phishing_urls = [
            'http://g00gle.com',
            'http://amaz0n.com',
            'http://192.168.1.1/login',
            'http://goog1e-login.tk',
            'http://fake-amazon.com.phishing-site.xyz',
            'http://faecbook.com',
            'http://g00gle-verify.xyz',
            'http://bankofamerica-verify.tk',
            'http://paypal-login-update.tk',
            'http://apple-id-verify.xyz',
            'http://netflix-verify.com',
            'http://verify-account123.xyz',
            'http://update-details.tk',
            'http://confirm-identity.xyz',
            'http://re-verify.tk',
        ]
        
        extractor = URLFeatureExtractor()
        X_legit = []
        X_phishing = []
        
        # Extract features
        for url in legit_urls:
            features = extractor.extract_features(url)
            if features:
                X_legit.append(list(features.values()))
        
        for url in phishing_urls:
            features = extractor.extract_features(url)
            if features:
                X_phishing.append(list(features.values()))
        
        X = np.array(X_legit + X_phishing)
        y = np.array([0] * len(X_legit) + [1] * len(X_phishing))
        
        # Scale features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X_scaled, y)
        
        # Save model
        os.makedirs(MODEL_DIR, exist_ok=True)
        with open(self.model_path, 'wb') as f:
            pickle.dump(self.model, f)
        with open(self.scaler_path, 'wb') as f:
            pickle.dump(self.scaler, f)
        
        logger.info("✓ Phishing model trained and saved")
    
    def predict(self, url):
        """
        Predict if URL is phishing
        Returns: (is_phishing, confidence)
        """
        try:
            extractor = URLFeatureExtractor()
            features = extractor.extract_features(url)
            
            if not features:
                return None, 0.0
            
            X = extractor.features_to_vector(features)
            X_scaled = self.scaler.transform(X)
            
            prediction = self.model.predict(X_scaled)[0]
            probability = self.model.predict_proba(X_scaled)[0]
            
            is_phishing = bool(prediction)
            confidence = float(probability[1]) * 100  # Confidence of phishing
            
            return is_phishing, confidence
        except Exception as e:
            logger.error(f"Error predicting phishing: {e}")
            return None, 0.0

# Initialize models on import
phishing_model = PhishingDetectionModel()
