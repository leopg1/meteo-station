from flask import Flask, request, jsonify, send_from_directory
import json
import os
import requests
import logging
from datetime import datetime, timedelta
import random
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_login import LoginManager
from database import db_session, init_db, shutdown_session
from auth import auth_bp
from models.user import User

# Configurare logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configurare Flask pentru a servi API-ul și aplicația React
app = Flask(__name__, 
            static_folder='client/dist',
            static_url_path='')

# Configurare CORS pentru a permite cereri cross-origin
CORS(app)

# Configurare JWT pentru autentificare
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'secret-key-de-test-trebuie-schimbata-in-productie')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)  # Token-ul de acces expiră după 1 oră
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)  # Token-ul de refresh expiră după 30 zile
jwt = JWTManager(app)

# Configurare Flask-Login
login_manager = LoginManager(app)
login_manager.login_view = 'auth.login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Înregistrare blueprint pentru autentificare
app.register_blueprint(auth_bp, url_prefix='/api/auth')

# Inchidere sesiune DB la finalul cererii
@app.teardown_appcontext
def shutdown_db_session(exception=None):
    shutdown_session()

# Stocarea datelor în memorie (în loc de bază de date)
# Pentru simplicitate, vom folosi o listă pentru a stoca datele
weather_data = []

# Cale pentru fișierul de date (pentru persistență între reporniri)
DATA_FILE = os.path.join(os.path.dirname(__file__), 'weather_data.json')

# Încărcăm datele din fișier dacă există
def load_data():
    global weather_data
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as f:
                weather_data = json.load(f)
            print(f"Încărcate {len(weather_data)} înregistrări din fișier.")
        except Exception as e:
            print(f"Eroare la încărcarea datelor: {str(e)}")
            weather_data = []
    else:
        print("Fișierul de date nu există. Se începe cu o listă goală.")
        weather_data = []

# Salvăm datele în fișier
def save_data():
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(weather_data, f, indent=2)
        print(f"Salvate {len(weather_data)} înregistrări în fișier.")
    except Exception as e:
        print(f"Eroare la salvarea datelor: {str(e)}")

# Generăm date de test dacă nu există înregistrări
def generate_test_data(count=24):
    global weather_data
    if not weather_data:
        print(f"Generăm {count} înregistrări de test...")
        for i in range(count):
            # Simulăm date la intervale de o oră, pornind de la acum și mergând înapoi
            hours_ago = count - i - 1
            timestamp = datetime.now().replace(microsecond=0, second=0, minute=0) 
            timestamp = timestamp.replace(hour=timestamp.hour - hours_ago)
            
            record = {
                "id": i + 1,
                "timestamp": timestamp.isoformat(),
                "temperature": round(random.uniform(15.0, 30.0), 1),
                "humidity": round(random.uniform(30.0, 80.0), 1),
                "pressure": round(random.uniform(995.0, 1025.0), 1),
                "light": round(random.uniform(100.0, 1000.0), 1),
                "radiation": round(random.uniform(0.01, 0.5), 2),
                "wind_speed": round(random.uniform(0.0, 15.0), 1),
                "wind_direction": round(random.uniform(0.0, 359.9), 1)
            }
            weather_data.append(record)
        save_data()

# Rute pentru pagini
# Rute pentru servirea aplicației React
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# API pentru datele meteo
@app.route('/api/data', methods=['POST'])
def receive_data():
    """Endpoint pentru primirea datelor de la Raspberry Pi 4"""
    try:
        data = request.json
        
        # Validare date primite
        required_fields = ['temperature', 'humidity', 'pressure', 'light', 'radiation', 'wind_speed', 'wind_direction']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Câmpul {field} lipsește'}), 400
        
        # Creăm un nou record
        new_id = 1
        if weather_data:
            new_id = max(item["id"] for item in weather_data) + 1
            
        new_record = {
            "id": new_id,
            "timestamp": datetime.now().isoformat(),
            "temperature": data['temperature'],
            "humidity": data['humidity'],
            "pressure": data['pressure'],
            "light": data['light'],
            "radiation": data['radiation'],
            "wind_speed": data['wind_speed'],
            "wind_direction": data['wind_direction']
        }
        
        # Adăugăm recordul în lista noastră
        weather_data.append(new_record)
        
        # Salvăm datele în fișier pentru persistență
        save_data()
        
        return jsonify({'success': True, 'id': new_record["id"]}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/data/history', methods=['GET'])
def get_data():
    """Endpoint pentru obținerea datelor istorice cu filtre opționale"""
    try:
        # Parametri pentru filtrare
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        limit = request.args.get('limit', default=100, type=int)
        
        # Filtrăm datele conform parametrilor
        filtered_data = weather_data.copy()
        
        if start_date:
            filtered_data = [item for item in filtered_data 
                           if item["timestamp"] >= start_date]
            
        if end_date:
            filtered_data = [item for item in filtered_data 
                           if item["timestamp"] <= end_date]
        
        # Sortăm datele după timestamp (descrescător)
        filtered_data.sort(key=lambda x: x["timestamp"], reverse=True)
        
        # Aplicăm limita
        result = filtered_data[:limit]
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/data/current', methods=['GET'])
def get_current_data():
    """Endpoint pentru obținerea celor mai recente date meteo"""
    try:
        if not weather_data:
            return jsonify({'error': 'Nu există date disponibile'}), 404
        
        # Obținem cea mai recentă înregistrare
        latest_record = max(weather_data, key=lambda x: x["timestamp"])
        
        return jsonify(latest_record), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/data/statistics', methods=['GET'])
def get_stats():
    """Endpoint pentru obținerea statisticilor"""
    try:
        if not weather_data:
            return jsonify({'error': 'Nu există date disponibile pentru statistici'}), 404
            
        # Parametri pentru filtrare
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Filtrăm datele conform parametrilor
        filtered_data = weather_data.copy()
        
        if start_date:
            filtered_data = [item for item in filtered_data 
                           if item["timestamp"] >= start_date]
            
        if end_date:
            filtered_data = [item for item in filtered_data 
                           if item["timestamp"] <= end_date]
        
        # Calculăm statisticile
        stats = {}
        for field in ['temperature', 'humidity', 'pressure', 'light', 'radiation', 'wind_speed']:
            values = [item[field] for item in filtered_data]
            if values:
                stats[field] = {
                    'min': min(values),
                    'max': max(values),
                    'avg': sum(values) / len(values)
                }
            else:
                stats[field] = {
                    'min': 0,
                    'max': 0,
                    'avg': 0
                }
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/test-data', methods=['POST'])
def add_test_data():
    """Endpoint pentru generarea datelor de test"""
    count = request.args.get('count', default=1, type=int)
    
    for i in range(count):
        new_id = 1
        if weather_data:
            new_id = max(item["id"] for item in weather_data) + 1
            
        new_record = {
            "id": new_id,
            "timestamp": datetime.now().isoformat(),
            "temperature": round(random.uniform(15.0, 30.0), 1),
            "humidity": round(random.uniform(30.0, 80.0), 1),
            "pressure": round(random.uniform(995.0, 1025.0), 1),
            "light": round(random.uniform(100.0, 1000.0), 1),
            "radiation": round(random.uniform(0.01, 0.5), 2),
            "wind_speed": round(random.uniform(0.0, 15.0), 1),
            "wind_direction": round(random.uniform(0.0, 359.9), 1)
        }
        
        weather_data.append(new_record)
    
    save_data()
    return jsonify({"success": True, "message": f"S-au adăugat {count} înregistrări de test"}), 200

@app.route('/api/assistant', methods=['POST'])
def assistant_proxy():
    """Proxy pentru API-ul asistentului meteorologic"""
    try:
        # Preluăm datele din cerere
        data = request.json
        
        # Facem cererea către serviciul dedicat pentru asistent
        response = requests.post(
            "http://localhost:5001/api/assistant",
            json=data,
            headers={"Content-Type": "application/json"}
        )
        
        # Returnăm răspunsul de la serviciul asistentului
        return response.json(), response.status_code
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Rută pentru panoul de administrare - protejată JWT
@app.route('/api/admin/system-info', methods=['GET'])
def system_info():
    # Verificare autentificare și rol de admin se face în frontend
    import psutil
    import platform
    
    system_data = {
        'cpu_percent': psutil.cpu_percent(),
        'memory_percent': psutil.virtual_memory().percent,
        'disk_usage': psutil.disk_usage('/').percent,
        'system': platform.system(),
        'release': platform.release(),
        'python_version': platform.python_version(),
        'weather_records': len(weather_data),
        'db_size': os.path.getsize('weather_station.db') if os.path.exists('weather_station.db') else 0
    }
    
    return jsonify(system_data)

if __name__ == '__main__':
    # Inițializăm baza de date
    init_db()
    
    # Încărcăm datele existente
    load_data()
    
    # Creăm date de test dacă nu există suficiente (minim 24 de înregistrări)
    if len(weather_data) < 24:
        generate_test_data()
    
    # Verificăm dacă există build-ul React
    if not os.path.exists(app.static_folder):
        print("AVERTISMENT: Directorul build pentru aplicația React nu există!")
        print("Trebuie să construiești aplicația React înainte de a porni serverul:")
        print("  1. cd client")
        print("  2. npm run build")
    
    print("Server pornit la adresa http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
