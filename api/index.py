import json
import sqlite3
import os
import shutil
import hmac
import hashlib
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse

ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
SECRET_KEY = os.environ.get('SECRET_KEY', 'namma-fix-secret-salt-key')
VALID_TOKENS = set()

def get_db_path():
    if os.environ.get('VERCEL') or os.path.exists('/tmp'):
        tmp_db = '/tmp/database.db'
        if not os.path.exists(tmp_db):
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            seed_db = os.path.join(base_dir, 'database.db')
            if os.path.exists(seed_db):
                try:
                    shutil.copyfile(seed_db, tmp_db)
                except Exception:
                    pass
        init_db(tmp_db)
        return tmp_db
    else:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        db_path = os.path.join(base_dir, 'database.db')
        init_db(db_path)
        return db_path

def init_db(db_file):
    try:
        conn = sqlite3.connect(db_file)
        c = conn.cursor()
        c.execute('''
            CREATE TABLE IF NOT EXISTS requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT,
                customer_name TEXT,
                phone TEXT,
                details TEXT,
                status TEXT DEFAULT 'Pending',
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"DB Init Error: {e}")

def get_admin_token():
    return hmac.new(SECRET_KEY.encode('utf-8'), ADMIN_PASSWORD.encode('utf-8'), hashlib.sha256).hexdigest()

def verify_token(token):
    if not token:
        return False
    if token in VALID_TOKENS:
        return True
    expected = get_admin_token()
    return hmac.compare_digest(token, expected)

class handler(BaseHTTPRequestHandler):
    
    def send_json_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def is_authorized(self):
        auth_header = self.headers.get('Authorization')
        if not auth_header:
            return False
        token = auth_header.replace('Bearer ', '').strip()
        return verify_token(token)

    def do_GET(self):
        parsed_path = urlparse(self.path)
        clean_path = parsed_path.path.rstrip('/')
        
        if clean_path.endswith('/requests') or clean_path == '/api/requests':
            if not self.is_authorized():
                self.send_json_response(401, {"error": "Unauthorized"})
                return

            try:
                db_path = get_db_path()
                conn = sqlite3.connect(db_path)
                c = conn.cursor()
                c.execute("SELECT * FROM requests ORDER BY timestamp DESC")
                rows = c.fetchall()
                conn.close()
                
                requests_list = []
                for row in rows:
                    requests_list.append({
                        "id": row[0],
                        "type": row[1],
                        "customer_name": row[2],
                        "phone": row[3],
                        "details": row[4],
                        "status": row[5],
                        "timestamp": row[6]
                    })
                
                self.send_json_response(200, requests_list)
            except Exception as e:
                self.send_json_response(500, {"error": str(e)})
        else:
            self.send_json_response(404, {"error": "Endpoint not found"})

    def do_POST(self):
        parsed_path = urlparse(self.path)
        clean_path = parsed_path.path.rstrip('/')
        
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'
        
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self.send_json_response(400, {"error": "Invalid JSON"})
            return

        if clean_path.endswith('/login') or clean_path == '/api/login':
            password = data.get('password')
            if password == ADMIN_PASSWORD:
                token = get_admin_token()
                VALID_TOKENS.add(token)
                self.send_json_response(200, {"token": token})
            else:
                self.send_json_response(401, {"error": "Invalid password"})

        elif clean_path.endswith('/requests') or clean_path == '/api/requests':
            req_type = data.get('type', 'Unknown')
            name = data.get('customer_name', 'Unknown')
            phone = data.get('phone', 'Unknown')
            details = data.get('details', '')
            
            try:
                db_path = get_db_path()
                conn = sqlite3.connect(db_path)
                c = conn.cursor()
                c.execute("INSERT INTO requests (type, customer_name, phone, details) VALUES (?, ?, ?, ?)",
                          (req_type, name, phone, details))
                conn.commit()
                new_id = c.lastrowid
                conn.close()
                self.send_json_response(201, {"message": "Request saved successfully", "id": new_id})
            except Exception as e:
                self.send_json_response(500, {"error": str(e)})

        elif clean_path.endswith('/complete') or clean_path == '/api/complete':
            if not self.is_authorized():
                self.send_json_response(401, {"error": "Unauthorized"})
                return

            req_id = data.get('id')
            if not req_id:
                self.send_json_response(400, {"error": "Missing request ID"})
                return
                
            try:
                db_path = get_db_path()
                conn = sqlite3.connect(db_path)
                c = conn.cursor()
                c.execute("UPDATE requests SET status = 'Completed' WHERE id = ?", (req_id,))
                conn.commit()
                conn.close()
                self.send_json_response(200, {"message": "Request marked as completed"})
            except Exception as e:
                self.send_json_response(500, {"error": str(e)})
        else:
            self.send_json_response(404, {"error": "Endpoint not found"})
