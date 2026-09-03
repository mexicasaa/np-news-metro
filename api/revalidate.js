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

    // Invalidate specific cache keys or all public feeds
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
    
    // Always bust homepage and latest news feeds upon editorial updates
    invalidateWarmCache('view:homepage');
    invalidateWarmCache('view:latest');

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res.status(200).json({
      revalidated: true,
      action,
      slug: slug || null,
      category: category || null,
      timestamp: Date.now()
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Revalidation failed' });
  }
}
