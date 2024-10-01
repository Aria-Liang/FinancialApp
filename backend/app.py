from flask_cors import CORS
from flask import Flask
from models import db
from routes.user_routes import user_bp
from routes.stock_routes import stock_bp
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Enable Cross-Origin Resource Sharing (CORS) to allow requests from different domains
CORS(app)

# Configure the PostgreSQL database connection using environment variables
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = os.getenv('SQLALCHEMY_TRACK_MODIFICATIONS', 'False') == 'True'

# Initialize the SQLAlchemy database with the app
db.init_app(app)

# Register route blueprints (user and stock routes)
app.register_blueprint(user_bp)
app.register_blueprint(stock_bp)

# Default route to verify that the Flask app is running
@app.route('/', methods=['GET'])
def home():
    return "Hello, Flask is running!", 200

# Entry point to run the Flask application
if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Create all database tables if they don't already exist
    app.run(debug=True, host='0.0.0.0', port=5000)  # Run the app in debug mode and make it accessible on the local network
