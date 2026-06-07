from http.server import BaseHTTPRequestHandler
import urllib.request

class handler(BaseHTTPRequestHandler):
  def do_GET(self):
    match_id = self.path.split("/")[-1]

    api_url = f"http://129.80.180.202:8000/match/{match_id}"

    try:
      req = urllib.request.Request(api_url)
      with urllib.request.urlopen(req) as res:
        data = res.read().decode()

    except:
      data = "Live match loading..."

    html = f"""
    <html>
      <head>
        <meta property="og:title" content="Ashes Match Live" />
        <meta property="og:description" content="{data}" />
        <meta property="og:image" content="https://ashes-website2.vercel.app/og/default.png" />
        <meta property="og:url" content="https://ashes-website2.vercel.app/match/{match_id}" />
      </head>
      <body></body>
    </html>
    """

    self.send_response(200)
    self.send_header("Content-Type", "text/html")
    self.end_headers()
    self.wfile.write(html.encode())