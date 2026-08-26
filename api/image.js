export default async function handler(req, res) {
  try {
    const url = new URL(req.url || '/', 'https://www.npnewsmetro.com');
    const targetUrl = req.query?.url || url.searchParams.get('url');

    if (!targetUrl) {
      if (typeof res.status === 'function') {
        return res.status(400).send('Missing url parameter');
      }
      res.statusCode = 400;
      return res.end('Missing url parameter');
    }

    const decodedTarget = decodeURIComponent(targetUrl);

    // Only allow HTTP/HTTPS URLs
    if (!/^https?:\/\//i.test(decodedTarget)) {
      if (typeof res.status === 'function') {
        return res.status(400).send('Invalid url protocol');
      }
      res.statusCode = 400;
      return res.end('Invalid url protocol');
    }

    const imageRes = await fetch(decodedTarget);
    if (!imageRes.ok) {
      if (typeof res.status === 'function') {
        return res.status(imageRes.status).send('Failed to fetch upstream image');
      }
      res.statusCode = imageRes.status;
      return res.end('Failed to fetch upstream image');
    }

    const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await imageRes.arrayBuffer());

    if (typeof res.setHeader === 'function') {
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    if (typeof res.status === 'function' && typeof res.send === 'function') {
      return res.status(200).send(buffer);
    }
    res.statusCode = 200;
    return res.end(buffer);
  } catch (err) {
    if (typeof res.status === 'function') {
      return res.status(500).send('Image proxy error: ' + err.message);
    }
    res.statusCode = 500;
    return res.end('Image proxy error: ' + err.message);
  }
}
