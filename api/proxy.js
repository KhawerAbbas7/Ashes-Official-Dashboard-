export default async function handler(req, res) {
  // In Vercel, req.url contains the original URL, including the query string
  // E.g., /api/matches/getrecent?recent=20
  let urlPath = req.url;
  
  // Remove the /api prefix for the backend
  if (urlPath.startsWith('/api')) {
    urlPath = urlPath.replace(/^\/api/, '');
  }

  const targetUrl = 'http://129.80.180.202:8000';
  
  try {
    const response = await fetch(`${targetUrl}${urlPath}`, {
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
    res.status(500).json({ error: 'Proxy Server Error', details: error.message });
  }
}
y