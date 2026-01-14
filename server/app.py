from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Integer, String, VARCHAR, Float, select
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# CORS configuration for production
CORS(app, 
     origins=["https://crocheted-money.vercel.app", "http://localhost:5173"],
     methods=["GET", "POST", "PATCH", "OPTIONS"],
     allow_headers=["Content-Type"],
     supports_credentials=True)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
db = SQLAlchemy(app)

class quick_add_list(db.Model):
    id = db.Column(Integer, primary_key=True)
    StuffyName = db.Column(VARCHAR(50))
    Price = db.Column(Float)

class target_data(db.Model):
    target_goal = db.Column(Integer, primary_key=True)
    target_progress = db.Column(Float)

def create_db():
    with app.app_context():
        db.create_all()

@app.route('/health', methods=['GET'])
def health_check():
    """Railway uses this to verify the server is running"""
    return jsonify({'status': 'healthy'}), 200

@app.route('/api/fetch_stuffies', methods=['GET'])
def fetch_stuffies():
    # Get stuffies from MySQL db
    with app.app_context():
        stmt = db.select(quick_add_list)
        result = db.session.execute(stmt).scalars().all()
    
    return jsonify([{
        'id': stuffy.id,
        'StuffyName': stuffy.StuffyName,
        'Price': stuffy.Price
    } for stuffy in result])

@app.route('/api/add_new_stuffy', methods=['POST'])
def add_new_stuffy():
    data = request.get_json()
    if not data or 'StuffyName' not in data or 'Price' not in data:
        return jsonify({'error': 'Invalid data'}), 400
    
    new_stuffy = quick_add_list(StuffyName=data['StuffyName'], Price=data['Price'])
    db.session.add(new_stuffy)
    db.session.commit()

    return jsonify({
        'id': new_stuffy.id,
        'StuffyName': new_stuffy.StuffyName,
        'Price': new_stuffy.Price
    }), 201

@app.route('/api/fetch_goal_data', methods=['GET'])
def fetch_goal_data():
    with app.app_context():
        stmt = db.select(target_data)
        result = db.session.execute(stmt).scalars().first()

    if not result:
        return jsonify({'error': 'No goal data found'}), 404

    return jsonify({
        'target_goal': result.target_goal,
        'target_progress': result.target_progress
    }), 200

@app.route('/api/set_target_progress', methods=['PATCH'])
def set_target_progress():
    data = request.get_json()
    if not data or 'target_progress' not in data:
        return jsonify({'error': 'Invalid data'}), 400
    
    # Fetch the existing record
    record = db.session.execute(db.select(target_data)).scalars().first()
    
    if not record:
        return jsonify({'error': 'No goal data found'}), 404
    
    # Update only the target_progress field
    record.target_progress = data['target_progress']
    db.session.commit()

    return jsonify({
        'target_goal': record.target_goal,
        'target_progress': record.target_progress
    }), 200

if __name__ == '__main__':
    create_db()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)