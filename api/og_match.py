from http.server import BaseHTTPRequestHandler
import urllib.request
import html
import traceback
class handler(BaseHTTPRequestHandler):
  def do_GET(self):
    if "redirected=true" in self.path:
      self.send_response(200)
      self.send_header("Content-Type", "text/html")
      self.end_headers()
      self.wfile.write(b"<html><body>Your Frontend Application Shell Goes Here</body></html>")
      return
    match_id = self.path.split("/")[-1].split("?")[0]
    user_agent = self.headers.get("User-Agent", "").lower()
    bot_keywords = ["bot", "spider", "crawler", "facebookexternalhit", "twitterbot", "whatsapp", "telegram", "discordbot"]
    if not any(k in user_agent for k in bot_keywords):
      self.send_response(302)
      self.send_header("Location", f"https://ashesdb.vercel.app/match/{match_id}?redirected=true")
      self.end_headers()
      return
    api_url = f"http://129.80.180.202:8000/match/{match_id}"
    try:
      req = urllib.request.Request(api_url)
      with urllib.request.urlopen(req, timeout=8) as res:
        raw_data = res.read().decode()
        data = html.escape(raw_data)
    except Exception as e:
      print(f"Fetch error: {e}")
      traceback.print_exc()
      data = "Live match loading..."
    html_content = f"""<html><head><meta property="og:title" content="Ashes Match Live" /><meta property="og:description" content="{data}" /><meta property="og:image" content="https://cdn.discordapp.com/avatars/1443165621100740668/40ef4cf2ee6a72db2a5af55c231192bd.png" /><meta property="og:url" content="https://ashesdbvercel.vercel.app/match/{match_id}" /></head><body></body></html>"""
    self.send_response(200)
    self.send_header("Content-Type", "text/html")
    self.end_headers()
    self.wfile.write(html_content.encode())
