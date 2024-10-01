from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash

# Initialize SQLAlchemy for database operations
db = SQLAlchemy()

# Define the User model
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)  # Primary key for the User table
    name = db.Column(db.String(50), nullable=False)  # User's name, cannot be null
    email = db.Column(db.String(100), unique=True, nullable=False)  # Email, must be unique and not null
    password = db.Column(db.String(255), nullable=True)  # Hashed password, nullable (for social login)
    provider = db.Column(db.String(50), nullable=False, default='local')  # Auth provider, defaults to 'local'

# Define the Portfolio model
class Portfolio(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Primary key for the Portfolio table
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Foreign key linking to User table
    ticker = db.Column(db.String(10), nullable=False)  # Stock ticker symbol, cannot be null
    quantity = db.Column(db.Integer, nullable=False)  # Quantity of stock owned, cannot be null
    avg_price = db.Column(db.Float, nullable=False)  # Average purchase price, cannot be null

# Define the Transaction model
class Transaction(db.Model):
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)  # Primary key for the Transaction table
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Foreign key linking to User table
    ticker = db.Column(db.String(10), nullable=False)  # Stock ticker symbol, cannot be null
    quantity = db.Column(db.Integer, nullable=False)  # Number of shares involved in the transaction
    price = db.Column(db.Float, nullable=False)  # Price at which the transaction took place
    transaction_type = db.Column(db.String(10), nullable=False)  # Type of transaction: 'buy' or 'sell'
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())  # Timestamp of the transaction
