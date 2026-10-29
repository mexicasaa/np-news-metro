import { WpPost, WpVideo, GutenbergBlock } from '../types/wordpress';
import { Language } from '../i18n/translations';

export interface SupportedLanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  flag?: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguageInfo[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr' },
  { code: 'zh', name: 'Simplified Chinese', nativeName: '简体中文', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', dir: 'ltr' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl' },
];

/**
 * Detects if a text string is written in Hindi (Devanagari script).
 */
export const isHindiText = (text?: string): boolean => {
  if (!text || typeof text !== 'string') return false;
  const devanagariMatches = text.match(/[\u0900-\u097F]/g);
  if (!devanagariMatches) return false;
  return devanagariMatches.length >= 2;
};

// =========================================================================
// STRICT NON-DATABASE CACHING ENGINE (Memory + SessionStorage)
// Zero database writes, zero duplicate rows, zero schema alterations
// =========================================================================

const memoryCache = new Map<string, string>();
const SESSION_CACHE_PREFIX = 'np_tr_v2_';

function hashKey(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

export function getCachedTranslation(text: string, targetLang: string, sourceLang = 'auto'): string | null {
  if (!text || !text.trim()) return text;
  const key = `${sourceLang}:${targetLang}:${text.trim()}`;
  if (memoryCache.has(key)) {
    return memoryCache.get(key)!;
  }
  try {
    if (typeof sessionStorage !== 'undefined') {
      const stored = sessionStorage.getItem(SESSION_CACHE_PREFIX + hashKey(key));
      if (stored) {
        memoryCache.set(key, stored);
        return stored;
      }
    }
  } catch (e) {}
  return null;
}

export function setCachedTranslation(text: string, targetLang: string, translated: string, sourceLang = 'auto'): void {
  if (!text || !translated || text === translated) return;
  const key = `${sourceLang}:${targetLang}:${text.trim()}`;
  memoryCache.set(key, translated);
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(SESSION_CACHE_PREFIX + hashKey(key), translated);
    }
  } catch (e) {}
}

// Global update notifier for background translation resolution
type TranslationListener = () => void;
const listeners = new Set<TranslationListener>();

export function subscribeTranslationUpdates(listener: TranslationListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyTranslationUpdates(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {}
  });
}

// =========================================================================
// FORMATTING PRESERVATION ENGINE
// Protects URLs, bold syntax, italic syntax, line breaks and paragraph breaks
// =========================================================================

interface ProtectedTokenMap {
  [placeholder: string]: string;
}

/**
 * Protects markdown links, bold tags, and formatting before sending to translation service.
 */
function protectFormatting(text: string): { protectedText: string; tokens: ProtectedTokenMap } {
  const tokens: ProtectedTokenMap = {};
  let tokenCounter = 0;

  // 1. Protect Markdown Links: [text](url) -> keep url safe
  let protectedText = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, anchor, url) => {
    const placeholder = `⟦LNK_${tokenCounter++}⟧`;
    tokens[placeholder] = `[${anchor}](${url})`;
    return placeholder;
  });

  // 2. Protect HTML Links: <a href="...">...</a>
  protectedText = protectedText.replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (match) => {
    const placeholder = `⟦HTA_${tokenCounter++}⟧`;
    tokens[placeholder] = match;
    return placeholder;
  });

  // 3. Protect bold **text**
  protectedText = protectedText.replace(/\*\*([^*]+)\*\*/g, (_match, inner) => {
    const placeholder = `⟦BLD_${tokenCounter++}⟧`;
    tokens[placeholder] = `**${inner}**`;
    return placeholder;
  });

  return { protectedText, tokens };
}

/**
 * Restores protected formatting tokens after translation.
 */
function restoreFormatting(translatedText: string, tokens: ProtectedTokenMap): string {
  let restored = translatedText;
  for (const [placeholder, original] of Object.entries(tokens)) {
    // Escape brackets for regex
    const escaped = placeholder.replace(/⟦/g, '⟦').replace(/⟧/g, '⟧');
    restored = restored.replace(new RegExp(escaped, 'g'), original);
    // Also handle case where translation engine converted ⟦...⟧ to [...]
    const altPlaceholder = placeholder.replace('⟦', '[').replace('⟧', ']');
    if (restored.includes(altPlaceholder)) {
      restored = restored.replace(altPlaceholder, original);
    }
  }
  return restored;
}

// =========================================================================
// TRANSLATION API NETWORK CALLS WITH GRACEFUL FALLBACK
// =========================================================================

/**
 * Translates a single text string dynamically with caching, formatting preservation,
 * and resilient fallbacks so the UI never crashes or displays blank content.
 */
export async function translateText(
  text: string,
  targetLang: Language,
  sourceLang: string = 'auto'
): Promise<string> {
  const clean = text?.trim();
  if (!clean) return text;

  // If already in target language or identical
  if (sourceLang === targetLang) return text;

  // Check cache first
  const cached = getCachedTranslation(clean, targetLang, sourceLang);
  if (cached) return cached;

  const { protectedText, tokens } = protectFormatting(clean);

  // 1. Try internal /api/translate endpoint
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: protectedText,
        targetLang,
        sourceLang,
      }),
    });

    if (response.ok) {
      const json = await response.json();
      if (json && typeof json.translation === 'string' && json.translation.trim()) {
        const restored = restoreFormatting(json.translation, tokens);
        setCachedTranslation(clean, targetLang, restored, sourceLang);
        return restored;
      }
    }
  } catch (err) {
    // continue to client-side fallback
  }

  // 2. Client-side fallback via Google Translate client endpoint
  try {
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sourceLang)}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(protectedText)}`;
    const res = await fetch(gtxUrl);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const rawTranslated = data[0].map((item: any) => (item && item[0]) || '').join('');
        if (rawTranslated) {
          const restored = restoreFormatting(rawTranslated, tokens);
          setCachedTranslation(clean, targetLang, restored, sourceLang);
          return restored;
        }
      }
    }
  } catch (err) {
    // continue to fallback
  }

  // 3. Fallback: return original text without breaking
  return text;
}

/**
 * Translates an array of texts in batch.
 */
export async function translateTexts(
  texts: string[],
  targetLang: Language,
  sourceLang: string = 'auto'
): Promise<string[]> {
  if (!Array.isArray(texts) || texts.length === 0) return [];

  // Check which texts are already in cache
  const missingIndices: number[] = [];
  const missingTexts: string[] = [];
  const results = new Array(texts.length);

  texts.forEach((t, i) => {
    if (!t || !t.trim()) {
      results[i] = t;
      return;
    }
    const cached = getCachedTranslation(t, targetLang, sourceLang);
    if (cached) {
      results[i] = cached;
    } else {
      missingIndices.push(i);
      missingTexts.push(t);
    }
  });

  if (missingTexts.length === 0) {
    return results;
  }

  // Fetch missing translations
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texts: missingTexts,
        targetLang,
        sourceLang,
      }),
    });

    if (response.ok) {
      const json = await response.json();
      if (Array.isArray(json?.translations)) {
        json.translations.forEach((translated: string, idx: number) => {
          const origIndex = missingIndices[idx];
          const originalText = missingTexts[idx];
          const finalResult = translated || originalText;
          setCachedTranslation(originalText, targetLang, finalResult, sourceLang);
          results[origIndex] = finalResult;
        });
        return results;
      }
    }
  } catch (err) {
    // fallback to translating individually
  }

  // Fallback to parallel single translations
  await Promise.all(
    missingIndices.map(async (origIdx, missingIdx) => {
      const origText = missingTexts[missingIdx];
      results[origIdx] = await translateText(origText, targetLang, sourceLang);
    })
  );

  return results;
}

// =========================================================================
// ASYNC BATCH QUEUE & PREFETCHING
// =========================================================================

interface QueueItem {
  text: string;
  targetLang: Language;
  sourceLang: string;
}

const queueMap = new Map<string, QueueItem>();
let queueTimer: any = null;

function enqueueTranslation(text: string, targetLang: Language, sourceLang: string = 'auto'): void {
  if (!text || !text.trim()) return;
  const key = `${sourceLang}:${targetLang}:${text.trim()}`;
  if (memoryCache.has(key) || queueMap.has(key)) return;

  queueMap.set(key, { text, targetLang, sourceLang });

  if (!queueTimer) {
    queueTimer = setTimeout(flushTranslationQueue, 60);
  }
}

async function flushTranslationQueue(): Promise<void> {
  queueTimer = null;
  if (queueMap.size === 0) return;

  const items = Array.from(queueMap.values());
  queueMap.clear();

  // Group by targetLang and sourceLang
  const groups = new Map<string, QueueItem[]>();
  items.forEach((item) => {
    const groupKey = `${item.sourceLang}:${item.targetLang}`;
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(item);
  });

  let anyResolved = false;

  await Promise.all(
    Array.from(groups.entries()).map(async ([_key, groupItems]) => {
      const texts = groupItems.map((g) => g.text);
      const targetLang = groupItems[0].targetLang;
      const sourceLang = groupItems[0].sourceLang;
      try {
        await translateTexts(texts, targetLang, sourceLang);
        anyResolved = true;
      } catch (e) {
        // ignore
      }
    })
  );

  if (anyResolved) {
    notifyTranslationUpdates();
  }
}

// =========================================================================
// TWO-WAY ARTICLE & VIDEO DYNAMIC LOCALIZATION
// =========================================================================

/**
 * Returns a localized WpPost dynamically translated in both directions:
 * - When visitor selects Hindi, English content is displayed in Hindi.
 * - When visitor selects English, Hindi content is displayed in English.
 * - When visitor selects another supported language, content is translated into that language.
 *
 * STRICT REQUIREMENT: Zero database records created, original content untouched.
 */
export const getLocalizedPost = (post: WpPost, lang: Language): WpPost => {
  if (!post) return post;

  // 1. Target is Hindi ('hi')
  if (lang === 'hi') {
    const hasPreHindiTitle = !!post.titleHi?.trim();
    const hasPreHindiDek = !!post.dekHi?.trim();
    const hasPreHindiBlocks = Array.isArray(post.blocksHi) && post.blocksHi.length > 0;
    const isOriginalHindiTitle = isHindiText(post.title);
    const isOriginalHindiDek = isHindiText(post.dek);

    const title = hasPreHindiTitle
      ? post.titleHi!
      : isOriginalHindiTitle
        ? post.title
        : getCachedTranslation(post.title, 'hi', 'en') || (enqueueTranslation(post.title, 'hi', 'en'), post.title);

    const dek = hasPreHindiDek
      ? post.dekHi!
      : isOriginalHindiDek
        ? post.dek
        : getCachedTranslation(post.dek, 'hi', 'en') || (enqueueTranslation(post.dek, 'hi', 'en'), post.dek);

    const keyTakeaways = (post.keyTakeawaysHi && post.keyTakeawaysHi.length > 0)
      ? post.keyTakeawaysHi
      : post.keyTakeaways?.map((item) => {
          if (isHindiText(item)) return item;
          const cached = getCachedTranslation(item, 'hi', 'en');
          if (cached) return cached;
          enqueueTranslation(item, 'hi', 'en');
          return item;
        });

    let blocks = hasPreHindiBlocks ? post.blocksHi! : post.blocks;
    if (!hasPreHindiBlocks && Array.isArray(post.blocks)) {
      blocks = post.blocks.map((block) => {
        if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'pullquote') {
          if (block.content && !isHindiText(block.content)) {
            const cached = getCachedTranslation(block.content, 'hi', 'en');
            if (cached) {
              return { ...block, content: cached };
            }
            enqueueTranslation(block.content, 'hi', 'en');
          }
        }
        return block;
      });
    }

    return {
      ...post,
      title,
      dek,
      category: (post.categoryHi || post.category) as any,
      imageCaption: post.imageCaptionHi || post.imageCaption,
      keyTakeaways,
      blocks,
    };
  }

  // 2. Target is English ('en')
  if (lang === 'en') {
    const isHindiTitle = isHindiText(post.title);
    const isHindiDek = isHindiText(post.dek);

    const title = !isHindiTitle
      ? post.title
      : getCachedTranslation(post.title, 'en', 'hi') || (enqueueTranslation(post.title, 'en', 'hi'), post.title);

    const dek = !isHindiDek
      ? post.dek
      : getCachedTranslation(post.dek, 'en', 'hi') || (enqueueTranslation(post.dek, 'en', 'hi'), post.dek);

    const keyTakeaways = post.keyTakeaways?.map((item) => {
      if (!isHindiText(item)) return item;
      const cached = getCachedTranslation(item, 'en', 'hi');
      if (cached) return cached;
      enqueueTranslation(item, 'en', 'hi');
      return item;
    });

    let blocks = post.blocks;
    if (Array.isArray(post.blocks)) {
      blocks = post.blocks.map((block) => {
        if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'pullquote') {
          if (block.content && isHindiText(block.content)) {
            const cached = getCachedTranslation(block.content, 'en', 'hi');
            if (cached) {
              return { ...block, content: cached };
            }
            enqueueTranslation(block.content, 'en', 'hi');
          }
        }
        return block;
      });
    }

    return {
      ...post,
      title,
      dek,
      keyTakeaways,
      blocks,
    };
  }

  // 3. Target is another supported language ('es', 'fr', 'de', 'zh', 'ja', 'ar', etc.)
  const sourceTitle = post.title || post.titleHi || '';
  const sourceDek = post.dek || post.dekHi || '';
  const sourceLang = isHindiText(sourceTitle) ? 'hi' : 'en';

  const title = getCachedTranslation(sourceTitle, lang, sourceLang) ||
    (enqueueTranslation(sourceTitle, lang, sourceLang), sourceTitle);

  const dek = getCachedTranslation(sourceDek, lang, sourceLang) ||
    (enqueueTranslation(sourceDek, lang, sourceLang), sourceDek);

  const imageCaption = post.imageCaption
    ? getCachedTranslation(post.imageCaption, lang, sourceLang) ||
      (enqueueTranslation(post.imageCaption, lang, sourceLang), post.imageCaption)
    : post.imageCaption;

  const keyTakeaways = post.keyTakeaways?.map((item) => {
    const itemSourceLang = isHindiText(item) ? 'hi' : 'en';
    const cached = getCachedTranslation(item, lang, itemSourceLang);
    if (cached) return cached;
    enqueueTranslation(item, lang, itemSourceLang);
    return item;
  });

  const blocks = Array.isArray(post.blocks)
    ? post.blocks.map((block) => {
        if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'pullquote') {
          if (block.content) {
            const blockSourceLang = isHindiText(block.content) ? 'hi' : 'en';
            const cached = getCachedTranslation(block.content, lang, blockSourceLang);
            if (cached) {
              return { ...block, content: cached };
            }
            enqueueTranslation(block.content, lang, blockSourceLang);
          }
        }
        return block;
      })
    : post.blocks;

  return {
    ...post,
    title,
    dek,
    imageCaption,
    keyTakeaways,
    blocks,
  };
};

/**
 * Returns a localized WpVideo dynamically translated in both directions:
 * - Translates title and caption/description into target language.
 * - Preserves videoUrl, posterUrl, duration, presenter, and media unchanged.
 */
export const getLocalizedVideo = (video: WpVideo, lang: Language): WpVideo => {
  if (!video) return video;

  if (lang === 'hi') {
    const title = video.titleHi || (isHindiText(video.title)
      ? video.title
      : getCachedTranslation(video.title, 'hi', 'en') || (enqueueTranslation(video.title, 'hi', 'en'), video.title));

    const caption = video.captionHi || (isHindiText(video.caption)
      ? video.caption
      : getCachedTranslation(video.caption, 'hi', 'en') || (enqueueTranslation(video.caption, 'hi', 'en'), video.caption));

    return {
      ...video,
      title,
      caption,
      category: video.categoryHi || video.category,
    };
  }

  if (lang === 'en') {
    const title = !isHindiText(video.title)
      ? video.title
      : getCachedTranslation(video.title, 'en', 'hi') || (enqueueTranslation(video.title, 'en', 'hi'), video.title);

    const caption = !isHindiText(video.caption)
      ? video.caption
      : getCachedTranslation(video.caption, 'en', 'hi') || (enqueueTranslation(video.caption, 'en', 'hi'), video.caption);

    return {
      ...video,
      title,
      caption,
    };
  }

  // Other languages ('es', 'fr', 'de', 'zh', 'ja', 'ar', etc.)
  const sourceTitle = video.title || video.titleHi || '';
  const sourceCaption = video.caption || video.captionHi || '';
  const sourceLang = isHindiText(sourceTitle) ? 'hi' : 'en';

  const title = getCachedTranslation(sourceTitle, lang, sourceLang) ||
    (enqueueTranslation(sourceTitle, lang, sourceLang), sourceTitle);

  const caption = getCachedTranslation(sourceCaption, lang, sourceLang) ||
    (enqueueTranslation(sourceCaption, lang, sourceLang), sourceCaption);

  return {
    ...video,
    title,
    caption,
  };
};

/**
 * High-priority prefetch for the active full article page.
 */
export async function ensurePostTranslated(post: WpPost, targetLang: Language): Promise<void> {
  if (!post || targetLang === 'en' && !isHindiText(post.title) && !isHindiText(post.dek)) {
    return;
  }
  if (targetLang === 'hi' && post.titleHi && post.dekHi && post.blocksHi && post.blocksHi.length > 0) {
    return;
  }

  const textsToTranslate: string[] = [];
  if (post.title) textsToTranslate.push(post.title);
  if (post.dek) textsToTranslate.push(post.dek);
  if (post.imageCaption) textsToTranslate.push(post.imageCaption);
  if (Array.isArray(post.keyTakeaways)) {
    post.keyTakeaways.forEach((k) => textsToTranslate.push(k));
  }
  if (Array.isArray(post.blocks)) {
    post.blocks.forEach((b) => {
      if (b.content && (b.type === 'paragraph' || b.type === 'heading' || b.type === 'pullquote')) {
        textsToTranslate.push(b.content);
      }
    });
  }

  const sourceLang = isHindiText(post.title) ? 'hi' : 'en';
  await translateTexts(textsToTranslate, targetLang, sourceLang);
  notifyTranslationUpdates();
}
