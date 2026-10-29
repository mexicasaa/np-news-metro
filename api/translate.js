// @ts-nocheck
import './_suppressWarnings.js';

// In-memory warm RAM cache for translation (strictly NON-database)
const warmCache = new Map();
const MAX_CACHE_SIZE = 5000;

function getCacheKey(text, targetLang, sourceLang = 'auto') {
  return `${sourceLang}:${targetLang}:${text.trim()}`;
}

function getFromCache(text, targetLang, sourceLang = 'auto') {
  const key = getCacheKey(text, targetLang, sourceLang);
  return warmCache.get(key) || null;
}

function setToCache(text, targetLang, translated, sourceLang = 'auto') {
  if (!text || !translated) return;
  if (warmCache.size >= MAX_CACHE_SIZE) {
    const oldest = warmCache.keys().next().value;
    warmCache.delete(oldest);
  }
  const key = getCacheKey(text, targetLang, sourceLang);
  warmCache.set(key, translated);
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

// Translate a single string with caching and fallbacks
export async function translateSingle(text, targetLang, sourceLang = 'auto') {
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
  } catch (err) {
    // try fallback
  }

  // 2. Try MyMemory fallback
  try {
    const result = await translateWithMyMemory(clean, targetLang, sourceLang);
    if (result && result !== clean) {
      setToCache(clean, targetLang, result, sourceLang);
      return result;
    }
  } catch (err) {
    // fallback to original
  }

  // Fallback: return original text without breaking
  return text;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      return res.status(200).end();
    }
    res.statusCode = 200;
    return res.end();
  }

  const sendJson = (statusCode, data) => {
    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(statusCode).json(data);
    }
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify(data));
  };

  try {
    let body = {};
    if (req.method === 'POST') {
      body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    } else {
      let queryParams = {};
      try {
        const parsedUrl = new URL(req.url || '', 'https://www.npnewsmetro.com');
        queryParams = Object.fromEntries(parsedUrl.searchParams.entries());
      } catch (e) {}
      body = { ...queryParams, ...(req.query || {}) };
    }

    const { text, texts, targetLang, sourceLang = 'auto' } = body;

    if (!targetLang) {
      return sendJson(400, { error: 'Missing targetLang parameter' });
    }

    // Batch translation
    if (Array.isArray(texts)) {
      const results = await Promise.all(
        texts.map(async (t) => {
          if (typeof t !== 'string' || !t.trim()) return t;
          return translateSingle(t, targetLang, sourceLang);
        })
      );
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
      return sendJson(200, { translations: results, targetLang, sourceLang });
    }

    // Single translation
    if (typeof text === 'string') {
      const result = await translateSingle(text, targetLang, sourceLang);
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
      return sendJson(200, { translation: result, targetLang, sourceLang });
    }

    return sendJson(400, { error: 'Missing text or texts in request body' });
  } catch (err) {
    console.error('Translation handler error:', err);
    // Return original input as fallback so nothing breaks
    return sendJson(200, {
      translation: req.body?.text || '',
      translations: Array.isArray(req.body?.texts) ? req.body.texts : [],
      fallback: true,
      error: err?.message || 'Translation failed',
    });
  }
}
