from http.server import BaseHTTPRequestHandler
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
import urllib.request
import json
import os
from urllib.parse import urlparse, parse_qs
def makeScorecard(data, inning_index=0):
  S = 1.3325714286
  BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
  img = Image.open(os.path.join(BASE_DIR, "templates", "battingSummary.png")).convert("RGBA")
  draw = ImageDraw.Draw(img)
  font = ImageFont.truetype(os.path.join(BASE_DIR, "fonts", "archivo.woff2"), int(65 * S))
  font2 = ImageFont.truetype(os.path.join(BASE_DIR, "fonts", "ArchivoNarrowRegular.woff2"), int(32.7 * S))
  font3 = ImageFont.truetype(os.path.join(BASE_DIR, "fonts", "ArchivoNarrowRegular.woff2"), int(27 * S))
  font4 = ImageFont.truetype(os.path.join(BASE_DIR, "fonts", "archivo.woff2"), int(40 * S))
  inning = data["innings"][inning_index]
  draw.text((210, 15), inning["battingTeam"].upper(), font=font, fill="white")
  y = 210.3
  offset = 91.1
  try:
    overlay = Image.open(os.path.join(BASE_DIR, "templates", "NotOutLine.png")).convert("RGBA")
  except:
    overlay = None
  for b in inning["batters"]:
    name = b["playerName"].upper()[:15]
    is_not_out = not b["dismissed"]
    status_text = "NOT OUT" if is_not_out else "OUT"
    r_w = font3.getlength(str(b["runs"]))
    b_w = font3.getlength(str(b["balls"]))
    if is_not_out and overlay:
      img.paste(overlay, (74, int(y - 20)), overlay)
    fill_color = "black" if is_not_out else "white"
    draw.text((121, y), name, font=font2, fill=fill_color, stroke_width=0)
    draw.text((645, y), status_text, font=font2, fill=fill_color)
    draw.text((975.7 + 63.1 / 2 - r_w / 2, y + 5), str(b["runs"]), font=font3, fill=fill_color, stroke_width=0.5)
    draw.text((1075.9 + 69.4 / 2 - b_w / 2, y + 5), str(b["balls"]), font=font3, fill=fill_color, stroke_width=0)
    y += offset
  total_balls = inning["balls"]
  draw.text((781.5, 1177.9), f"{total_balls//6}.{total_balls%6}", font=font4, fill="white")
  draw.text((1050.1, 1177.9), f"{inning['total']}-{inning['wickets']}", font=font4, fill="white")
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
      img_io = makeScorecard(data)
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
      