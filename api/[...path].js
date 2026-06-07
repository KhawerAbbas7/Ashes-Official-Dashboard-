export default async function handler(req, res) {
  // Extract path from query params injected by Vercel
  const targetUrl = 'http://129.80.180.202:8000';
  
  // Reconstruct the original path
  let pathStr = '';
  if (Array.isArray(req.query.path)) {
    pathStr = req.query.path.join('/');
  } else if (req.query.path) {
    pathStr = req.query.path;
  }
  
  // Create URL object to combine path and remaining query params
  const incomingUrl = new URL(req.url, `http://${req.headers.host}`);
  
  const forwardUrl = new URL(`/${pathStr}`, targetUrl);
  
  // Copy all search params EXCEPT 'path' which is the catch-all
  incomingUrl.searchParams.forEach((value, key) => {
    if (key !== 'path') {
      forwardUrl.searchParams.append(key, value);
    }
  });

  try {
    const response = await fetch(forwardUrl.toString(), {
      method: req.method,
      headers: {
        'Accept': 'application/json',
      }
    });

    const data = await response.text();
    res.status(response.status);
    
    // Add CORS headers just in case
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Forward the content type
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    } else {
      res.setHeader('Content-Type', 'application/json');
    }
    
    res.send(data);
  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).json({ error: 'Proxy Server Error', details: error.message });
  }
}
