from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token, 
    get_jwt_identity, jwt_required
)
from datetime import datetime, timedelta
from models.user import User
from database import db_session
import logging

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validare date
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Date incomplete'}), 400
    
    # Verificare dacă username-ul sau email-ul există deja
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Numele de utilizator există deja'}), 409
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Adresa de email există deja'}), 409
    
    # Creare utilizator nou
    user = User(
        username=data['username'],
        email=data['email'],
        role='user'  # Implicit utilizator normal
    )
    user.set_password(data['password'])
    
    # Primul utilizator din sistem devine automat admin
    if User.query.count() == 0:
        user.role = 'admin'
        logger.info(f"Creat primul utilizator admin: {user.username}")
    
    try:
        db_session.add(user)
        db_session.commit()
        logger.info(f"Utilizator înregistrat: {user.username}")
        
        # Creare token-uri pentru autentificare
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
    except Exception as e:
        db_session.rollback()
        logger.error(f"Eroare la înregistrare: {str(e)}")
        return jsonify({'error': 'Eroare la înregistrare'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Date incomplete'}), 400
    
    # Căutare utilizator după username
    user = User.query.filter_by(username=data['username']).first()
    
    # Verificare parolă
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Credențiale invalide'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'Cont dezactivat'}), 403
    
    # Actualizare last_login
    user.last_login = datetime.utcnow()
    db_session.commit()
    
    # Creare token-uri
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    logger.info(f"Utilizator autentificat: {user.username}")
    
    return jsonify({
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.is_active:
        return jsonify({'error': 'Cont invalid sau dezactivat'}), 401
    
    # Creare nou token de acces
    access_token = create_access_token(identity=current_user_id)
    
    return jsonify({
        'access_token': access_token
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'Utilizator negăsit'}), 404
    
    return jsonify(user.to_dict()), 200

# Rută protejată pentru administratori
@auth_bp.route('/admin/users', methods=['GET'])
@jwt_required()
def get_all_users():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user or not current_user.is_admin():
        return jsonify({'error': 'Acces interzis'}), 403
    
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

# Funcție pentru gestionarea utilizatorilor (doar admin)
@auth_bp.route('/admin/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user or not current_user.is_admin():
        return jsonify({'error': 'Acces interzis'}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Utilizator negăsit'}), 404
    
    data = request.get_json()
    
    # Actualizare câmpuri
    if 'role' in data:
        user.role = data['role']
    
    if 'is_active' in data:
        user.is_active = data['is_active']
        
    if 'email' in data:
        user.email = data['email']
    
    if 'password' in data:
        user.set_password(data['password'])
    
    try:
        db_session.commit()
        logger.info(f"Utilizator actualizat: {user.username}")
        return jsonify(user.to_dict()), 200
    except Exception as e:
        db_session.rollback()
        logger.error(f"Eroare la actualizare utilizator: {str(e)}")
        return jsonify({'error': 'Eroare la actualizare utilizator'}), 500
