"""
CyberShield AI - Database Connection & Models
SQLite Integration
"""
import sqlite3
import json
from datetime import datetime
from config import get_config
import logging
import os
import uuid

logger = logging.getLogger(__name__)

class Database:
    """SQLite Database Handler"""
    
    def __init__(self, db_path='cybershield.db'):
        """Initialize SQLite connection"""
        self.db_path = db_path
        self._connect()
        
    def _connect(self):
        """Establish connection and create tables if not exist"""
        try:
            self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
            self.conn.row_factory = sqlite3.Row
            logger.info("✓ Connected to SQLite successfully")
            self._create_tables()
        except Exception as e:
            logger.error(f"✗ SQLite Connection Failed: {e}")
            raise

    def _create_tables(self):
        cursor = self.conn.cursor()
        
        # Users Table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            _id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            created_at TEXT,
            updated_at TEXT
        )
        ''')
        
        # Scans Table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS scans (
            _id TEXT PRIMARY KEY,
            user_id TEXT,
            scan_type TEXT,
            target TEXT,
            result TEXT,
            created_at TEXT,
            updated_at TEXT
        )
        ''')
        
        # Alerts Table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS alerts (
            _id TEXT PRIMARY KEY,
            user_id TEXT,
            type TEXT,
            message TEXT,
            read INTEGER,
            timestamp TEXT
        )
        ''')
        
        self.conn.commit()
        logger.info("✓ Database tables created")
        
    def get_db(self):
        return self.conn
        
    def close(self):
        if self.conn:
            self.conn.close()

# Initialize database
config = get_config()
db = Database('cybershield.db')
conn = db.get_db()

class Collections:
    USERS = 'users'
    SCANS = 'scans'
    ALERTS = 'alerts'

def dict_from_row(row):
    if row is None:
        return None
    d = dict(row)
    if 'result' in d and d['result']:
        try:
            d['result'] = json.loads(d['result'])
        except:
            pass
    if 'read' in d:
        d['read'] = bool(d['read'])
    return d

def insert_user(user_data):
    cursor = conn.cursor()
    user_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    
    cursor.execute('''
        INSERT INTO users (_id, name, email, password, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (user_id, user_data.get('name'), user_data.get('email'), user_data.get('password'), now, now))
    conn.commit()
    return user_id

def insert_scan(scan_data):
    cursor = conn.cursor()
    scan_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    
    result_str = json.dumps(scan_data.get('result', {}))
    
    cursor.execute('''
        INSERT INTO scans (_id, user_id, scan_type, target, result, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (scan_id, str(scan_data.get('user_id')), scan_data.get('scan_type'), scan_data.get('target'), result_str, now, now))
    conn.commit()
    return scan_id

def insert_alert(alert_data):
    cursor = conn.cursor()
    alert_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    
    cursor.execute('''
        INSERT INTO alerts (_id, user_id, type, message, read, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (alert_id, str(alert_data.get('user_id')), alert_data.get('type'), alert_data.get('message'), 0, now))
    conn.commit()
    return alert_id

def get_user_by_email(email):
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
    return dict_from_row(cursor.fetchone())

def get_user_by_id(user_id):
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE _id = ?', (str(user_id),))
    return dict_from_row(cursor.fetchone())

def get_user_scans(user_id, limit=50, skip=0):
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM scans WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?', 
                  (str(user_id), limit, skip))
    return [dict_from_row(row) for row in cursor.fetchall()]

def get_user_alerts(user_id, limit=20):
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM alerts WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?', 
                  (str(user_id), limit))
    return [dict_from_row(row) for row in cursor.fetchall()]

def get_scans_by_type(user_id, scan_type, limit=20):
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM scans WHERE user_id = ? AND scan_type = ? ORDER BY created_at DESC LIMIT ?', 
                  (str(user_id), scan_type, limit))
    return [dict_from_row(row) for row in cursor.fetchall()]

def delete_scan(scan_id, user_id):
    cursor = conn.cursor()
    cursor.execute('DELETE FROM scans WHERE _id = ? AND user_id = ?', (str(scan_id), str(user_id)))
    conn.commit()
    return cursor.rowcount

def get_statistics(user_id):
    cursor = conn.cursor()
    # Count by type
    cursor.execute('SELECT scan_type, COUNT(*) as count FROM scans WHERE user_id = ? GROUP BY scan_type ORDER BY count DESC', (str(user_id),))
    stats_by_type = [{'_id': row['scan_type'], 'count': row['count']} for row in cursor.fetchall()]
    
    # Total scans
    cursor.execute('SELECT COUNT(*) as count FROM scans WHERE user_id = ?', (str(user_id),))
    total_scans = cursor.fetchone()['count']
    
    # All scans for risk
    cursor.execute('SELECT result FROM scans WHERE user_id = ?', (str(user_id),))
    all_scans = cursor.fetchall()
    
    risk_levels = {'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0}
    for scan in all_scans:
        result_str = scan['result']
        if result_str:
            try:
                res = json.loads(result_str)
                risk = res.get('overall_risk') or res.get('risk') or 'Unknown'
                if risk in risk_levels:
                    risk_levels[risk] += 1
            except:
                pass
                
    return total_scans, stats_by_type, risk_levels
