"""
CyberShield AI - Risk Scoring Engine
Unified risk calculation and aggregation
"""
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class RiskScoringEngine:
    """Calculate unified risk scores"""
    
    # Risk weights
    WEIGHTS = {
        'password': 0.25,
        'website': 0.20,
        'phishing': 0.20,
        'domain': 0.15,
        'breach': 0.20
    }
    
    RISK_SCORES = {
        'Low': 20,
        'Medium': 50,
        'High': 75,
        'Critical': 95,
        'Unknown': 50
    }
    
    @staticmethod
    def risk_to_score(risk_level):
        """Convert risk level to numeric score"""
        return RiskScoringEngine.RISK_SCORES.get(risk_level, 50)
    
    @staticmethod
    def categorize_risk(score):
        """Categorize numeric score to risk level"""
        if score < 30:
            return 'Low'
        elif score < 50:
            return 'Medium'
        elif score < 75:
            return 'High'
        else:
            return 'Critical'
    
    @staticmethod
    def get_color(risk_level):
        """Get color for risk level"""
        colors = {
            'Low': '#10B981',      # Green
            'Medium': '#F59E0B',   # Yellow/Orange
            'High': '#EF4444',     # Red
            'Critical': '#8B5CF6'  # Purple
        }
        return colors.get(risk_level, '#6B7280')
    
    @staticmethod
    def calculate_unified_score(scan_results):
        """
        Calculate unified risk score from multiple scans
        
        scan_results: {
            'password': {...},
            'website': {...},
            'phishing': {...},
            'domain': {...},
            'breach': {...}
        }
        """
        try:
            weighted_score = 0
            total_weight = 0
            
            for scan_type, result in scan_results.items():
                if not result:
                    continue
                
                weight = RiskScoringEngine.WEIGHTS.get(scan_type, 0)
                risk_level = result.get('overall_risk') or result.get('risk') or 'Unknown'
                score = RiskScoringEngine.risk_to_score(risk_level)
                
                weighted_score += score * weight
                total_weight += weight
            
            if total_weight == 0:
                unified_score = 50
            else:
                unified_score = int(weighted_score / total_weight)
            
            return {
                'score': unified_score,
                'risk': RiskScoringEngine.categorize_risk(unified_score),
                'color': RiskScoringEngine.get_color(RiskScoringEngine.categorize_risk(unified_score))
            }
        
        except Exception as e:
            logger.error(f"Risk scoring error: {e}")
            return {
                'score': 50,
                'risk': 'Unknown',
                'color': '#6B7280'
            }
    
    @staticmethod
    def generate_alert(unified_score):
        """Generate alert if risk is high"""
        risk_level = RiskScoringEngine.categorize_risk(unified_score)
        
        if risk_level == 'Critical':
            return {
                'alert': True,
                'severity': 'CRITICAL',
                'message': '⚠️ CRITICAL RISK DETECTED - Immediate action required',
                'actions': ['Review all results', 'Change passwords', 'Monitor account']
            }
        elif risk_level == 'High':
            return {
                'alert': True,
                'severity': 'HIGH',
                'message': '⚠️ HIGH RISK - Please review findings carefully',
                'actions': ['Address vulnerabilities', 'Update security measures']
            }
        elif risk_level == 'Medium':
            return {
                'alert': False,
                'severity': 'MEDIUM',
                'message': '⚠️ MEDIUM RISK - Consider improvements',
                'actions': ['Review findings', 'Implement suggestions']
            }
        else:
            return {
                'alert': False,
                'severity': 'LOW',
                'message': '✓ LOW RISK - Good security posture',
                'actions': []
            }
    
    @staticmethod
    def get_recommendations(scan_results):
        """Generate recommendations based on scan results"""
        recommendations = []
        
        # Password recommendations
        if 'password' in scan_results and scan_results['password']:
            password_suggestions = scan_results['password'].get('suggestions', [])
            if password_suggestions:
                recommendations.extend(password_suggestions)
        
        # Website recommendations
        if 'website' in scan_results and scan_results['website']:
            website_result = scan_results['website']
            if website_result.get('overall_risk') == 'High':
                recommendations.append('Website has security issues - Exercise caution')
            if website_result.get('https', {}).get('is_https') is False:
                recommendations.append('Use HTTPS version of the website')
        
        # Breach recommendations
        if 'breach' in scan_results and scan_results['breach']:
            if scan_results['breach'].get('breached'):
                recommendations.append('Email has been in a data breach - Consider password change')
        
        # Domain recommendations
        if 'domain' in scan_results and scan_results['domain']:
            if scan_results['domain'].get('suspicious', {}).get('is_suspicious'):
                recommendations.append('Domain appears suspicious - Be careful clicking links')
        
        return recommendations
