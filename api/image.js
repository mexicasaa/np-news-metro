const SUPABASE_STORAGE_ORIGIN = process.env.VITE_SUPABASE_URL || 'https://jkzrjqclgqpfjdqxsnut.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprenJqcWNsZ3FwZmpkcXhzbnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NjU0ODksImV4cCI6MjEwMzE0MTQ4OX0.tDPKLptID2tvWKAKstPVr73I7p_cFt3PPGX9AXL4l28';

export default async function handler(req, res) {
  try {
    const isHead = req.method === 'HEAD';
    const url = new URL(req.url || '/', 'https://www.npnewsmetro.com');
    
    // Support:
    // 1. req.query.slug from /api/image?slug=... (for base64/dynamic image articles)
    // 2. req.query.path from Vercel rewrite /api/image/:path* -> /api/image?path=:path*
    // 3. req.query.url from legacy ?url=...
    // 4. url.pathname direct path /api/image/...
    let slugParam = (req.query?.slug || url.searchParams.get('slug') || '').trim();
    let pathParam = (req.query?.path || url.searchParams.get('path') || '').trim();
    let urlParam = (req.query?.url || url.searchParams.get('url') || '').trim();

    if (!pathParam && !urlParam && !slugParam) {
      const match = url.pathname.match(/^\/api\/image\/(.+)$/);
      if (match && match[1]) {
        pathParam = match[1];
      }
    }

    if (slugParam) {
      try {
        const artRes = await fetch(`${SUPABASE_STORAGE_ORIGIN}/rest/v1/articles?select=featured_image_url&slug=eq.${encodeURIComponent(slugParam)}`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        if (artRes.ok) {
          const artData = await artRes.json();
          const featured = artData && artData[0]?.featured_image_url;
          if (featured) {
            const trimmed = featured.trim();
            if (trimmed.startsWith('data:image/')) {
              const match = trimmed.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/s);
              if (match) {
                const contentType = match[1];
                const buffer = Buffer.from(match[2], 'base64');
                if (typeof res.setHeader === 'function') {
                  res.setHeader('Content-Type', contentType);
                  res.setHeader('Content-Length', buffer.length);
                  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.setHeader('X-Robots-Tag', 'all, index, follow');
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
              }
            } else if (trimmed.includes('/storage/v1/object/public/')) {
              pathParam = trimmed.split('/storage/v1/object/public/')[1];
            } else if (trimmed.includes('/storage/v1/render/image/public/')) {
              pathParam = trimmed.split('/storage/v1/render/image/public/')[1]?.split('?')[0];
            } else {
              urlParam = trimmed;
            }
          }
        }
      } catch (e) {}
    }

    let targetUrl = '';
    let fallbackUrl = '';

    if (pathParam) {
      const cleanPath = decodeURIComponent(pathParam).replace(/^\/+/, '');
      // Route through Supabase Image Transformation CDN with optimal web parameters (1200px width, 75% quality)
      // CRITICAL: This is REQUIRED because WhatsApp strictly drops ANY image > 300KB!
      // This compression reduces large raw images (like 600KB) to ~130KB to guarantee they show in WhatsApp.
      targetUrl = `${SUPABASE_STORAGE_ORIGIN}/storage/v1/render/image/public/${cleanPath}?width=1200&quality=75`;
      fallbackUrl = `${SUPABASE_STORAGE_ORIGIN}/storage/v1/object/public/${cleanPath}`;
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

      // If this is a Supabase storage URL, optimize via render/image
      if (decoded.includes('/storage/v1/object/public/')) {
        const storagePath = decoded.split('/storage/v1/object/public/')[1];
        targetUrl = `${SUPABASE_STORAGE_ORIGIN}/storage/v1/render/image/public/${storagePath}?width=1200&quality=75`;
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
    let buffer = Buffer.from(await imageRes.arrayBuffer());

    // CRITICAL: WhatsApp strictly drops ANY image >= 300KB (307,200 bytes).
    // If transformed buffer is > 280KB and we have a storage path, re-fetch with 800px / q65 to guarantee < 300KB
    if (buffer.length > 280 * 1024 && pathParam) {
      try {
        const cleanPath = decodeURIComponent(pathParam).replace(/^\/+/, '');
        const compressedUrl = `${SUPABASE_STORAGE_ORIGIN}/storage/v1/render/image/public/${cleanPath}?width=800&quality=65`;
        const cRes = await fetch(compressedUrl);
        if (cRes.ok) {
          buffer = Buffer.from(await cRes.arrayBuffer());
        }
      } catch (ce) {}
    }

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
