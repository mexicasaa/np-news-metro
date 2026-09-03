// @ts-nocheck
import url from 'node:url';

// 1. Permanently silence DEP0169 url.parse deprecation warnings across all runtimes
if (typeof process !== 'undefined' && process.emitWarning) {
  const _origEmitWarning = process.emitWarning;
  process.emitWarning = function (warning, ...args) {
    if (
      (typeof warning === 'string' && (warning.includes('url.parse') || warning.includes('DEP0169'))) ||
      (args[0] === 'DEP0169' || args[1] === 'DEP0169') ||
      (warning && typeof warning === 'object' && (warning.code === 'DEP0169' || warning.name === 'DEP0169' || (warning.message && warning.message.includes('url.parse'))))
    ) {
      return;
    }
    return _origEmitWarning.apply(process, [warning, ...args]);
  };
}

if (url && typeof url.parse === 'function') {
  const _origParse = url.parse;
  url.parse = function (...args) {
    if (typeof process !== 'undefined' && process.emitWarning) {
      const savedEmit = process.emitWarning;
      process.emitWarning = () => {};
      try {
        return _origParse.apply(this, args);
      } finally {
        process.emitWarning = savedEmit;
      }
    }
    return _origParse.apply(this, args);
  };
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bogjmdyolhazzvicjrjl.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZ2ptZHlvbGhhenp2aWNqcmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDcxNDAsImV4cCI6MjEwNDAyMzE0MH0.taOdcGmN6pQ3sfuIC2UIVkSV-8j0Y_wuXS-7Un4xo_0';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
  realtime: { createClient: () => null }
});

const warmCache = new Map();
const CACHE_TTL_VIDEOS = 60 * 1000; // 60 seconds

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

const VIDEO_PROJECTION_FIELDS = `
  id, slug, title, youtube_url, youtube_video_id, description,
  thumbnail_url, channel_name, published_at, duration_seconds,
  status, category_id,
  categories (id, name, slug)
`;

export default async function handler(req, res) {
  const url = new URL(req.url || '/', 'https://www.npnewsmetro.com');
  const slug = (req.query?.slug || url.searchParams.get('slug') || '').trim();
  const bypassCache = req.query?.fresh === 'true' || url.searchParams.get('fresh') === 'true';

  try {
    if (slug) {
      const cacheKey = `video:${slug}`;
      if (!bypassCache) {
        const cached = warmCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_VIDEOS * 5) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
          return res.status(200).json(cached.data);
        }
      }

      const { data, error } = await supabase
        .from('videos')
        .select(VIDEO_PROJECTION_FIELDS)
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      if (!data) {
        return res.status(404).json({ error: 'Video not found' });
      }

      const responsePayload = { video: data };
      warmCache.set(cacheKey, { data: responsePayload, timestamp: Date.now() });

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
      return res.status(200).json(responsePayload);
    }

    const cacheKey = 'videos:list';
    if (!bypassCache) {
      const cached = warmCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_VIDEOS) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
        return res.status(200).json(cached.data);
      }
    }

    const { data, error } = await supabase
      .from('videos')
      .select(VIDEO_PROJECTION_FIELDS)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(20);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const responsePayload = { videos: data || [] };
    warmCache.set(cacheKey, { data: responsePayload, timestamp: Date.now() });

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(responsePayload);

  } catch (err) {
    console.error('Unhandled error in /api/videos:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
