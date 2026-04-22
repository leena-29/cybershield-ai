"""
CyberShield AI - History & Analytics Routes
Scan history, statistics, user data
"""
from flask import Blueprint, request, jsonify
import logging

from database import get_user_scans, get_user_alerts, get_scans_by_type as db_get_scans_by_type, get_statistics as db_get_statistics, delete_scan as db_delete_scan
from utils.auth import token_required

logger = logging.getLogger(__name__)

history_bp = Blueprint('history', __name__, url_prefix='/api/history')

@history_bp.route('/scans', methods=['GET'])
@token_required
def get_scans():
    """Get user's scan history"""
    try:
        limit = request.args.get('limit', 50, type=int)
        skip = request.args.get('skip', 0, type=int)
        
        scans = get_user_scans(request.user_id, limit=limit, skip=skip)
        
        return jsonify({
            'scans': scans,
            'total': len(scans)
        }), 200
    
    except Exception as e:
        logger.error(f"Get scans error: {e}")
        return jsonify({'error': str(e)}), 500

@history_bp.route('/scans/<scan_type>', methods=['GET'])
@token_required
def get_scans_by_type(scan_type):
    """Get scans by type"""
    try:
        limit = request.args.get('limit', 20, type=int)
        scans = db_get_scans_by_type(request.user_id, scan_type, limit=limit)
        return jsonify({'scans': scans}), 200
    
    except Exception as e:
        logger.error(f"Get scans by type error: {e}")
        return jsonify({'error': str(e)}), 500

@history_bp.route('/alerts', methods=['GET'])
@token_required
def get_alerts():
    """Get user's alerts"""
    try:
        limit = request.args.get('limit', 20, type=int)
        alerts = get_user_alerts(request.user_id, limit=limit)
        return jsonify({'alerts': alerts}), 200
    
    except Exception as e:
        logger.error(f"Get alerts error: {e}")
        return jsonify({'error': str(e)}), 500

@history_bp.route('/statistics', methods=['GET'])
@token_required
def get_statistics():
    """Get scan statistics"""
    try:
        total_scans, stats_by_type, risk_levels = db_get_statistics(request.user_id)
        
        return jsonify({
            'total_scans': total_scans,
            'scans_by_type': stats_by_type,
            'risk_distribution': risk_levels
        }), 200
    
    except Exception as e:
        logger.error(f"Get statistics error: {e}")
        return jsonify({'error': str(e)}), 500

@history_bp.route('/delete/<scan_id>', methods=['DELETE'])
@token_required
def delete_scan(scan_id):
    """Delete a scan"""
    try:
        deleted_count = db_delete_scan(scan_id, request.user_id)
        
        if deleted_count == 0:
            return jsonify({'error': 'Scan not found'}), 404
        
        return jsonify({'message': 'Scan deleted'}), 200
    
    except Exception as e:
        logger.error(f"Delete scan error: {e}")
        return jsonify({'error': str(e)}), 500
