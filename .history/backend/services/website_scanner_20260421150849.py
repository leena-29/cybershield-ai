"""
CyberShield AI - Website Security Scanner
Production-oriented website scan logic with SSRF protections.
"""
import ipaddress
import logging
import re
import socket
import ssl
import time
from urllib.parse import urlparse

import requests

logger = logging.getLogger(__name__)


class WebsiteScanner:
    """Advanced website security analysis"""

    SECURITY_HEADERS = {
        'X-Frame-Options',
        'X-Content-Type-Options',
        'Content-Security-Policy',
        'X-XSS-Protection',
        'Strict-Transport-Security',
        'Referrer-Policy',
        'Permissions-Policy'
    }

    XSS_PATTERNS = [
        r'<script',
        r'javascript:',
        r'onerror\s*=',
        r'onload\s*=',
        r'onclick\s*=',
        r'eval\(',
        r'fromCharCode'
    ]

    SQL_PATTERNS = [
        r"'\s*or\s*'",
        r"'\s*--",
        r'union\s+select',
        r'drop\s+table',
        r'insert\s+into',
        r'delete\s+from',
        r'update\s+.+\s+set'
    ]

    BLOCKED_HOSTNAMES = {
        'localhost',
        '0.0.0.0',
        '127.0.0.1',
        '::1'
    }

    REQUEST_TIMEOUT = 5

    @staticmethod
    def sanitize_url(url):
        if not isinstance(url, str):
            return ''
        return url.strip()

    @staticmethod
    def validate_url(url):
        sanitized = WebsiteScanner.sanitize_url(url)

        if not sanitized:
            return False, 'Website URL cannot be empty', None

        if not re.match(r'^https?://', sanitized, re.IGNORECASE):
            return False, 'Enter a valid website URL', None

        try:
            parsed = urlparse(sanitized)
        except Exception:
            return False, 'Enter a valid website URL', None

        if parsed.scheme not in {'http', 'https'} or not parsed.netloc:
            return False, 'Enter a valid website URL', None

        if parsed.username or parsed.password:
            return False, 'Credentials in URL are not allowed', None

        return True, '', parsed

    @staticmethod
    def _is_blocked_ip(ip_value):
        ip_obj = ipaddress.ip_address(ip_value)
        return (
            ip_obj.is_private
            or ip_obj.is_loopback
            or ip_obj.is_link_local
            or ip_obj.is_multicast
            or ip_obj.is_reserved
        )

    @staticmethod
    def _resolve_ips(hostname):
        ips = set()
        for family, _, _, _, sockaddr in socket.getaddrinfo(hostname, None):
            if family in (socket.AF_INET, socket.AF_INET6):
                ips.add(sockaddr[0])
        return list(ips)

    @staticmethod
    def is_ssrf_safe(hostname):
        if not hostname:
            return False, 'Invalid hostname'

        normalized = hostname.strip('[]').lower()

        if normalized in WebsiteScanner.BLOCKED_HOSTNAMES or normalized.endswith('.local'):
            return False, 'Target host is not allowed'

        try:
            ipaddress.ip_address(normalized)
            if WebsiteScanner._is_blocked_ip(normalized):
                return False, 'Target host is not allowed'
            return True, ''
        except ValueError:
            pass

        try:
            resolved_ips = WebsiteScanner._resolve_ips(normalized)
            if not resolved_ips:
                return False, 'Could not resolve target host'

            for ip_value in resolved_ips:
                if WebsiteScanner._is_blocked_ip(ip_value):
                    return False, 'Target host is not allowed'
        except Exception:
            return False, 'Could not resolve target host'

        return True, ''

    @staticmethod
    def check_domain_reachability(url):
        start = time.perf_counter()
        try:
            response = requests.get(
                url,
                timeout=WebsiteScanner.REQUEST_TIMEOUT,
                verify=False,
                allow_redirects=True
            )
            elapsed_ms = int((time.perf_counter() - start) * 1000)
            return {
                'reachable': True,
                'status_code': response.status_code,
                'response_time_ms': elapsed_ms,
                'final_url': response.url,
                'risk': 'Low' if response.status_code < 400 else 'Medium'
            }
        except requests.Timeout:
            return {
                'reachable': False,
                'status_code': None,
                'response_time_ms': int((time.perf_counter() - start) * 1000),
                'final_url': url,
                'error': 'Website request timed out',
                'risk': 'High'
            }
        except Exception as e:
            return {
                'reachable': False,
                'status_code': None,
                'response_time_ms': int((time.perf_counter() - start) * 1000),
                'final_url': url,
                'error': f'Website unreachable: {str(e)}',
                'risk': 'High'
            }

    @staticmethod
    def check_https(url):
        parsed = urlparse(url)
        is_https = parsed.scheme == 'https'

        if not is_https:
            https_url = url.replace('http://', 'https://', 1)
            try:
                response = requests.head(
                    https_url,
                    timeout=WebsiteScanner.REQUEST_TIMEOUT,
                    verify=False,
                    allow_redirects=True
                )
                supports_https = response.status_code < 500
            except Exception:
                supports_https = False
        else:
            supports_https = True

        return {
            'is_https': is_https,
            'supports_https': supports_https,
            'risk': 'Low' if supports_https else 'Medium'
        }

    @staticmethod
    def analyze_ssl_certificate(hostname):
        try:
            context = ssl.create_default_context()
            with socket.create_connection((hostname, 443), timeout=WebsiteScanner.REQUEST_TIMEOUT) as sock:
                with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                    cert = ssock.getpeercert()

            subject = dict(x[0] for x in cert['subject'])
            issued_to = subject.get('commonName', 'Unknown')
            issuer = dict(x[0] for x in cert['issuer'])
            issued_by = issuer.get('commonName', 'Unknown')

            return {
                'valid': True,
                'issued_to': issued_to,
                'issued_by': issued_by,
                'valid_from': cert.get('notBefore', 'Unknown'),
                'valid_until': cert.get('notAfter', 'Unknown'),
                'risk': 'Low'
            }
        except ssl.SSLError as e:
            return {
                'valid': False,
                'error': str(e),
                'risk': 'High'
            }
        except Exception as e:
            return {
                'valid': False,
                'error': f'Could not connect: {str(e)}',
                'risk': 'Medium'
            }

    @staticmethod
    def check_security_headers(url):
        try:
            response = requests.head(
                url,
                timeout=WebsiteScanner.REQUEST_TIMEOUT,
                verify=False,
                allow_redirects=True
            )
            headers = response.headers

            present = []
            missing = []
            for header in WebsiteScanner.SECURITY_HEADERS:
                if header in headers:
                    present.append(header)
                else:
                    missing.append(header)

            score = int((len(present) / len(WebsiteScanner.SECURITY_HEADERS)) * 100)
            return {
                'score': score,
                'present': present,
                'missing': missing,
                'risk': 'Low' if score >= 70 else 'Medium' if score >= 40 else 'High'
            }
        except Exception as e:
            logger.warning(f'Error checking headers: {e}')
            return {
                'score': 0,
                'present': [],
                'missing': list(WebsiteScanner.SECURITY_HEADERS),
                'error': str(e),
                'risk': 'Unknown'
            }

    @staticmethod
    def detect_xss(response_text):
        issues = []
        for pattern in WebsiteScanner.XSS_PATTERNS:
            if re.findall(pattern, response_text, re.IGNORECASE):
                issues.append(f'Potential XSS: {pattern}')

        return {
            'vulnerable': len(issues) > 0,
            'issues': issues,
            'risk': 'High' if len(issues) > 2 else 'Medium' if len(issues) > 0 else 'Low'
        }

    @staticmethod
    def detect_sql_injection(response_text):
        issues = []
        for pattern in WebsiteScanner.SQL_PATTERNS:
            if re.findall(pattern, response_text, re.IGNORECASE):
                issues.append(f'Potential SQL: {pattern}')

        return {
            'vulnerable': len(issues) > 0,
            'issues': issues,
            'risk': 'High' if len(issues) > 2 else 'Medium' if len(issues) > 0 else 'Low'
        }

    @staticmethod
    def calculate_security_score(https_check, ssl_cert, headers, xss_check, sql_check):
        score = 0
        score += 20 if https_check.get('supports_https') else 0
        score += 20 if ssl_cert.get('valid') else 0
        score += int(headers.get('score', 0) * 0.4)
        score += 10 if not xss_check.get('vulnerable') else 0
        score += 10 if not sql_check.get('vulnerable') else 0
        return max(0, min(100, score))

    @staticmethod
    def score_to_risk(score):
        if score >= 75:
            return 'Low'
        if score >= 45:
            return 'Medium'
        return 'High'

    @staticmethod
    def build_recommendations(https_check, ssl_cert, headers, xss_check, sql_check):
        recommendations = []

        if not https_check.get('supports_https'):
            recommendations.append('Enable HTTPS and redirect HTTP to HTTPS.')
        if not ssl_cert.get('valid'):
            recommendations.append('Install a valid SSL certificate from a trusted CA.')

        missing_headers = headers.get('missing', [])
        if missing_headers:
            recommendations.append(
                f"Add missing security headers: {', '.join(missing_headers[:4])}"
            )

        if xss_check.get('vulnerable'):
            recommendations.append('Implement strict output encoding and CSP to reduce XSS risk.')
        if sql_check.get('vulnerable'):
            recommendations.append('Use parameterized queries and sanitize server-side inputs.')

        if not recommendations:
            recommendations.append('Security posture looks good. Continue regular monitoring.')

        return recommendations

    @staticmethod
    def scan(url):
        """Complete website security scan"""
        try:
            is_valid, validation_error, parsed = WebsiteScanner.validate_url(url)
            if not is_valid:
                return {
                    'url': WebsiteScanner.sanitize_url(url),
                    'overall_risk': 'High',
                    'error': validation_error,
                    'scannable': False
                }

            hostname = parsed.hostname
            is_safe, safety_error = WebsiteScanner.is_ssrf_safe(hostname)
            if not is_safe:
                return {
                    'url': parsed.geturl(),
                    'overall_risk': 'High',
                    'error': safety_error,
                    'scannable': False
                }

            reachability = WebsiteScanner.check_domain_reachability(parsed.geturl())
            if not reachability.get('reachable'):
                return {
                    'url': parsed.geturl(),
                    'overall_risk': 'High',
                    'error': reachability.get('error', 'Website unreachable'),
                    'domain_reachability': reachability,
                    'scannable': False
                }

            final_url = reachability.get('final_url') or parsed.geturl()
            final_host = (urlparse(final_url).hostname or hostname)

            https_check = WebsiteScanner.check_https(final_url)
            ssl_cert = WebsiteScanner.analyze_ssl_certificate(final_host)
            headers = WebsiteScanner.check_security_headers(final_url)

            try:
                response = requests.get(
                    final_url,
                    timeout=WebsiteScanner.REQUEST_TIMEOUT,
                    verify=False,
                    allow_redirects=True
                )
                xss_check = WebsiteScanner.detect_xss(response.text)
                sql_check = WebsiteScanner.detect_sql_injection(response.text)
            except Exception:
                xss_check = {'vulnerable': False, 'issues': [], 'risk': 'Unknown'}
                sql_check = {'vulnerable': False, 'issues': [], 'risk': 'Unknown'}

            security_score = WebsiteScanner.calculate_security_score(
                https_check,
                ssl_cert,
                headers,
                xss_check,
                sql_check
            )
            overall_risk = WebsiteScanner.score_to_risk(security_score)

            return {
                'url': final_url,
                'overall_risk': overall_risk,
                'security_score': security_score,
                'domain_reachability': reachability,
                'https': https_check,
                'ssl_certificate': ssl_cert,
                'security_headers': headers,
                'xss_detection': xss_check,
                'sql_injection': sql_check,
                'recommendations': WebsiteScanner.build_recommendations(
                    https_check,
                    ssl_cert,
                    headers,
                    xss_check,
                    sql_check
                ),
                'scannable': True
            }
        except Exception as e:
            logger.error(f'Website scan error: {e}')
            return {
                'url': WebsiteScanner.sanitize_url(url),
                'overall_risk': 'High',
                'error': 'Website scan failed due to an internal error',
                'scannable': False
            }
