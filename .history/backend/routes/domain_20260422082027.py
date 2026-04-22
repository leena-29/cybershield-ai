"""
CyberShield AI - Domain Intelligence Routes
Dedicated endpoint for domain analysis.
"""
from datetime import datetime, timezone
import logging
import re
from urllib.parse import urlparse

import whois
from flask import Blueprint, jsonify, request

from database import insert_scan
from utils.auth import token_required

logger = logging.getLogger(__name__)

domain_bp = Blueprint('domain', __name__, url_prefix='/api/domain')

TRUSTED_BRANDS = {
    'google', 'facebook', 'amazon', 'apple', 'microsoft', 'paypal', 'github', 'bank'
}

TRUSTED_OFFICIAL_DOMAINS = {
    'google.com',
    'github.com',
    'microsoft.com',
    'amazon.com',
    'apple.com',
    'facebook.com',
    'paypal.com'
}

SUSPICIOUS_WORDS = {
    'login',
    'secure',
    'verify',
    'update',
    'account',
    'bank'
}


def _sanitize_domain_input(value):
    return value.strip() if isinstance(value, str) else ''


def _extract_domain(input_value):
    value = _sanitize_domain_input(input_value)
    if not value:
        return None, 'Domain cannot be empty'

    if '://' in value:
        try:
            parsed = urlparse(value)
            host = parsed.hostname
            if not host:
                return None, 'Enter a valid domain or URL'
            value = host
        except Exception:
            return None, 'Enter a valid domain or URL'

    value = value.lower().strip().rstrip('.')
    if value.startswith('www.'):
        value = value[4:]

    if not re.match(r'^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$', value):
        return None, 'Enter a valid domain or URL'

    return value, ''


def _to_datetime(value):
    if isinstance(value, list):
        value = value[0] if value else None
    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)
    return None


def _is_random_label(label):
    if len(label) < 6:
        return False
    has_letter = any(ch.isalpha() for ch in label)
    has_digit = any(ch.isdigit() for ch in label)
    return has_letter and has_digit


def _is_official_or_subdomain(domain):
    # Treat the exact trusted domain and its subdomains as official.
    for trusted_domain in TRUSTED_OFFICIAL_DOMAINS:
        if domain == trusted_domain or domain.endswith(f'.{trusted_domain}'):
            return True
    return False


def _calculate_score(domain, age_days):
    score = 0
    indicators = []

    first_label = domain.split('.')[0]

    if age_days is not None and age_days < 365:
        score += 20
        indicators.append('Domain age is less than 1 year')

    is_official = _is_official_or_subdomain(domain)
    keyword_hits = [kw for kw in TRUSTED_BRANDS if kw in domain]
    if keyword_hits and not is_official:
        score += 40
        indicators.append(f"Suspicious brand keyword usage: {', '.join(sorted(keyword_hits))}")

    suspicious_hits = [word for word in SUSPICIOUS_WORDS if word in domain]
    if suspicious_hits:
        score += 30
        indicators.append(f"Suspicious word usage: {', '.join(sorted(suspicious_hits))}")

    hyphen_count = domain.count('-')
    if hyphen_count == 1:
        score += 10
        indicators.append('Hyphenated domain structure')
    elif hyphen_count >= 2:
        score += 20
        indicators.append('Misleading domain structure with multiple hyphens')

    if _is_random_label(first_label):
        score += 15
        indicators.append('Domain label looks random')

    if len(domain) > 30:
        score += 10
        indicators.append('Domain name is unusually long')

    if score > 100:
        score = 100

    if score >= 61:
        risk_level = 'High'
    elif score >= 31:
        risk_level = 'Medium'
    else:
        risk_level = 'Low'

    return score, risk_level, indicators


@domain_bp.route('/analyze', methods=['POST'])
@token_required
def analyze_domain():
    try:
        data = request.get_json() or {}
        raw_input = data.get('domain', '')

        domain, error = _extract_domain(raw_input)
        if error:
            return jsonify({'error': error}), 400

        created_date = None
        expiry_date = None
        age_days = None
        whois_error = None

        try:
            whois_data = whois.whois(domain)
            created_dt = _to_datetime(whois_data.creation_date)
            expiry_dt = _to_datetime(whois_data.expiration_date)

            if created_dt:
                now_utc = datetime.now(timezone.utc)
                age_days = max(0, (now_utc - created_dt).days)
                created_date = created_dt.date().isoformat()

            if expiry_dt:
                expiry_date = expiry_dt.date().isoformat()
        except Exception as e:
            whois_error = str(e)
            logger.warning(f'WHOIS lookup failed for {domain}: {e}')

        score, risk_level, indicators = _calculate_score(domain, age_days)

        blacklist_status = 'Unavailable'
        if risk_level == 'High':
            blacklist_status = 'Potentially suspicious'

        result = {
            'domain': domain,
            'age_days': age_days,
            'created_date': created_date,
            'expiry_date': expiry_date,
            'risk_level': risk_level,
            'score': score,
            'indicators': indicators,
            'blacklist_status': blacklist_status,
            'whois_error': whois_error
        }

        scan_id = insert_scan({
            'user_id': request.user_id,
            'scan_type': 'domain',
            'target': domain,
            'result': result,
            'status': 'completed'
        })

        return jsonify({'scan_id': str(scan_id), 'result': result}), 200
    except Exception as e:
        logger.error(f'Domain analyze error: {e}')
        return jsonify({'error': 'Domain analysis failed'}), 500
