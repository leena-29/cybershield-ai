"""
CyberShield AI - Password Security Analyzer
Entropy, strength, suggestions, etc.
"""
import math
import re
import logging

logger = logging.getLogger(__name__)

class PasswordAnalyzer:
    """Advanced password security analysis"""
    
    # Common dictionary words
    COMMON_WORDS = {
        'password', 'admin', 'user', 'login', 'test', 'demo', 'root',
        'letmein', 'qwerty', 'abc123', '123456', 'password123',
        'monkey', 'dragon', 'master', 'baseball', 'iloveyou'
    }
    
    PATTERNS = {
        'sequential': r'abc|bcd|cde|def|012|123|234|345|456|567|678|789',
        'repeated': r'(.)\1{2,}',
        'keyboard': r'qwerty|asdfgh|zxcvbn|qazwsx'
    }
    
    @staticmethod
    def calculate_entropy(password):
        """Calculate Shannon entropy of password"""
        if not password:
            return 0
        
        char_set_size = 0
        if any(c.islower() for c in password):
            char_set_size += 26
        if any(c.isupper() for c in password):
            char_set_size += 26
        if any(c.isdigit() for c in password):
            char_set_size += 10
        if any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password):
            char_set_size += 32
        
        if char_set_size == 0:
            return 0
        
        entropy = len(password) * math.log2(char_set_size)
        return round(entropy, 2)
    
    @staticmethod
    def estimate_crack_time(entropy):
        """Estimate time to crack password in seconds"""
        # Assuming 1 billion guesses per second
        guesses_per_second = 1e9
        
        # Number of possible combinations
        possible_combinations = 2 ** entropy
        
        # Average time (half of total combinations)
        seconds = (possible_combinations / 2) / guesses_per_second
        
        return PasswordAnalyzer._format_time(seconds)
    
    @staticmethod
    def _format_time(seconds):
        """Format seconds into human-readable time"""
        if seconds < 1:
            return "< 1 second"
        elif seconds < 60:
            return f"{int(seconds)} seconds"
        elif seconds < 3600:
            return f"{int(seconds/60)} minutes"
        elif seconds < 86400:
            return f"{int(seconds/3600)} hours"
        elif seconds < 86400*365:
            return f"{int(seconds/86400)} days"
        elif seconds < 86400*365*100:
            return f"{int(seconds/(86400*365))} years"
        else:
            return "Centuries"
    
    @staticmethod
    def check_dictionary_attack(password):
        """Check if password is vulnerable to dictionary attack"""
        lower_password = password.lower()
        
        for word in PasswordAnalyzer.COMMON_WORDS:
            if word in lower_password:
                return True, f"Contains common word: '{word}'"
        
        return False, "No common words detected"
    
    @staticmethod
    def check_patterns(password):
        """Check for common patterns"""
        issues = []
        
        for pattern_name, pattern in PasswordAnalyzer.PATTERNS.items():
            if re.search(pattern, password, re.IGNORECASE):
                issues.append(f"Contains {pattern_name} pattern")
        
        return issues
    
    @staticmethod
    def calculate_strength_score(password):
        """Calculate password strength score (0-100)"""
        score = 0
        
        # Length scoring (max 30)
        length = len(password)
        if length >= 4:
            score += 5
        if length >= 8:
            score += 5
        if length >= 12:
            score += 5
        if length >= 16:
            score += 15
        
        # Character variety (max 30)
        if any(c.islower() for c in password):
            score += 10
        if any(c.isupper() for c in password):
            score += 10
        if any(c.isdigit() for c in password):
            score += 10
        if any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password):
            score += 10
        
        # Entropy-based scoring (max 20)
        entropy = PasswordAnalyzer.calculate_entropy(password)
        entropy_score = min(20, entropy / 5)
        score += entropy_score
        
        # Penalty for patterns
        patterns = PasswordAnalyzer.check_patterns(password)
        score -= len(patterns) * 5
        
        # Penalty for dictionary words
        vulnerable, _ = PasswordAnalyzer.check_dictionary_attack(password)
        if vulnerable:
            score -= 15
        
        return max(0, min(100, int(score)))
    
    @staticmethod
    def get_strength_level(score):
        """Get strength level based on score"""
        if score < 30:
            return "Very Weak"
        elif score < 50:
            return "Weak"
        elif score < 70:
            return "Moderate"
        elif score < 85:
            return "Strong"
        else:
            return "Very Strong"
    
    @staticmethod
    def get_suggestions(password):
        """Get improvement suggestions"""
        suggestions = []
        
        if len(password) < 12:
            suggestions.append("Use at least 12 characters")
        
        if not any(c.isupper() for c in password):
            suggestions.append("Add uppercase letters")
        
        if not any(c.islower() for c in password):
            suggestions.append("Add lowercase letters")
        
        if not any(c.isdigit() for c in password):
            suggestions.append("Add numbers")
        
        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password):
            suggestions.append("Add special characters")
        
        vulnerable, msg = PasswordAnalyzer.check_dictionary_attack(password)
        if vulnerable:
            suggestions.append(msg)
        
        patterns = PasswordAnalyzer.check_patterns(password)
        if patterns:
            suggestions.extend(patterns)
        
        return suggestions
    
    @staticmethod
    def analyze(password):
        """Complete password analysis"""
        if not password:
            return {
                'score': 0,
                'strength': 'None',
                'entropy': 0,
                'time_to_crack': '0 seconds',
                'vulnerable': True,
                'vulnerabilities': ['Empty password'],
                'suggestions': ['Choose a strong password']
            }
        
        entropy = PasswordAnalyzer.calculate_entropy(password)
        strength_score = PasswordAnalyzer.calculate_strength_score(password)
        strength_level = PasswordAnalyzer.get_strength_level(strength_score)
        time_to_crack = PasswordAnalyzer.estimate_crack_time(entropy)
        vulnerable, dict_msg = PasswordAnalyzer.check_dictionary_attack(password)
        patterns = PasswordAnalyzer.check_patterns(password)
        suggestions = PasswordAnalyzer.get_suggestions(password)
        
        vulnerabilities = []
        if vulnerable:
            vulnerabilities.append(dict_msg)
        vulnerabilities.extend(patterns)
        
        return {
            'score': strength_score,
            'strength': strength_level,
            'entropy': entropy,
            'time_to_crack': time_to_crack,
            'length': len(password),
            'vulnerable': len(vulnerabilities) > 0,
            'vulnerabilities': vulnerabilities,
            'suggestions': suggestions
        }
