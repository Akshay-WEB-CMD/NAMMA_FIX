import http.server
import socketserver
import json
import sqlite3
import os
import uuid
from urllib.parse import urlparse, parse_qs
from datetime import datetime

PORT = 5001
DB_FILE = 'database.db'
ADMIN_PASSWORD = 'admin123'
VALID_TOKENS = set()

# Initialize database
def init_db():
    conn = sqlite3.connect(DB_FILE)
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

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    
    def send_json_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def is_authorized(self):
        auth_header = self.headers.get('Authorization')
        if not auth_header:
            return False
        
        token = auth_header.replace('Bearer ', '')
        return token in VALID_TOKENS

    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/requests':
            if not self.is_authorized():
                self.send_json_response(401, {"error": "Unauthorized"})
                return

            # Admin fetching all requests
            conn = sqlite3.connect(DB_FILE)
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
        else:
            # Serve normal static files
            super().do_GET()

    def do_POST(self):
        parsed_path = urlparse(self.path)
        
        # Read request body
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self.send_json_response(400, {"error": "Invalid JSON"})
            return

        if parsed_path.path == '/api/login':
            password = data.get('password')
            if password == ADMIN_PASSWORD:
                token = str(uuid.uuid4())
                VALID_TOKENS.add(token)
                self.send_json_response(200, {"token": token})
            else:
                self.send_json_response(401, {"error": "Invalid password"})

        elif parsed_path.path == '/api/requests':
            # Customer submitting a new request (Public endpoint)
            req_type = data.get('type', 'Unknown')
            name = data.get('customer_name', 'Unknown')
            phone = data.get('phone', 'Unknown')
            details = data.get('details', '')
            
            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()
            c.execute("INSERT INTO requests (type, customer_name, phone, details) VALUES (?, ?, ?, ?)",
                      (req_type, name, phone, details))
            conn.commit()
            new_id = c.lastrowid
            conn.close()
            
            self.send_json_response(201, {"message": "Request saved successfully", "id": new_id})

        elif parsed_path.path == '/api/complete':
            if not self.is_authorized():
                self.send_json_response(401, {"error": "Unauthorized"})
                return

            # Admin marking request as complete
            req_id = data.get('id')
            if not req_id:
                self.send_json_response(400, {"error": "Missing request ID"})
                return
                
            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()
            c.execute("UPDATE requests SET status = 'Completed' WHERE id = ?", (req_id,))
            conn.commit()
            conn.close()
            
            self.send_json_response(200, {"message": "Request marked as completed"})
        else:
            self.send_json_response(404, {"error": "Endpoint not found"})

if __name__ == '__main__':
    init_db()
    
    class ThreadingServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
        allow_reuse_address = True
        daemon_threads = True
    
    with ThreadingServer(("0.0.0.0", PORT), CustomHandler) as httpd:
        print(f"Server and Database running on http://127.0.0.1:{PORT}")
        print(f"Admin Portal at http://127.0.0.1:{PORT}/admin.html")
        httpd.serve_forever()
