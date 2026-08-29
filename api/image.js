const SUPABASE_STORAGE_ORIGIN = process.env.VITE_SUPABASE_URL || 'https://jkzrjqclgqpfjdqxsnut.supabase.co';

export default async function handler(req, res) {
  try {
    const isHead = req.method === 'HEAD';
    const url = new URL(req.url || '/', 'https://www.npnewsmetro.com');
    
    // Support:
    // 1. req.query.path from Vercel rewrite /api/image/:path* -> /api/image?path=:path*
    // 2. req.query.url from legacy ?url=...
    // 3. url.pathname direct path /api/image/...
    let pathParam = (req.query?.path || url.searchParams.get('path') || '').trim();
    let urlParam = (req.query?.url || url.searchParams.get('url') || '').trim();

    if (!pathParam && !urlParam) {
      const match = url.pathname.match(/^\/api\/image\/(.+)$/);
      if (match && match[1]) {
        pathParam = match[1];
      }
    }

    let targetUrl = '';
    let fallbackUrl = '';

    if (pathParam) {
      const cleanPath = decodeURIComponent(pathParam).replace(/^\/+/, '');
      // Serve raw, uncompressed image, removing previous render/image optimization
      targetUrl = `${SUPABASE_STORAGE_ORIGIN}/storage/v1/object/public/${cleanPath}`;
      fallbackUrl = targetUrl;
    } else if (urlParam) {
      let decoded = urlParam;
      try {
        if (!/^https?:\/\//i.test(decoded)) {
          decoded = decodeURIComponent(urlParam);
        }
      } catch (e) {
        decoded = urlParam;
      }

      if (!/^https?:\/\//i.test(decoded)) {
        if (typeof res.status === 'function') {
          return res.status(400).send('Invalid url protocol');
        }
        res.statusCode = 400;
        return res.end('Invalid url protocol');
      }

      // If this is a Supabase storage URL, serve raw uncompressed
      if (decoded.includes('/storage/v1/object/public/')) {
        targetUrl = decoded;
        fallbackUrl = decoded;
      } else {
        targetUrl = decoded;
      }
    } else {
      if (typeof res.status === 'function') {
        return res.status(400).send('Missing image path or url parameter');
      }
      res.statusCode = 400;
      return res.end('Missing image path or url parameter');
    }

    // Try fetching the optimized image first
    let imageRes = await fetch(targetUrl);
    
    // If optimized render endpoint failed or not found, try fallback raw object
    if (!imageRes.ok && fallbackUrl) {
      imageRes = await fetch(fallbackUrl);
    }

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
      res.setHeader('X-Robots-Tag', 'all, index, follow');
      // Strips any upstream x-robots-tag: none to ensure full social/search crawler indexing
    }

    if (isHead) {
      res.statusCode = 200;
      return res.end();
    }

    if (typeof res.status === 'function' && typeof res.send === 'function') {
      return res.status(200).send(buffer);
    }
    res.statusCode = 200;
    return res.end(buffer);
  } catch (err) {
    if (typeof res.status === 'function') {
      return res.status(500).send('Image proxy error: ' + (err?.message || 'Unknown error'));
    }
    res.statusCode = 500;
    return res.end('Image proxy error: ' + (err?.message || 'Unknown error'));
  }
}
