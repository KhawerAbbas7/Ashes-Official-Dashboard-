from http.server import BaseHTTPRequestHandler
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
import urllib.request
import json
import os
from urllib.parse import urlparse, parse_qs
import hmac, time
import hashlib
SECRET =os.environ["hmacSec"].encode("utf-8")
def valid_sig(match_id, ts, sig):
  msg = f"{match_id}:{int(float(ts))}".encode()
  expected = hmac.new(SECRET, msg, hashlib.sha256).hexdigest()
  return hmac.compare_digest(expected, sig)
def getResult(data):
  plural = lambda n, w: w + 's' if n != 1 else w
  t1 = data['innings'][0]['battingTeam']
  t2 = data['innings'][0]['bowlingTeam']
  teamsScores = {t1: sum(i['total'] for i in data['innings'] if t1 == i['battingTeam']), t2: sum(i['total'] for i in data['innings'] if t2 == i['battingTeam'])}
  maxWickets = max([i['wickets'] for i in data['innings']])
  folllowedOn = any(i['isFollowOn'] for i in data['innings'])
  totalBalls = data['matchMaximumBalls']
  lastInn = data['innings'][-1]
  if data['drawByAgreement']:
    return "Drawn by Agreement"
  if sum([i['balls'] for i in data['innings']]) == totalBalls: return "Match Drawn"
  if lastInn['inningNo'] == 4:
    if teamsScores[lastInn['battingTeam']] > teamsScores[lastInn['bowlingTeam']]: return f"{lastInn['battingTeam']} WON BY {maxWickets - lastInn['wickets']} {plural(maxWickets - lastInn['wickets'], 'wicket')}"
    if lastInn['wickets'] == maxWickets:
      if teamsScores[lastInn['battingTeam']] == teamsScores[lastInn['bowlingTeam']]: return "Match Tied"
      elif teamsScores[lastInn['battingTeam']] < teamsScores[lastInn['bowlingTeam']]: return f"{lastInn['bowlingTeam']} Won by {teamsScores[lastInn['bowlingTeam']]-teamsScores[lastInn['battingTeam']]} {plural(teamsScores[lastInn['bowlingTeam']]-teamsScores[lastInn['battingTeam']], 'Run')}"
  elif lastInn['inningNo'] == 3:
    if lastInn['wickets'] == maxWickets:
      return f"{lastInn['bowlingTeam']} Won by an inning and {teamsScores[lastInn['bowlingTeam']]-teamsScores[lastInn['battingTeam']]} {plural(teamsScores[lastInn['bowlingTeam']]-teamsScores[lastInn['battingTeam']], 'Run')}"
    else:
      return "Match Drawn"
  else: return "Match Drawn"
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
    battingTeam = f"{inn['battingTeam'].upper()} {inn['total']}/{inn['wickets']}{'(D)' if inn['isDeclared'] else ''}{'(F/O)' if inn['isFollowOn'] else ''}"
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
  status = getResult(data)
  footer = f"{status}".upper() if status else "MATCH DRAWN"
  draw.text(((1280 - font7.getlength(footer)) / 2, 1190), footer, font=font7, fill="black")
  image_binary = BytesIO()
  img.save(image_binary, 'PNG')
  image_binary.seek(0)
  return image_binary
class handler(BaseHTTPRequestHandler):
  def do_GET(self):
    query_components = parse_qs(urlparse(self.path).query)
    user_agent = self.headers.get("User-Agent", "").lower()
    host = self.headers.get("Host", "ashesdb.vercel.app")
    bot_keywords = ["bot", "spider", "crawler", "facebookexternalhit", "twitterbot", "whatsapp", "telegram", "discordbot"]
    if not any(k in user_agent for k in bot_keywords):
      self.send_response(403)
      self.end_headers()
    match_id = query_components.get("match_id", [None])[0]
    ts = query_components.get("ts", [None])[0]
    sig = query_components.get("hmac", [None])[0]
    if not ts or not sig:
      self.send_response(400)
      self.end_headers()
      return
    if abs(int(time.time()) - int(float(ts))) > 300:
      self.send_response(403)
      self.end_headers()
      return
    if not valid_sig(match_id, ts, sig):
      self.send_response(403)
      self.end_headers()
      return
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
