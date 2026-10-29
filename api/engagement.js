// @ts-nocheck
import './_suppressWarnings.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bogjmdyolhazzvicjrjl.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZ2ptZHlvbGhhenp2aWNqcmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDcxNDAsImV4cCI6MjEwNDAyMzE0MH0.taOdcGmN6pQ3sfuIC2UIVkSV-8j0Y_wuXS-7Un4xo_0';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

const adWarmCache = new Map();
const AD_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// In-memory warm RAM cache for translation (strictly NON-database)
const translationWarmCache = new Map();
const MAX_TRANSLATION_CACHE = 5000;

function getCacheKey(text, targetLang, sourceLang = 'auto') {
  return `${sourceLang}:${targetLang}:${text.trim()}`;
}

function getFromCache(text, targetLang, sourceLang = 'auto') {
  const key = getCacheKey(text, targetLang, sourceLang);
  return translationWarmCache.get(key) || null;
}

function setToCache(text, targetLang, translated, sourceLang = 'auto') {
  if (!text || !translated) return;
  if (translationWarmCache.size >= MAX_TRANSLATION_CACHE) {
    const oldest = translationWarmCache.keys().next().value;
    translationWarmCache.delete(oldest);
  }
  const key = getCacheKey(text, targetLang, sourceLang);
  translationWarmCache.set(key, translated);
}

// Single text translation via Google Translate client endpoint
async function translateWithGoogle(text, targetLang, sourceLang = 'auto') {
  const clean = text.trim();
  if (!clean) return clean;

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sourceLang)}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(clean)}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      'Accept': '*/*',
    },
  });

  if (!res.ok) {
    throw new Error(`Google translate returned status ${res.status}`);
  }

  const data = await res.json();
  if (Array.isArray(data) && Array.isArray(data[0])) {
    const translated = data[0].map((item) => (item && item[0]) || '').join('');
    return translated || clean;
  }

  return clean;
}

// Fallback translation via MyMemory API
async function translateWithMyMemory(text, targetLang, sourceLang = 'auto') {
  const clean = text.trim();
  if (!clean) return clean;

  const src = sourceLang === 'auto' ? 'en' : sourceLang;
  const langpair = `${src}|${targetLang}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=${encodeURIComponent(langpair)}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`MyMemory returned status ${res.status}`);
  }

  const data = await res.json();
  if (data?.responseData?.translatedText) {
    return data.responseData.translatedText;
  }

  return clean;
}

async function translateSingle(text, targetLang, sourceLang = 'auto') {
  const clean = text?.trim();
  if (!clean) return text;

  // Check cache first
  const cached = getFromCache(clean, targetLang, sourceLang);
  if (cached) return cached;

  // 1. Try Google Translate gtx
  try {
    const result = await translateWithGoogle(clean, targetLang, sourceLang);
    if (result && result !== clean) {
      setToCache(clean, targetLang, result, sourceLang);
      return result;
    }
  } catch (err) {}

  // 2. Try MyMemory fallback
  try {
    const result = await translateWithMyMemory(clean, targetLang, sourceLang);
    if (result && result !== clean) {
      setToCache(clean, targetLang, result, sourceLang);
      return result;
    }
  } catch (err) {}

  return text;
}

export default async function handler(req, res) {
  // CORS support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query?.action || 'likes';
  const method = req.method;

  let body = {};
  if (typeof req.body === 'string') {
    try {
      body = JSON.parse(req.body);
    } catch {}
  } else {
    body = req.body || {};
  }

  // ==========================================
  // 1. LIKES HANDLER
  // ==========================================
  if (action === 'likes') {
    if (method === 'GET') {
      const articleId = (req.query?.articleId || '').trim();
      const userId = (req.query?.userId || '').trim();

      if (!articleId) {
        return res.status(400).json({ error: 'articleId required' });
      }

      try {
        const [countRes, likedRes] = await Promise.all([
          supabase.from('article_likes').select('id', { count: 'exact', head: true }).eq('article_id', articleId),
          userId ? supabase.from('article_likes').select('id').eq('article_id', articleId).eq('user_id', userId).maybeSingle() : Promise.resolve({ data: null }),
        ]);

        if (userId) {
          res.setHeader('Cache-Control', 'private, no-cache');
        } else {
          res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
        }

        return res.status(200).json({
          hasLiked: !!likedRes?.data,
          likeCount: countRes?.count || 0,
        });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    if (method === 'POST') {
      const articleId = (body.articleId || '').trim();
      const userId = (body.userId || '').trim();

      if (!articleId || !userId) {
        return res.status(400).json({ error: 'articleId and userId required' });
      }

      try {
        const { data: existing } = await supabase
          .from('article_likes')
          .select('id')
          .eq('article_id', articleId)
          .eq('user_id', userId)
          .maybeSingle();

        let hasLiked = false;
        if (existing) {
          await supabase.from('article_likes').delete().eq('id', existing.id);
          hasLiked = false;
        } else {
          await supabase.from('article_likes').insert({ article_id: articleId, user_id: userId });
          hasLiked = true;
        }

        const { count } = await supabase
          .from('article_likes')
          .select('id', { count: 'exact', head: true })
          .eq('article_id', articleId);

        const today = new Date().toISOString().split('T')[0];
        await supabase.rpc('increment_article_metric', {
          p_article_id: articleId,
          p_date: today,
          p_views: 0,
          p_likes: hasLiked ? 1 : 0,
          p_shares: 0,
          p_comments: 0,
        }).catch(() => {});

        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ hasLiked, likeCount: count || 0 });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }
  }

  // ==========================================
  // 2. COMMENTS HANDLER
  // ==========================================
  if (action === 'comments') {
    if (method === 'GET') {
      const articleId = (req.query?.articleId || '').trim();
      if (!articleId) {
        return res.status(400).json({ error: 'articleId required' });
      }

      try {
        const { data, error } = await supabase
          .from('comments')
          .select('id, article_id, author_name, parent_id, body, status, created_at')
          .eq('article_id', articleId)
          .eq('status', 'approved')
          .order('created_at', { ascending: true })
          .limit(100);

        if (error) {
          return res.status(500).json({ error: error.message });
        }

        res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=300');
        return res.status(200).json({ comments: data || [] });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    if (method === 'POST') {
      const { articleId, authorName, authorEmail, body: commentBody, parentId } = body;

      if (!articleId || !authorName?.trim() || !authorEmail?.trim() || !commentBody?.trim()) {
        return res.status(400).json({ error: 'articleId, authorName, authorEmail, and body are required' });
      }

      try {
        const { data, error } = await supabase
          .from('comments')
          .insert({
            article_id: articleId,
            author_name: authorName.trim().slice(0, 100),
            author_email: authorEmail.trim().slice(0, 120),
            body: commentBody.trim().slice(0, 2000),
            parent_id: parentId || null,
            status: 'pending',
          })
          .select()
          .single();

        if (error) {
          return res.status(500).json({ error: error.message });
        }

        res.setHeader('Cache-Control', 'no-store');
        return res.status(201).json({
          comment: data,
          message: 'Your comment has been submitted and is pending moderation by the editorial desk.'
        });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }
  }

  // ==========================================
  // 3. SUBSCRIBE HANDLER
  // ==========================================
  if (action === 'subscribe') {
    if (method === 'POST') {
      const email = (body.email || '').trim().toLowerCase();
      const topics = Array.isArray(body.topics) ? body.topics : ['daily_morning'];

      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email address required' });
      }

      try {
        let subscriberId;
        const { data: existing } = await supabase
          .from('subscribers')
          .select('id, status')
          .eq('email', email)
          .maybeSingle();

        if (existing) {
          subscriberId = existing.id;
          if (existing.status === 'unsubscribed') {
            await supabase
              .from('subscribers')
              .update({ status: 'confirmed', confirmed_at: new Date().toISOString(), unsubscribed_at: null })
              .eq('id', subscriberId);
          }
        } else {
          const { data: inserted, error: insertError } = await supabase
            .from('subscribers')
            .insert({
              email,
              status: 'confirmed',
              confirmed_at: new Date().toISOString(),
            })
            .select('id')
            .single();

          if (insertError) {
            return res.status(500).json({ error: insertError.message });
          }
          subscriberId = inserted.id;
        }

        await supabase.from('subscriber_preferences').delete().eq('subscriber_id', subscriberId);
        const preferenceRows = topics.map(t => ({
          subscriber_id: subscriberId,
          topic: t,
          is_active: true,
        }));
        await supabase.from('subscriber_preferences').insert(preferenceRows);

        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({
          success: true,
          message: 'Successfully subscribed to NP News Metro briefings.',
          subscriberId,
        });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }
  }

  // ==========================================
  // 4. ADS HANDLER
  // ==========================================
  if (action === 'ads') {
    if (method === 'GET') {
      const zone = (req.query?.zone || '').trim();
      if (!zone) {
        return res.status(400).json({ error: 'zone required' });
      }

      const cached = adWarmCache.get(zone);
      if (cached && Date.now() - cached.timestamp < AD_CACHE_TTL) {
        res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400');
        return res.status(200).json({ placement: cached.data });
      }

      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('ad_placements')
          .select(`
            id, zone, campaign_id,
            campaigns (
              id, name, start_at, end_at, status,
              advertisers (name),
              ad_creatives (id, type, headline, destination_url, alt_text, media_id, media(public_url))
            )
          `)
          .eq('zone', zone)
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();

        if (error || !data || !data.campaigns) {
          adWarmCache.set(zone, { data: null, timestamp: Date.now() });
          res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400');
          return res.status(200).json({ placement: null });
        }

        const campaign = data.campaigns;
        if (campaign.status !== 'active' || (campaign.start_at && campaign.start_at > now) || (campaign.end_at && campaign.end_at < now)) {
          adWarmCache.set(zone, { data: null, timestamp: Date.now() });
          res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400');
          return res.status(200).json({ placement: null });
        }

        const creative = Array.isArray(campaign.ad_creatives) && campaign.ad_creatives.length > 0
          ? campaign.ad_creatives[0]
          : null;

        if (!creative) {
          adWarmCache.set(zone, { data: null, timestamp: Date.now() });
          res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400');
          return res.status(200).json({ placement: null });
        }

        const payload = {
          campaignId: campaign.id,
          placementId: data.id,
          advertiserName: campaign.advertisers?.name || 'Direct Advertiser',
          advertiser: campaign.advertisers?.name || 'Direct Advertiser',
          creativeText: creative.headline || campaign.name,
          destinationUrl: creative.destination_url,
          mediaUrl: creative.media?.public_url || null,
          altText: creative.alt_text,
          creative: {
            id: creative.id,
            type: creative.type,
            headline: creative.headline,
            destinationUrl: creative.destination_url,
            imageUrl: creative.media?.public_url || null,
            altText: creative.alt_text,
          }
        };

        adWarmCache.set(zone, { data: payload, timestamp: Date.now() });
        res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400');
        return res.status(200).json({ placement: payload });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    if (method === 'POST') {
      const { campaignId, placementId, type } = body;
      if (!campaignId) {
        return res.status(400).json({ error: 'campaignId required' });
      }

      try {
        const today = new Date().toISOString().split('T')[0];
        const isClick = type === 'click';

        await supabase.rpc('increment_ad_metric', {
          p_campaign_id: campaignId,
          p_placement_id: placementId || null,
          p_date: today,
          p_impressions: isClick ? 0 : 1,
          p_clicks: isClick ? 1 : 0,
        });

        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ success: true, recorded: type || 'impression' });
      } catch (err) {
        return res.status(200).json({ success: false, error: err.message });
      }
    }
  }

  // ==========================================
  // 5. METRICS HANDLER
  // ==========================================
  if (action === 'metrics') {
    if (method === 'POST') {
      const articleId = (body.articleId || '').trim();
      const type = body.type || 'view';

      if (!articleId) {
        return res.status(400).json({ error: 'articleId required' });
      }

      try {
        const today = new Date().toISOString().split('T')[0];
        const isShare = type === 'share';

        await supabase.rpc('increment_article_metric', {
          p_article_id: articleId,
          p_date: today,
          p_views: isShare ? 0 : 1,
          p_shares: isShare ? 1 : 0,
          p_likes: 0,
          p_comments: 0,
        });

        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ success: true, recorded: type });
      } catch (err) {
        return res.status(200).json({ success: false, error: err.message });
      }
    }
  }

  // ==========================================
  // 6. TRANSLATE HANDLER (Dynamic Multilingual)
  // ==========================================
  if (action === 'translate') {
    const payload = {
      ...(req.query || {}),
      ...body,
    };
    const { text, texts, targetLang, sourceLang = 'auto' } = payload;

    if (!targetLang) {
      return res.status(400).json({ error: 'Missing targetLang parameter' });
    }

    try {
      // Batch translation
      if (Array.isArray(texts)) {
        const results = await Promise.all(
          texts.map(async (t) => {
            if (typeof t !== 'string' || !t.trim()) return t;
            return translateSingle(t, targetLang, sourceLang);
          })
        );
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
        return res.status(200).json({ translations: results, targetLang, sourceLang });
      }

      // Single translation
      if (typeof text === 'string') {
        const result = await translateSingle(text, targetLang, sourceLang);
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
        return res.status(200).json({ translation: result, targetLang, sourceLang });
      }

      return res.status(400).json({ error: 'Missing text or texts in request body' });
    } catch (err) {
      console.error('Translation error in engagement handler:', err);
      return res.status(200).json({
        translation: text || '',
        translations: Array.isArray(texts) ? texts : [],
        fallback: true,
        error: err?.message || 'Translation failed',
      });
    }
  }

  return res.status(400).json({ error: `Unknown action: ${action}` });
}
