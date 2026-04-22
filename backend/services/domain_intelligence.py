"""
CyberShield AI - Domain Intelligence System
WHOIS lookup, domain age, suspicious detection
"""
import requests
import re
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class DomainIntelligence:
    """Domain analysis and intelligence"""
    
    SUSPICIOUS_KEYWORDS = {
        'verify', 'confirm', 'update', 'secure', 'account', 'login',
        'payment', 'billing', 'urgent', 'action', 'click', 'alert',
        'temporary', 'test', 'admin', 'support-', 'help-', 'bank',
        'paypal', 'amazon', 'apple', 'microsoft', 'google'
    }
    
    @staticmethod
    def get_domain(hostname):
        """Extract domain from hostname"""
        parts = hostname.replace('www.', '').split('.')
        if len(parts) >= 2:
            return '.'.join(parts[-2:])
        return hostname
    
    @staticmethod
    def check_suspicious_domain(domain):
        """Check if domain looks suspicious"""
        suspicious_indicators = []
        lower_domain = domain.lower()
        
        # Check for misspellings of popular brands
        brands = {
            'google': ['goog1e', 'g0ogle', 'gogle', 'gooele'],
            'amazon': ['amaz0n', 'amazin', 'amazom'],
            'facebook': ['faceb00k', 'facebok', 'faecbook'],
            'apple': ['appl3', 'appel', 'ple.com'],
            'microsoft': ['microsft', 'micros0ft'],
            'paypal': ['paypa1', 'paypa11', 'paypai'],
        }
        
        for brand, misspellings in brands.items():
            for misspell in misspellings:
                if misspell in lower_domain:
                    suspicious_indicators.append(f"Possible misspelling of {brand}")
        
        # Check for suspicious keywords
        for keyword in DomainIntelligence.SUSPICIOUS_KEYWORDS:
            if keyword in lower_domain:
                suspicious_indicators.append(f"Contains suspicious keyword: '{keyword}'")
        
        # Check for excessive hyphens
        if lower_domain.count('-') > 2:
            suspicious_indicators.append("Contains excessive hyphens")
        
        # Check for numbers in domain
        if re.search(r'\d{4,}', lower_domain):
            suspicious_indicators.append("Contains number sequence")
        
        return {
            'is_suspicious': len(suspicious_indicators) > 0,
            'indicators': suspicious_indicators,
            'risk': 'High' if len(suspicious_indicators) > 2 else 'Medium' if len(suspicious_indicators) > 0 else 'Low'
        }
    
    @staticmethod
    def estimate_domain_age(domain):
        """Estimate domain age (simplified)"""
        # In production, use real WHOIS API
        try:
            # Try to use whois API
            response = requests.get(
                f'https://whois.api.biz/v1/{domain}',
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                created_date = data.get('created_date')
                if created_date:
                    age_days = (datetime.utcnow() - datetime.fromisoformat(created_date.replace('Z', '+00:00'))).days
                    return {
                        'created_date': created_date,
                        'age_days': age_days,
                        'age_category': 'Very New' if age_days < 30 else 'New' if age_days < 180 else 'Established'
                    }
        except Exception as e:
            logger.warning(f"Could not fetch WHOIS data: {e}")
        
        # Fallback - return estimated data
        return {
            'created_date': 'Unknown',
            'age_days': 0,
            'age_category': 'Unknown',
            'note': 'Real WHOIS API recommended'
        }
    
    @staticmethod
    def check_blacklist(domain):
        """Check if domain is in known blacklists"""
        # Simplified check
        suspicious = DomainIntelligence.check_suspicious_domain(domain)
        
        return {
            'blacklisted': suspicious['is_suspicious'],
            'lists': ['Heuristic Detection'] if suspicious['is_suspicious'] else [],
            'risk': suspicious['risk']
        }
    
    @staticmethod
    def analyze(domain):
        """Complete domain analysis"""
        try:
            # Extract domain
            if domain.startswith('http'):
                from urllib.parse import urlparse
                domain = urlparse(domain).netloc
            
            domain_only = DomainIntelligence.get_domain(domain)
            
            suspicious = DomainIntelligence.check_suspicious_domain(domain_only)
            age = DomainIntelligence.estimate_domain_age(domain_only)
            blacklist = DomainIntelligence.check_blacklist(domain_only)
            
            # Overall risk
            risks = [suspicious['risk'], age.get('age_category', 'Unknown')]
            if blacklist['blacklisted']:
                overall_risk = 'High'
            elif 'High' in risks:
                overall_risk = 'High'
            elif 'Medium' in risks or 'New' in risks:
                overall_risk = 'Medium'
            else:
                overall_risk = 'Low'
            
            return {
                'domain': domain_only,
                'overall_risk': overall_risk,
                'suspicious': suspicious,
                'age': age,
                'blacklist': blacklist
            }
        
        except Exception as e:
            logger.error(f"Domain analysis error: {e}")
            return {
                'domain': domain,
                'overall_risk': 'Unknown',
                'error': str(e)
            }
