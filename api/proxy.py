from http.server import BaseHTTPRequestHandler
import urllib.request
from urllib.error import HTTPError
import json, os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        target_base = os.environ["APIbase"]
        path = self.path
        if path.startswith('/api'):
            path = path[4:]
            
        target_url = target_base + path
        
        try:
            req = urllib.request.Request(target_url, headers={'Accept': 'application/json'})
            with urllib.request.urlopen(req) as response:
                body = response.read()
                status = response.getcode()
                content_type = response.headers.get('Content-Type', 'application/json')
                
            self.send_response(status)
            self.send_header('Content-Type', content_type)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(body)
            
        except HTTPError as e:
            self.send_response(e.code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            try:
                error_body = e.read()
            except:
                error_body = json.dumps({'error': str(e)}).encode('utf-8')
            self.wfile.write(error_body)
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Proxy failed', 'details': str(e)}).encode('utf-8'))
            
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
