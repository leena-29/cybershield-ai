"""
CyberShield AI - IP Intelligence & Geo Location
IP analysis, ISP detection, risk assessment
"""
import logging
import ipaddress

import requests

logger = logging.getLogger(__name__)

class IPIntelligence:
    """IP address analysis and geolocation"""

    CLOUD_PROVIDER_KEYWORDS = {
        'google', 'aws', 'amazon', 'microsoft', 'azure', 'cloudflare', 'gcp',
        'digitalocean', 'linode', 'ovh', 'hetzner', 'oracle', 'akamai', 'alibaba',
        'vultr', 'heroku', 'fastly', 'stackpath', 'leaseweb', 'contabo'
    }

    UNKNOWN_REGION_VALUES = {'', 'unknown', 'n/a', 'na', 'none', 'null'}
    
    @staticmethod
    def validate_ip(ip):
        """Validate IP address format"""
        try:
            ipaddress.ip_address((ip or '').strip())
            return True
        except ValueError:
            return False
    
    @staticmethod
    def _normalize_text(value):
        return str(value).strip() if value is not None else ''

    @staticmethod
    def _fetch_public_ip_data(ip):
        url = f'https://ipapi.co/{ip}/json/'
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        if data.get('error'):
            raise ValueError(data.get('reason') or 'Unable to fetch IP data')

        return data

    @staticmethod
    def _build_info(ip, data):
        country = IPIntelligence._normalize_text(data.get('country_name') or data.get('country')) or 'Unknown'
        region = IPIntelligence._normalize_text(data.get('region') or data.get('region_code')) or 'Unknown'
        city = IPIntelligence._normalize_text(data.get('city')) or 'Unknown'
        isp = IPIntelligence._normalize_text(data.get('org') or data.get('asn') or data.get('network')) or 'Unknown'

        latitude = data.get('latitude')
        longitude = data.get('longitude')

        return {
            'valid': True,
            'ip': ip,
            'country': country,
            'region': region,
            'city': city,
            'isp': isp,
            'latitude': latitude,
            'longitude': longitude,
            'timezone': IPIntelligence._normalize_text(data.get('timezone')) or 'Unknown',
            'organization': IPIntelligence._normalize_text(data.get('org') or data.get('asn')) or 'Unknown',
            'country_code': IPIntelligence._normalize_text(data.get('country_code')) or 'Unknown'
        }

    @staticmethod
    def get_ip_info(ip):
        """Get IP information from a public IP data service"""
        if not IPIntelligence.validate_ip(ip):
            return {
                'valid': False,
                'error': 'Enter a valid IP address'
            }

        data = IPIntelligence._fetch_public_ip_data(ip)

        return {
            'valid': True,
            **IPIntelligence._build_info(ip, data)
        }
    
    @staticmethod
    def check_reputation(ip, info):
        """Check IP reputation"""
        score = 0
        indicators = []

        organization = (info.get('organization') or info.get('isp') or '').lower()
        country = IPIntelligence._normalize_text(info.get('country'))
        region = IPIntelligence._normalize_text(info.get('region'))
        city = IPIntelligence._normalize_text(info.get('city'))

        if any(keyword in organization for keyword in IPIntelligence.CLOUD_PROVIDER_KEYWORDS):
            score += 35
            indicators.append('IP belongs to data center or cloud provider')

        missing_location_parts = [part for part in (country, region, city) if part in IPIntelligence.UNKNOWN_REGION_VALUES]
        if len(missing_location_parts) >= 2:
            score += 20
            indicators.append('Incomplete location data')
        elif len(missing_location_parts) == 1:
            score += 10
            indicators.append('Partial location data available')

        if region.lower() in IPIntelligence.UNKNOWN_REGION_VALUES:
            score += 15
            if 'Unknown region' not in indicators:
                indicators.append('Unknown region')

        if country.lower() in IPIntelligence.UNKNOWN_REGION_VALUES:
            score += 10

        if city.lower() in IPIntelligence.UNKNOWN_REGION_VALUES:
            score += 5

        if score > 100:
            score = 100

        if score <= 30:
            risk = 'LOW'
        elif score <= 60:
            risk = 'MEDIUM'
        else:
            risk = 'HIGH'

        return {
            'score': score,
            'riskLevel': risk,
            'indicators': indicators,
            'securityTips': (
                ['Normal monitoring is sufficient', 'Continue standard access controls'] if risk == 'LOW' else
                ['Monitor for unusual activity', 'Review access patterns periodically'] if risk == 'MEDIUM' else
                ['Investigate usage immediately', 'Block or restrict access if not expected', 'Review logs and alerts']
            )
        }
    
    @staticmethod
    def analyze(ip):
        """Complete IP analysis"""
        try:
            info = IPIntelligence.get_ip_info(ip)
            
            if not info.get('valid'):
                return info
            
            reputation = IPIntelligence.check_reputation(ip, info)
            
            return {
                'valid': True,
                'ip': info['ip'],
                'country': info['country'],
                'region': info['region'],
                'city': info['city'],
                'isp': info['isp'],
                'timezone': info.get('timezone', 'Unknown'),
                'latitude': info.get('latitude'),
                'longitude': info.get('longitude'),
                'riskLevel': reputation['riskLevel'],
                'score': reputation['score'],
                'indicators': reputation['indicators'],
                'securityTips': reputation['securityTips'],
                'summary': {
                    'ip': info['ip'],
                    'country': info['country'],
                    'region': info['region'],
                    'city': info['city'],
                    'isp': info['isp']
                }
            }
        
        except requests.RequestException:
            return {
                'valid': False,
                'error': 'Unable to fetch IP data'
            }
        except Exception as e:
            logger.error(f"IP analysis error: {e}")
            return {
                'valid': False,
                'error': 'Unable to fetch IP data'
            }
