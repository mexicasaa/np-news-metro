// @ts-nocheck
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bogjmdyolhazzvicjrjl.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZ2ptZHlvbGhhenp2aWNqcmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDcxNDAsImV4cCI6MjEwNDAyMzE0MH0.taOdcGmN6pQ3sfuIC2UIVkSV-8j0Y_wuXS-7Un4xo_0';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

// In-memory warm container cache
const warmCache = new Map();
const CACHE_TTL = {
  homepage: 30 * 1000,     // 30s in-memory
  latest: 30 * 1000,       // 30s in-memory
  category: 60 * 1000,     // 60s in-memory
  article: 5 * 60 * 1000,  // 5m in-memory
  search: 60 * 1000,       // 60s in-memory
};

function getFromWarmCache(key, ttlMs) {
  const entry = warmCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ttlMs) {
    warmCache.delete(key);
    return null;
  }
  return entry.data;
}

function setInWarmCache(key, data) {
  if (warmCache.size > 200) {
    const oldestKey = warmCache.keys().next().value;
    warmCache.delete(oldestKey);
  }
  warmCache.set(key, { data, timestamp: Date.now() });
}

export function invalidateWarmCache(pattern) {
  if (!pattern) {
    warmCache.clear();
    return;
  }
  for (const key of warmCache.keys()) {
    if (key.includes(pattern)) {
      warmCache.delete(key);
    }
  }
}

// Lightweight fields for all card/list responses - strictly EXCLUDES heavy content & blocks
const CARD_PROJECTION_FIELDS = `
  id, slug, title, title_hi, excerpt, dek_hi, category_id,
  categories (id, name, slug),
  author_id, author_name, author_role, author_avatar,
  published_at, updated_at,
  is_breaking_news, is_lead, is_featured, is_opinion, is_sponsored,
  reading_time_minutes, view_count,
  featured_image_url, featured_image_alt, featured_image_caption
`;

// Full projection for single article detail
const ARTICLE_DETAIL_FIELDS = `
  id, slug, title, title_hi, excerpt, dek_hi, content, blocks, key_takeaways,
  author_id, author_name, author_role, author_avatar, author_bio,
  category_id, categories (id, name, slug),
  published_at, updated_at, status,
  is_breaking_news, is_lead, is_featured, is_opinion, is_sponsored, sponsor_name,
  reading_time_minutes, view_count, location, image_credit,
  seo_title, meta_description, canonical_url, robots_index, robots_follow,
  featured_image_url, featured_image_alt, featured_image_caption, custom_author,
  article_tags (
    tags (id, name, slug)
  )
`;

export default async function handler(req, res) {
  const url = new URL(req.url || '/', 'https://www.npnewsmetro.com');
  const slug = (req.query?.slug || url.searchParams.get('slug') || '').trim();
  const category = (req.query?.category || url.searchParams.get('category') || '').trim();
  const view = (req.query?.view || url.searchParams.get('view') || '').trim();
  const search = (req.query?.search || url.searchParams.get('search') || '').trim();
  const page = Math.max(1, parseInt(req.query?.page || url.searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(req.query?.limit || url.searchParams.get('limit') || '20', 10)));
  const offset = (page - 1) * limit;
  const bypassCache = req.query?.fresh === 'true' || url.searchParams.get('fresh') === 'true';

  try {
    // -------------------------------------------------------------
    // 1. SINGLE ARTICLE DETAIL (by slug)
    // -------------------------------------------------------------
    if (slug) {
      const cacheKey = `article:${slug}`;
      if (!bypassCache) {
        const cached = getFromWarmCache(cacheKey, CACHE_TTL.article);
        if (cached) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=900, stale-while-revalidate=3600');
          res.setHeader('X-Cache', 'WARM-HIT');
          return res.status(200).json(cached);
        }
      }

      const { data, error } = await supabase
        .from('articles')
        .select(ARTICLE_DETAIL_FIELDS)
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      if (!data) {
        return res.status(404).json({ error: 'Article not found' });
      }

      const responsePayload = { post: data };
      setInWarmCache(cacheKey, responsePayload);

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=900, stale-while-revalidate=3600');
      res.setHeader('X-Cache', 'MISS');
      return res.status(200).json(responsePayload);
    }

    // -------------------------------------------------------------
    // 2. SEARCH ARTICLES
    // -------------------------------------------------------------
    if (search) {
      const cacheKey = `search:${search}:${limit}`;
      if (!bypassCache) {
        const cached = getFromWarmCache(cacheKey, CACHE_TTL.search);
        if (cached) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
          res.setHeader('X-Cache', 'WARM-HIT');
          return res.status(200).json(cached);
        }
      }

      const safeQ = search.replace(/[%_]/g, '');
      const { data, error } = await supabase
        .from('articles')
        .select(CARD_PROJECTION_FIELDS)
        .eq('status', 'published')
        .or(`title.ilike.%${safeQ}%,excerpt.ilike.%${safeQ}%,title_hi.ilike.%${safeQ}%`)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      const responsePayload = { posts: data || [] };
      setInWarmCache(cacheKey, responsePayload);

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
      res.setHeader('X-Cache', 'MISS');
      return res.status(200).json(responsePayload);
    }

    // -------------------------------------------------------------
    // 3. CATEGORY FEED (paginated lightweight cards)
    // -------------------------------------------------------------
    if (category) {
      const cacheKey = `category:${category}:${page}:${limit}`;
      if (!bypassCache) {
        const cached = getFromWarmCache(cacheKey, CACHE_TTL.category);
        if (cached) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=180, stale-while-revalidate=600');
          res.setHeader('X-Cache', 'WARM-HIT');
          return res.status(200).json(cached);
        }
      }

      let query = supabase
        .from('articles')
        .select(CARD_PROJECTION_FIELDS)
        .eq('status', 'published');

      const { data: catRow } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category.toLowerCase())
        .maybeSingle();

      if (catRow?.id) {
        query = query.eq('category_id', catRow.id);
      }

      const { data, error } = await query
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      const responsePayload = { posts: data || [], page, limit };
      setInWarmCache(cacheKey, responsePayload);

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=180, stale-while-revalidate=600');
      res.setHeader('X-Cache', 'MISS');
      return res.status(200).json(responsePayload);
    }

    // -------------------------------------------------------------
    // 4. HOMEPAGE BUNDLE (view === 'homepage' or default)
    // -------------------------------------------------------------
    if (view === 'homepage' || (!slug && !category && !search && view !== 'latest')) {
      const cacheKey = 'view:homepage';
      if (!bypassCache) {
        const cached = getFromWarmCache(cacheKey, CACHE_TTL.homepage);
        if (cached) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=60, stale-while-revalidate=300');
          res.setHeader('X-Cache', 'WARM-HIT');
          return res.status(200).json(cached);
        }
      }

      const { data, error } = await supabase
        .from('articles')
        .select(CARD_PROJECTION_FIELDS)
        .eq('status', 'published')
        .order('is_lead', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(35);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      const responsePayload = { posts: data || [], timestamp: Date.now() };
      setInWarmCache(cacheKey, responsePayload);

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=60, stale-while-revalidate=300');
      res.setHeader('X-Cache', 'MISS');
      return res.status(200).json(responsePayload);
    }

    // -------------------------------------------------------------
    // 5. LATEST CHRONOLOGICAL STREAM (view === 'latest')
    // -------------------------------------------------------------
    const cacheKey = `view:latest:${page}:${limit}`;
    if (!bypassCache) {
      const cached = getFromWarmCache(cacheKey, CACHE_TTL.latest);
      if (cached) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=60, stale-while-revalidate=300');
        res.setHeader('X-Cache', 'WARM-HIT');
        return res.status(200).json(cached);
      }
    }

    const { data, error } = await supabase
      .from('articles')
      .select(CARD_PROJECTION_FIELDS)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const responsePayload = { posts: data || [], page, limit };
    setInWarmCache(cacheKey, responsePayload);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=60, stale-while-revalidate=300');
    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json(responsePayload);

  } catch (err) {
    console.error('Unhandled error in /api/articles:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
