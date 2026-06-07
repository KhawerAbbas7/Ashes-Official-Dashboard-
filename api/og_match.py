from http.server import BaseHTTPRequestHandler
import urllib.request
import html
class handler(BaseHTTPRequestHandler):
  def do_GET(self):
    match_id = self.path.split("/")[-1].split("?")[0]
    user_agent = self.headers.get("User-Agent", "").lower()
    host = self.headers.get("Host", "ashesdb.vercel.app")
    bot_keywords = ["bot", "spider", "crawler", "facebookexternalhit", "twitterbot", "whatsapp", "telegram", "discordbot"]
    if not any(k in user_agent for k in bot_keywords):
      try:
        req = urllib.request.Request(f"https://{host}/")
        with urllib.request.urlopen(req, timeout=5) as res:
          spa_html = res.read()
      except:
        spa_html = b"<html><body>App Loading Error</body></html>"
      self.send_response(200)
      self.send_header("Content-Type", "text/html")
      self.end_headers()
      self.wfile.write(spa_html)
      return
    api_url = f"http://129.80.180.202:8000/match/{match_id}"
    try:
      req = urllib.request.Request(api_url)
      with urllib.request.urlopen(req, timeout=8) as res:
        data = html.escape(" ".join(res.read().decode().split())[:250])
    except:
      data = "Live match loading..."
    html_content = f"""<!DOCTYPE html><html><head><meta charset="utf-8"><meta property="og:title" content="Ashes Match Live" /><meta property="og:type" content="website" /><meta property="og:description" content="{data}" /><meta property="og:image" content="https://cdn.discordapp.com/avatars/1443165621100740668/40ef4cf2ee6a72db2a5af55c231192bd.png" /><meta property="og:url" content="https://{host}/match/{match_id}" /><meta name="twitter:card" content="summary_large_image"></head><body></body></html>"""
    self.send_response(200)
    self.send_header("Content-Type", "text/html")
    self.end_headers()
    self.wfile.write(html_content.encode())
