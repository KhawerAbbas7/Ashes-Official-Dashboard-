from http.server import BaseHTTPRequestHandler
import urllib.request
import html, json
from datetime import datetime
from zoneinfo import ZoneInfo
import time
import hmac
import hashlib
SECRET = b"NU%&iTrmScUJ2*nxlrhSf9a@3qq!*hOi%rU*cLzeXp#htSogcG9lGAVZCN3*!5DkVNX!dap4xcR$jZKtaI%0nT!ijbCDLC*InGh!a$!d9p4Dwx*GGVL*jYjO7eHFxhlg"
def make_sig(match_id, ts):
  msg = f"{match_id}:{int(ts)}".encode()
  return hmac.new(SECRET, msg, hashlib.sha256).hexdigest()
def to_pkt(timestamp):
  dt = datetime.fromtimestamp(int(timestamp), ZoneInfo("Asia/Karachi"))
  return dt.strftime("%Y-%m-%d %H:%M:%S")

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
    api_url = f"http://129.80.180.202:8000/matches/{match_id}"
    try:
      req = urllib.request.Request(api_url)
      with urllib.request.urlopen(req, timeout=8) as res:
        data = json.loads(res.read().decode())
    except:
      data = {"teamAName": "Live", "teamBName": "Match", "guildName": "Loading...", "channelName": "", "winner": "", "mvp": {"name": ""}}
    tims = time.time()
    s = make_sig(match_id, tims)
    og_image_url = f"https://{host}/api/scorecard?match_id={match_id}&hmac={s}&ts={tims}"
    html_content = f"""<!DOCTYPE html><html><head><meta charset="utf-8"><meta property="og:title" content="Ashes | {data['teamAName']} Vs {data['teamBName']}" /><meta property="og:type" content="website" /><meta property="og:description" content="Guild: {data['guildName']}\nChannel: {data['channelName']}\nWon: {data['winner']}\nMVP: {data['mvp']['name']}\nTime: {to_pkt(data['timestamp'])} PKT" /><meta name="theme-color" content="#ca3e47" /><meta property="og:image" content="{og_image_url}" /><meta name="twitter:card" content="summary_large_image" /><meta name="twitter:image" content="{og_image_url}" /><meta property="og:url" content="https://{host}/match/{match_id}" /></head><body></body></html>"""
    self.send_response(200)
    self.send_header("Content-Type", "text/html")
    self.end_headers()
    self.wfile.write(html_content.encode())
