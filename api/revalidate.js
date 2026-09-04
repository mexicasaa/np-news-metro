// @ts-nocheck
import './_suppressWarnings.js';
import { invalidateWarmCache } from './articles.js';
import { invalidateWarmCache as invalidateVideosWarmCache } from './videos.js';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const slug = req.query?.slug || req.body?.slug;
    const category = req.query?.category || req.body?.category;
    const type = req.query?.type || req.body?.type;
    const action = req.query?.action || req.body?.action || 'update';

    // 1. Invalidate Vercel container in-memory cache
    if (slug) {
      invalidateWarmCache(`article:${slug}`);
      invalidateVideosWarmCache(`video:${slug}`);
    }
    if (category) {
      invalidateWarmCache(`category:${category}`);
    }

    if (type === 'video' || category === 'videos') {
      invalidateVideosWarmCache('videos:list');
    }
    
    invalidateWarmCache('view:homepage');
    invalidateWarmCache('view:latest');

    // 2. Targeted Cloudflare edge cache purge (Rule 47)
    let cloudflarePurgeResult = null;
    const zoneId = process.env.CLOUDFLARE_ZONE_ID;
    const cfToken = process.env.CLOUDFLARE_API_TOKEN;

    if (zoneId && cfToken) {
      const siteOrigin = 'https://www.npnewsmetro.com';
      const filesToPurge = [
        `${siteOrigin}/`,
        `${siteOrigin}/api/articles?view=homepage`,
        `${siteOrigin}/api/trending`,
      ];

      if (category) {
        filesToPurge.push(`${siteOrigin}/category/${category}`);
        filesToPurge.push(`${siteOrigin}/api/articles?category=${category}`);
      }

      if (slug && category) {
        filesToPurge.push(`${siteOrigin}/${category}/${slug}`);
        filesToPurge.push(`${siteOrigin}/api/articles?slug=${slug}`);
      }

      try {
        const cfRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cfToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ files: filesToPurge }),
        });
        cloudflarePurgeResult = await cfRes.json();
      } catch (cfErr) {
        console.warn('Cloudflare edge cache purge notice:', cfErr.message);
      }
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res.status(200).json({
      revalidated: true,
      action,
      slug: slug || null,
      category: category || null,
      cloudflarePurged: cloudflarePurgeResult?.success || false,
      timestamp: Date.now(),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Revalidation failed' });
  }
}
