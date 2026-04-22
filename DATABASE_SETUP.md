# CyberShield AI - Database Setup Guide

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Initialize the database:
```bash
python init_db.py
```

This will create a `cybershield.db` file with the following tables:
- **User**: Store user accounts
- **Scan**: Store scan/check history
- **CheckResult**: Store detailed results from each scan

## Usage

### Create a new user:
```python
from app import app, db, User

with app.app_context():
    user = User(username='john', email='john@example.com')
    db.session.add(user)
    db.session.commit()
```

### Log a scan:
```python
from app import app, db, Scan

with app.app_context():
    scan = Scan(user_id=1, scan_type='password', target='password123', status='completed')
    db.session.add(scan)
    db.session.commit()
```

### Query data:
```python
from app import app, User

with app.app_context():
    users = User.query.all()
    user = User.query.filter_by(username='john').first()
```

## Database Schema

### User Table
- `id` (Integer, Primary Key)
- `username` (String, Unique)
- `email` (String, Unique)
- `created_at` (DateTime)

### Scan Table
- `id` (Integer, Primary Key)
- `user_id` (Foreign Key → User)
- `scan_type` (String) - password, website, phishing, domain, breach, risk
- `target` (String) - the item being scanned
- `result` (Text) - scan result data
- `status` (String) - pending, completed, failed
- `created_at` (DateTime)

### CheckResult Table
- `id` (Integer, Primary Key)
- `scan_id` (Foreign Key → Scan)
- `result_data` (JSON) - detailed result in JSON format
- `created_at` (DateTime)
