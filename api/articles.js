// @ts-nocheck
import './_suppressWarnings.js';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bogjmdyolhazzvicjrjl.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZ2ptZHlvbGhhenp2aWNqcmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDcxNDAsImV4cCI6MjEwNDAyMzE0MH0.taOdcGmN6pQ3sfuIC2UIVkSV-8j0Y_wuXS-7Un4xo_0';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
  realtime: { createClient: () => null }
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

// Category mapping helper
const CATEGORY_SLUG_TO_ID = {
  india: '11111111-1111-1111-1111-111111110001',
  politics: '11111111-1111-1111-1111-111111110002',
  business: '11111111-1111-1111-1111-111111110003',
  technology: '11111111-1111-1111-1111-111111110004',
  world: '11111111-1111-1111-1111-111111110005',
  sports: '11111111-1111-1111-1111-111111110006',
  entertainment: '11111111-1111-1111-1111-111111110007',
  lifestyle: '11111111-1111-1111-1111-111111110008',
  opinion: '11111111-1111-1111-1111-111111110009',
  crime: '11111111-1111-1111-1111-111111110010',
  social: '11111111-1111-1111-1111-111111110011',
  astrology: '11111111-1111-1111-1111-111111110012',
  religion: '11111111-1111-1111-1111-111111110013',
};

const isValidUUID = (str) => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

const slugify = (text, maxLength = 65) => {
  if (!text) return 'story-' + Date.now();
  let clean = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0900-\u097F-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength).replace(/-+$/, '');
  }
  return clean || 'story-' + Date.now();
};

async function purgeCloudflareEdge(slug, category) {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const cfToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!zoneId || !cfToken) return;

  const siteOrigin = 'https://www.npnewsmetro.com';
  const filesToPurge = [
    `${siteOrigin}/`,
    `${siteOrigin}/api/articles?view=homepage`,
    `${siteOrigin}/api/trending`,
    `${siteOrigin}/sitemap.xml`,
    `${siteOrigin}/news-sitemap.xml`,
    `${siteOrigin}/rss.xml`,
  ];
  if (category) {
    filesToPurge.push(`${siteOrigin}/category/${category}`);
    filesToPurge.push(`${siteOrigin}/api/articles?category=${category}`);
  }
  if (slug) {
    filesToPurge.push(`${siteOrigin}/api/articles?slug=${slug}`);
    if (category) filesToPurge.push(`${siteOrigin}/${category}/${slug}`);
  }

  try {
    await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files: filesToPurge }),
    });
  } catch (e) {}
}

export default async function handler(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // -----------------------------------------------------------------
  // WRITE OPERATIONS: POST / PUT (Save or Publish Article)
  // -----------------------------------------------------------------
  if (req.method === 'POST' || req.method === 'PUT') {
    let body = {};
    if (typeof req.body === 'string') {
      try { body = JSON.parse(req.body); } catch {}
    } else {
      body = req.body || {};
    }

    const { postData, targetStatus = 'draft' } = body;
    if (!postData) {
      return res.status(400).json({ error: 'postData payload is required' });
    }

    try {
      const title = postData.title?.trim() || 'Untitled News Story';
      const categoryId = postData.categoryId || postData.category_id || (postData.category && CATEGORY_SLUG_TO_ID[postData.category]) || '11111111-1111-1111-1111-111111110001';
      const contentText = Array.isArray(postData.blocks) && postData.blocks.length > 0
        ? postData.blocks.map(b => b.content || '').join('\n\n')
        : postData.dek || '';

      const readTimeMinutes = postData.readTime 
        ? parseInt(String(postData.readTime).replace(/[^\d]/g, ''), 10) || 3 
        : 3;

      let existingId = null;
      if (postData.id && isValidUUID(postData.id)) {
        existingId = postData.id;
      } else if (targetStatus === 'published') {
        const { data: draftMatches } = await supabase
          .from('articles')
          .select('id')
          .eq('title', title)
          .eq('status', 'draft')
          .order('created_at', { ascending: false })
          .limit(1);
        if (draftMatches && draftMatches.length > 0) {
          existingId = draftMatches[0].id;
        }
      }

      // Generate unique slug
      const rawSlugCandidate = postData.slug && postData.slug !== 'auto-draft' && postData.slug.trim().length > 1
        ? postData.slug.trim()
        : title;
      const baseSlug = slugify(rawSlugCandidate, 65);
      let candidateSlug = baseSlug;
      let counter = 1;
      let isUnique = false;
      while (!isUnique && counter <= 20) {
        let q = supabase.from('articles').select('id').eq('slug', candidateSlug);
        if (existingId) q = q.neq('id', existingId);
        const { data: existingSlugs } = await q;
        if (!existingSlugs || existingSlugs.length === 0) {
          isUnique = true;
        } else {
          candidateSlug = `${baseSlug}-${counter}`;
          counter++;
        }
      }

      const authorName = postData.customAuthor?.name || postData.authorName || 'NP News Metro Bureau';
      const authorRole = postData.customAuthor?.role || postData.authorRole || 'Staff Reporter';
      const authorAvatar = postData.customAuthor?.avatar || postData.authorAvatar || null;
      const authorBio = postData.customAuthor?.bio || postData.authorBio || null;

      const dbPayload = {
        title,
        title_hi: postData.titleHi || title,
        slug: candidateSlug,
        excerpt: postData.dek || null,
        dek_hi: postData.dekHi || null,
        content: contentText,
        category_id: categoryId,
        status: targetStatus,
        featured_image_url: postData.featuredImage || postData.featured_image_url || null,
        featured_image_alt: postData.imageAlt || postData.featured_image_alt || title,
        featured_image_caption: postData.imageCaption || postData.featured_image_caption || null,
        image_credit: postData.imageCredit || postData.image_credit || 'NP News Metro Photo Desk',
        is_breaking_news: !!postData.isBreaking,
        is_lead: postData.isLead !== undefined ? !!postData.isLead : true,
        is_featured: postData.isFeatured !== undefined ? !!postData.isFeatured : true,
        is_opinion: !!postData.isOpinion,
        is_sponsored: !!postData.isSponsored,
        sponsor_name: postData.sponsorName || null,
        location: postData.location || 'New Delhi',
        author_id: postData.authorId || '04ad79d9-d871-4099-a633-bcb7a1e35055',
        author_name: authorName,
        author_role: authorRole,
        author_avatar: authorAvatar,
        author_bio: authorBio,
        custom_author: postData.customAuthor || null,
        blocks: postData.blocks || [],
        key_takeaways: postData.keyTakeaways || [],
        seo_title: postData.seoTitle || null,
        meta_description: postData.seoDescription || null,
        reading_time_minutes: readTimeMinutes,
        published_at: targetStatus === 'published' 
          ? (postData.publishedAt || new Date().toISOString()) 
          : (postData.publishedAt || null),
        updated_at: new Date().toISOString(),
      };

      const SAVE_RETURN_FIELDS = `
        id, slug, title, title_hi, excerpt, dek_hi, category_id,
        categories (id, name, slug),
        status, updated_at, published_at, featured_image_url,
        article_tags (
          tags (id, name, slug)
        )
      `;

      let resultArticle = null;
      if (existingId) {
        const { data, error } = await supabase
          .from('articles')
          .update(dbPayload)
          .eq('id', existingId)
          .select(SAVE_RETURN_FIELDS)
          .single();
        if (error) return res.status(500).json({ error: `Update error: ${error.message}` });
        resultArticle = data;
      } else {
        const { data, error } = await supabase
          .from('articles')
          .insert(dbPayload)
          .select(SAVE_RETURN_FIELDS)
          .single();
        if (error) return res.status(500).json({ error: `Insert error: ${error.message}` });
        resultArticle = data;
      }

      // Record revision ONLY when published or manual edit, never on background auto-save
      const isAutoSave = Boolean(body.isAutoSave || postData.isAutoSave);
      const shouldRecordRevision = !isAutoSave && (targetStatus === 'published' || !existingId);
      if (resultArticle?.id && shouldRecordRevision) {
        try {
          await supabase.from('article_revisions').insert({
            article_id: resultArticle.id,
            title: resultArticle.title || title,
            excerpt: resultArticle.excerpt || postData.dek,
            content: contentText,
            status: targetStatus,
          });
        } catch (e) {}
      }

      // Purge drafts with same title if published
      if (targetStatus === 'published' && resultArticle?.id) {
        try {
          await supabase.from('articles').delete().eq('status', 'draft').eq('title', title).neq('id', resultArticle.id);
        } catch (e) {}
      }

      // Invalidate warm cache & Cloudflare Edge
      invalidateWarmCache();
      purgeCloudflareEdge(resultArticle.slug, postData.category);

      const fullPostResult = {
        ...dbPayload,
        ...resultArticle,
        blocks: postData.blocks || [],
      };

      return res.status(200).json({ post: fullPostResult, success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Error processing article' });
    }
  }

  // -----------------------------------------------------------------
  // DELETE OPERATION: Archive to deleted_articles & Remove from articles
  // -----------------------------------------------------------------
  if (req.method === 'DELETE') {
    const idOrSlug = req.query?.id || req.query?.slug;
    if (!idOrSlug) return res.status(400).json({ error: 'id or slug is required' });

    try {
      let q = supabase.from('articles').select('*');
      if (isValidUUID(idOrSlug)) q = q.eq('id', idOrSlug);
      else q = q.eq('slug', idOrSlug);

      const { data: rows, error: findErr } = await q;
      if (findErr || !rows || rows.length === 0) {
        return res.status(404).json({ error: 'Article not found' });
      }

      const article = rows[0];

      // Archive to deleted_articles
      try {
        await supabase.from('deleted_articles').insert({
          original_article_id: article.id,
          title: article.title,
          slug: article.slug,
          category_slug: article.category_slug || null,
          author_id: article.author_id || null,
          author_name: article.author_name || null,
          status: article.status || 'published',
          featured_image_url: article.featured_image_url || null,
          article_payload: article,
          deleted_at: new Date().toISOString(),
        });
      } catch (e) {}

      // Delete from articles
      await supabase.from('articles').delete().eq('id', article.id);

      invalidateWarmCache();
      purgeCloudflareEdge(article.slug, article.category_slug);

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // -----------------------------------------------------------------
  // READ OPERATIONS: GET
  // -----------------------------------------------------------------
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
          res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400');
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
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400');
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
          res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=600, stale-while-revalidate=86400');
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
      res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=600, stale-while-revalidate=86400');
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
          res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=300, stale-while-revalidate=86400');
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
      res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=300, stale-while-revalidate=86400');
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
        res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=300, stale-while-revalidate=86400');
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
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=300, stale-while-revalidate=86400');
    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json(responsePayload);

  } catch (err) {
    console.error('Unhandled error in /api/articles:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
