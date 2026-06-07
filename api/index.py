from flask import Flask, request, Response
import requests

app = Flask(__name__)

TARGET_URL = "http://129.80.180.202:8000"

@app.route('/api/', defaults={'path': ''}, methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def proxy(path):
  try:
    target_url = f"{TARGET_URL}/{path}"

    if request.query_string:
      target_url += f"?{request.query_string.decode()}"

    upstream = requests.request(
      method=request.method,
      url=target_url,
      headers={"Accept": "application/json"}
    )

    return Response(
      upstream.content,
      status=upstream.status_code,
      content_type=upstream.headers.get("Content-Type", "application/json"),
      headers={
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    )

  except Exception as e:
    return {"error": str(e)}, 500