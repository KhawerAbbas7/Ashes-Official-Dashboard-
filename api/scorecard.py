from http.server import BaseHTTPRequestHandler
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
import urllib.request
import json
import os
from urllib.parse import urlparse, parse_qs
def makeMatchSummary(data):
  S = 1.3325714286
  BASE_DIR = os.path.dirname(os.path.abspath(__file__))
  img = Image.open(os.path.join(BASE_DIR, "templates", "matchSummary.png")).convert("RGBA")
  draw = ImageDraw.Draw(img)
  font = ImageFont.truetype(os.path.join(BASE_DIR, "fonts", "archivo.woff2"), int(40*S))
  font2 = ImageFont.truetype(os.path.join(BASE_DIR, "fonts", "canvaSansRegular.woff2"), int(30*S))
  font3 = ImageFont.truetype(os.path.join(BASE_DIR, "fonts", "canvaSansRegular.woff2"), int(23*S))
  font4 = ImageFont.truetype(os.path.join(BASE_DIR, "fonts", "canvaSansRegular.woff2"), int(28*S))
  font5 = ImageFont.truetype(os.path.join(BASE_DIR, "fonts", "canvaSansBold.woff2"), int(28*S))
  fonts = ImageFont.truetype(os.path.join(BASE_DIR, "fonts", "archivo.woff2"), int(28*S))
  fontb = ImageFont.truetype(os.path.join(BASE_DIR, "fonts", "canvaSansBold.woff2"), int(24*S))
  font7 = ImageFont.truetype(os.path.join(BASE_DIR, "fonts", "archivo.woff2"), int(31*S))
  t1 = data.get('teamAName', data['innings'][0]['battingTeam'] if data.get('innings') else 'TEAM A')
  t2 = data.get('teamBName', data['innings'][0]['bowlingTeam'] if data.get('innings') else 'TEAM B')
  draw.text((203.3, 139.4), f"{t1.upper()} VS {t2.upper()}", font=font2, fill='White')
  y = 260
  offset = 215.7
  for i, inn in enumerate(data.get("innings", [])):
    battingTeam = f"{inn['battingTeam'].upper()} {inn['total']}/{inn['wickets']}"
    color = "#14f67c" if i % 2 == 0 else "#05a9e6"
    draw.text((100, y), battingTeam, font=font, fill=color)
    ino = inn.get("inningNo", i+1)
    ord_s = "th" if 10 <= ino % 100 <= 20 else {1: "st", 2: "nd", 3: "rd"}.get(ino % 10, "th")
    innLabel = f"{ino}{ord_s} Inning".upper()
    draw.text((1200 - font3.getlength(innLabel), y + 10), innLabel, font=font3, fill='White')
    topBat = sorted(inn.get("batters", []), key=lambda x: x.get("runs", 0), reverse=True)[:2]
    topBowl = sorted(inn.get("bowlers", []), key=lambda x: x.get("wickets", 0), reverse=True)[:2]
    y2 = y
    offset2 = 50
    for k in range(2):
      if k < len(topBat):
        b = topBat[k]
        name = b.get("playerName", "")[:15].upper()
        runs = str(b.get("runs", 0))
        balls = str(b.get("balls", 0))
        draw.text((100, y2 + 60), name, font=font4, fill='White')
        draw.text((475.8, y2 + 60), runs, font=fonts, fill='White')
        l = fonts.getlength(runs) + 5
        draw.text(((475.8 + l), y2 + 60), balls, font=fontb, fill='White')
      if k < len(topBowl):
        b = topBowl[k]
        name = b.get("playerName", "")[:15].upper()
        fig = f"{b.get('wickets', 0)}-{b.get('runs', 0)}"
        draw.text((750, y2 + 60), name, font=font4, fill='White')
        draw.text((1190 - font5.getlength(fig), y2 + 60), fig, font=font5, fill='White')
      y2 += offset2
    if i > 0: offset = 230
    if i == 2: offset = 240
    y += offset
  status = data.get("winner", "")
  footer = f"{status}".upper() if status else "MATCH DRAWN"
  draw.text(((1280 - font7.getlength(footer)) / 2, 1190), footer, font=font7, fill="black")
  image_binary = BytesIO()
  img.save(image_binary, 'PNG')
  image_binary.seek(0)
  return image_binary
class handler(BaseHTTPRequestHandler):
  def do_GET(self):
    query_components = parse_qs(urlparse(self.path).query)
    match_id = query_components.get("match_id", [None])[0]
    if not match_id:
      self.send_response(400)
      self.end_headers()
      return
    api_url = f"http://129.80.180.202:8000/matches/{match_id}/scorecard"
    try:
      req = urllib.request.Request(api_url)
      with urllib.request.urlopen(req, timeout=8) as res:
        data = json.loads(res.read().decode())
      img_io = makeMatchSummary(data)
      self.send_response(200)
      self.send_header('Content-type', 'image/png')
      self.send_header('Cache-Control', 'public, max-age=86400')
      self.end_headers()
      self.wfile.write(img_io.getvalue())
    except Exception as e:
      self.send_response(500)
      self.send_header('Content-type', 'text/plain')
      self.end_headers()
      self.wfile.write(f"Error: {str(e)}".encode('utf-8'))
