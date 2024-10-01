from flask import Blueprint, request, jsonify
from models import db, User
from werkzeug.security import generate_password_hash, check_password_hash  # For password hashing and validation

# Blueprint for user-related routes
user_bp = Blueprint('user', __name__)

# Route to handle local user registration
@user_bp.route('/api/register', methods=['POST'])
def register_user():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    # Check if the user already exists in the database
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists"}), 400

    # Create a new user and directly store the password (should be hashed for security)
    new_user = User(name=name, email=email, password=password, provider='local')
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully!",
        "user_id": new_user.id  # Return the newly created user ID
    }), 201

# Route to handle local user login
@user_bp.route('/api/login', methods=['POST'])
def login_user():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    # Fetch the user by email
    user = User.query.filter_by(email=email).first()
    
    # Check if user exists and if the password matches
    if not user or user.password != password:
        return jsonify({"message": "Invalid email or password"}), 401

    # Successful login, return user_id
    return jsonify({
        "message": "Login successful",
        "user_id": user.id  # Return the user ID on successful login
    }), 200

# Route to handle OAuth (Google or GitHub) registration/login
@user_bp.route('/api/oauth-register', methods=['POST'])
def oauth_register_user():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    provider = data.get('provider')  # Either 'google' or 'github'

    # Check if the user already exists
    user = User.query.filter_by(email=email).first()

    if user:
        # If the user exists, return their information
        return jsonify({
            "user_id": user.id,  # Return existing user ID
            "name": user.name,
            "email": user.email,
            "provider": user.provider
        }), 200

    # If the user doesn't exist, create a new one with OAuth (no password needed)
    new_user = User(name=name, email=email, password=None, provider=provider)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "user_id": new_user.id,  # Return new user ID
        "name": new_user.name,
        "email": new_user.email,
        "provider": new_user.provider
    }), 201
