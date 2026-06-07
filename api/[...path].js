export default async function handler(req, res) {
  const targetUrl = 'http://129.80.180.202:8000';

  let pathStr = '';
  if (Array.isArray(req.query.path)) {
    pathStr = req.query.path.join('/');
  } else if (req.query.path) {
    pathStr = req.query.path;
  }

  const forwardUrl = new URL(`${targetUrl}/${pathStr}`);

  for (const [key, value] of Object.entries(req.query)) {
    if (key !== 'path') forwardUrl.searchParams.append(key, value);
  }

  if (req.method === 'OPTIONS') {
    res.status(200);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.end();
  }

  try {
    const response = await fetch(forwardUrl.toString(), {
      method: req.method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': req.headers['content-type'] || '',
        ...(req.headers.authorization && {
          Authorization: req.headers.authorization
        })
      },
      body: ['GET', 'HEAD'].includes(req.method)
        ? undefined
        : req.body ? JSON.stringify(req.body) : undefined
    });

    const data = await response.text();

    res.status(response.status);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    const contentType = response.headers.get('content-type');
    res.setHeader('Content-Type', contentType || 'application/json');

    res.send(data);
  } catch (error) {
    res.status(500).json({
      error: 'Proxy Server Error',
      details: error.message
    });
  }
}