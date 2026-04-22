# CyberShield AI - API Documentation

## Overview

Complete REST API for the CyberShield AI cybersecurity platform.

Base URL: `http://localhost:5000/api`

---

## Authentication

All protected endpoints require JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Auth Endpoints

### POST /auth/signup
Create a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Response (201):**
```json
{
  "message": "Signup successful",
  "user_id": "507f1f77bcf86cd799439011",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST /auth/login
Login to user account.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user_id": "507f1f77bcf86cd799439011",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### POST /auth/verify-token
Verify JWT token validity.

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "valid": true,
  "user_id": "507f1f77bcf86cd799439011"
}
```

---

## Scanner Endpoints

### POST /scan/password
Analyze password strength.

**Protected**: Yes

**Request:**
```json
{
  "password": "MySecurePassword123!"
}
```

**Response (200):**
```json
{
  "scan_id": "507f1f77bcf86cd799439011",
  "result": {
    "score": 85,
    "strength": "Very Strong",
    "entropy": 52.34,
    "time_to_crack": "Years",
    "length": 18,
    "vulnerable": false,
    "vulnerabilities": [],
    "suggestions": []
  }
}
```

### POST /scan/website
Scan website security.

**Protected**: Yes

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response (200):**
```json
{
  "scan_id": "507f1f77bcf86cd799439011",
  "result": {
    "url": "https://example.com",
    "overall_risk": "Low",
    "https": {
      "is_https": true,
      "supports_https": true,
      "risk": "Low"
    },
    "ssl_certificate": {...},
    "security_headers": {...},
    "xss_detection": {...},
    "sql_injection": {...}
  }
}
```

### POST /scan/phishing
Detect phishing URLs.

**Protected**: Yes

**Request:**
```json
{
  "url": "http://g00gle-verify.xyz"
}
```

**Response (200):**
```json
{
  "scan_id": "507f1f77bcf86cd799439011",
  "result": {
    "url": "http://g00gle-verify.xyz",
    "is_phishing": true,
    "confidence": 85.5,
    "risk": "High"
  }
}
```

### POST /scan/domain
Analyze domain intelligence.

**Protected**: Yes

**Request:**
```json
{
  "domain": "example.com"
}
```

**Response (200):**
```json
{
  "scan_id": "507f1f77bcf86cd799439011",
  "result": {
    "domain": "example.com",
    "overall_risk": "Low",
    "suspicious": {...},
    "age": {...},
    "blacklist": {...}
  }
}
```

### POST /scan/breach
Check for data breaches.

**Protected**: Yes

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "scan_id": "507f1f77bcf86cd799439011",
  "result": {
    "breached": false,
    "breaches": [],
    "count": 0,
    "risk": "Low"
  }
}
```

### POST /scan/ip
Analyze IP address.

**Protected**: Yes

**Request:**
```json
{
  "ip": "8.8.8.8"
}
```

**Response (200):**
```json
{
  "scan_id": "507f1f77bcf86cd799439011",
  "result": {
    "ip": "8.8.8.8",
    "overall_risk": "Low",
    "info": {...},
    "reputation": {...}
  }
}
```

### POST /scan/email
Analyze email security.

**Protected**: Yes

**Request:**
```json
{
  "email": "sender@example.com",
  "domain": "example.com",
  "content": "Email content here..."
}
```

**Response (200):**
```json
{
  "scan_id": "507f1f77bcf86cd799439011",
  "result": {
    "sender_email": "sender@example.com",
    "overall_risk": "Low",
    "spoofing": {...},
    "content": {...},
    "authentication": {...}
  }
}
```

### POST /scan/risk-analysis
Calculate unified risk score.

**Protected**: Yes

**Request:**
```json
{
  "results": {
    "password": {...},
    "website": {...},
    "phishing": {...}
  }
}
```

**Response (200):**
```json
{
  "unified_score": {
    "score": 65,
    "risk": "High",
    "color": "#ef4444"
  },
  "alert": {
    "alert": true,
    "severity": "HIGH",
    "message": "⚠️ HIGH RISK - Please review findings carefully",
    "actions": [...]
  },
  "recommendations": [...]
}
```

---

## History Endpoints

### GET /history/scans
Get user's scan history.

**Protected**: Yes

**Query Parameters:**
- `limit` (int, default: 50) - Number of results
- `skip` (int, default: 0) - Number to skip

**Response (200):**
```json
{
  "scans": [...],
  "total": 42
}
```

### GET /history/scans/:type
Get scans by type.

**Protected**: Yes

**Response (200):**
```json
{
  "scans": [...]
}
```

### GET /history/alerts
Get user's alerts.

**Protected**: Yes

**Response (200):**
```json
{
  "alerts": [...]
}
```

### GET /history/statistics
Get scan statistics.

**Protected**: Yes

**Response (200):**
```json
{
  "total_scans": 42,
  "scans_by_type": [...],
  "risk_distribution": {
    "Low": 15,
    "Medium": 20,
    "High": 5,
    "Critical": 2
  }
}
```

### DELETE /history/delete/:scan_id
Delete a scan.

**Protected**: Yes

**Response (200):**
```json
{
  "message": "Scan deleted"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 409 Conflict
```json
{
  "error": "Email already registered"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Rate Limiting (Recommended)

Implement rate limiting:
- 100 requests per minute per IP
- 1000 requests per hour per user
