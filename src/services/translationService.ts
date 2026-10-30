import { WpPost, WpVideo, WpAuthor, GutenbergBlock } from '../types/wordpress';
import { Language } from '../i18n/translations';
import { mockAuthors } from '../data/mockWpData';

export interface SupportedLanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: SupportedLanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
];

/**
 * Checks whether a string contains Devanagari (Hindi) script characters.
 */
export function isHindiText(text?: string | null): boolean {
  if (!text) return false;
  return /[\u0900-\u097F]/.test(text);
}

// =========================================================================
// NON-DATABASE CACHING SYSTEM (Memory + SessionStorage only)
// STRICT REQUIREMENT: No database tables, no schema changes, no DB caching.
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

function getEffectiveCacheKey(text: string, targetLang: string, sourceLang = 'auto'): string {
  const clean = text.trim();
  const src = sourceLang === 'auto' ? (targetLang === 'hi' ? 'en' : 'hi') : sourceLang;
  return `${src}:${targetLang}:${clean}`;
}

export function getCachedTranslation(text: string, targetLang: string, sourceLang = 'auto'): string | null {
  if (!text || !text.trim()) return text;
  const key = getEffectiveCacheKey(text, targetLang, sourceLang);
  if (memoryCache.has(key)) {
    return memoryCache.get(key)!;
  }
  const autoKey = `auto:${targetLang}:${text.trim()}`;
  if (memoryCache.has(autoKey)) {
    return memoryCache.get(autoKey)!;
  }
  try {
    if (typeof sessionStorage !== 'undefined') {
      const stored = sessionStorage.getItem(SESSION_CACHE_PREFIX + hashKey(key)) ||
                     sessionStorage.getItem(SESSION_CACHE_PREFIX + hashKey(autoKey));
      if (stored) {
        memoryCache.set(key, stored);
        return stored;
      }
    }
  } catch (e) {}
  return null;
}

export function setCachedTranslation(text: string, targetLang: string, translated: string, sourceLang = 'auto'): void {
  if (!text || !translated || text.trim() === translated.trim()) return;
  // Safety: Never cache failure into wrong language
  if (targetLang === 'hi' && !isHindiText(translated)) return;
  if (targetLang === 'en' && isHindiText(translated)) return;

  const key = getEffectiveCacheKey(text, targetLang, sourceLang);
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
// PRE-DEFINED INSTANT DICTIONARY FOR KNOWN AUTHORS & EDITORIAL DESKS
// =========================================================================

const AUTHOR_TRANSLATIONS: Record<string, string> = {
  // English -> Hindi
  'Umang Pandey': 'उमंग पाण्डेय',
  'Dr. Neelima Pandey': 'डॉ. नीलिमा पाण्डेय',
  'Diwan Chand Arya (D. C. Arya)': 'दीवान चंद आर्य (डी. सी. आर्य)',
  'Diwan Chand Arya': 'दीवान चंद आर्य',
  'Raj Kumar Agarwal': 'राज कुमार अग्रवाल',
  'Pt. Krishna Nand Shastri (Advocate)': 'पं. कृष्ण नंद शास्त्री (अधिवक्ता)',
  'Pt. Krishna Nand Shastri': 'पं. कृष्ण नंद शास्त्री',
  'Bholeshwar Upmanyu': 'भोलेश्वर उपमन्यु',
  'Neeraj Pandey': 'नीरज पाण्डेय',
  'NP News Metro Bureau': 'एनपी न्यूज़ मेट्रो ब्यूरो',
  'NP News Desk': 'एनपी न्यूज़ डेस्क',
  'NP Bureau': 'एनपी ब्यूरो',
  'Editorial Desk': 'संपादकीय डेस्क',
  'Staff Reporter': 'स्टाफ रिपोर्टर',
  'Staff Journalist & Reporter': 'विशेष संवाददाता एवं पत्रकार',
  'Guest Contributor': 'अतिथि लेखक',
  'Guest Contributor / Wire Reporter': 'अतिथि लेखक / विशेष संवाददाता',
  'Founder & Chief Technology Officer (CTO)': 'संस्थापक एवं मुख्य प्रौद्योगिकी अधिकारी (CTO)',
  'Chief Mentor & Advisor (Educator, Literary Scholar & Poet)': 'मार्गदर्शक (शिक्षिका, साहित्यकार एवं कवयित्री)',
  'Advisory Board Member': 'सलाहकार मंडल सदस्य',
  'Financial and Law Advisory Board Member': 'वित्तीय एवं विधि सलाहकार मंडल सदस्य',

  // Hindi -> English
  'उमंग पाण्डेय': 'Umang Pandey',
  'डॉ. नीलिमा पाण्डेय': 'Dr. Neelima Pandey',
  'दीवान चंद आर्य (डी. सी. आर्य)': 'Diwan Chand Arya (D. C. Arya)',
  'दीवान चंद आर्य': 'Diwan Chand Arya',
  'राज कुमार अग्रवाल': 'Raj Kumar Agarwal',
  'पं. कृष्ण नंद शास्त्री (अधिवक्ता)': 'Pt. Krishna Nand Shastri (Advocate)',
  'पं. कृष्ण नंद शास्त्री': 'Pt. Krishna Nand Shastri',
  'भोलेश्वर उपमन्यु': 'Bholeshwar Upmanyu',
  'नीरज पाण्डेय': 'Neeraj Pandey',
  'एनपी न्यूज़ मेट्रो ब्यूरो': 'NP News Metro Bureau',
  'एनपी न्यूज़ डेस्क': 'NP News Desk',
  'एनपी ब्यूरो': 'NP Bureau',
  'संपादकीय डेस्क': 'Editorial Desk',
  'स्टाफ रिपोर्टर': 'Staff Reporter',
  'विशेष संवाददाता एवं पत्रकार': 'Staff Journalist & Reporter',
  'अतिथि लेखक': 'Guest Contributor',
  'अतिथि लेखक / विशेष संवाददाता': 'Guest Contributor / Wire Reporter',
  'संस्थापक एवं मुख्य प्रौद्योगिकी अधिकारी (CTO)': 'Founder & Chief Technology Officer (CTO)',
  'मार्गदर्शक (शिक्षिका, साहित्यकार एवं कवयित्री)': 'Chief Mentor & Advisor (Educator, Literary Scholar & Poet)',
  'सलाहकार मंडल सदस्य': 'Advisory Board Member',
  'वित्तीय एवं विधि सलाहकार मंडल सदस्य': 'Financial and Law Advisory Board Member',
};

export const HINDI_CATEGORY_NAMES: Record<string, string> = {
  india: 'भारत',
  politics: 'राजनीति',
  business: 'व्यापार',
  economy: 'अर्थव्यवस्था',
  technology: 'तकनीक',
  world: 'विदेश',
  sports: 'खेल',
  entertainment: 'मनोरंजन',
  lifestyle: 'जीवनशैली',
  opinion: 'विचार',
  crime: 'अपराध एवं कानून',
  social: 'सामाजिक सरोकार',
  astrology: 'ज्योतिष',
  religion: 'धर्म एवं संस्कृति',
  videos: 'वीडियो',
  photos: 'फोटो',
  latest: 'ताज़ा ख़बरें',
  trending: 'ट्रेंडिंग',
};

export const ENGLISH_CATEGORY_NAMES: Record<string, string> = {
  india: 'India',
  politics: 'Politics',
  business: 'Business',
  economy: 'Economy',
  technology: 'Technology',
  world: 'World',
  sports: 'Sports',
  entertainment: 'Entertainment',
  lifestyle: 'Lifestyle',
  opinion: 'Opinion',
  crime: 'Crime & Legal',
  social: 'Social Issues',
  astrology: 'Astrology',
  religion: 'Religion & Culture',
  videos: 'Videos',
  photos: 'Photos',
  latest: 'Latest',
  trending: 'Trending',
};

// =========================================================================
// FORMATTING PRESERVATION ENGINE
// Protects markdown links, HTML links, and bold tokens
// =========================================================================

interface ProtectedTokenMap {
  [placeholder: string]: string;
}

function protectFormatting(text: string): { protectedText: string; tokens: ProtectedTokenMap } {
  const tokens: ProtectedTokenMap = {};
  let tokenCounter = 0;

  // 1. Protect Markdown Links: [text](url)
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

function restoreFormatting(translatedText: string, tokens: ProtectedTokenMap): string {
  let restored = translatedText;
  for (const [placeholder, original] of Object.entries(tokens)) {
    const escaped = placeholder.replace(/⟦/g, '⟦').replace(/⟧/g, '⟧');
    restored = restored.replace(new RegExp(escaped, 'g'), original);
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

export async function translateText(
  text: string,
  targetLang: Language,
  sourceLang: string = 'auto'
): Promise<string> {
  const clean = text?.trim();
  if (!clean) return text;

  if (sourceLang === targetLang) return text;

  // Check known author dictionary first
  if (AUTHOR_TRANSLATIONS[clean]) {
    return AUTHOR_TRANSLATIONS[clean];
  }

  // Check cache
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
  } catch (err) {}

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
  } catch (err) {}

  return text;
}

export async function translateTexts(
  texts: string[],
  targetLang: Language,
  sourceLang: string = 'auto'
): Promise<string[]> {
  if (!Array.isArray(texts) || texts.length === 0) return [];

  const missingIndices: number[] = [];
  const missingTexts: string[] = [];
  const results = new Array(texts.length);

  texts.forEach((t, i) => {
    if (!t || !t.trim()) {
      results[i] = t;
      return;
    }
    const clean = t.trim();
    if (AUTHOR_TRANSLATIONS[clean]) {
      results[i] = AUTHOR_TRANSLATIONS[clean];
      return;
    }
    const cached = getCachedTranslation(clean, targetLang, sourceLang);
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

  // Fetch missing translations via API
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
        const stillMissingIndices: number[] = [];
        const stillMissingTexts: string[] = [];

        json.translations.forEach((translated: string, idx: number) => {
          const origIndex = missingIndices[idx];
          const originalText = missingTexts[idx];
          const isTargetHindi = targetLang === 'hi';
          const isValid = isTargetHindi ? isHindiText(translated) : (!isHindiText(translated) && !!translated?.trim());

          if (isValid) {
            setCachedTranslation(originalText, targetLang, translated, sourceLang);
            results[origIndex] = translated;
          } else {
            stillMissingIndices.push(origIndex);
            stillMissingTexts.push(originalText);
          }
        });

        if (stillMissingIndices.length === 0) {
          return results;
        }

        // Try parallel client fallback for any that failed or came back untranslated
        await Promise.all(
          stillMissingIndices.map(async (origIdx, i) => {
            const origText = stillMissingTexts[i];
            results[origIdx] = await translateText(origText, targetLang, sourceLang);
          })
        );
        return results;
      }
    }
  } catch (err) {}

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
// ASYNC BATCH QUEUE
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
    queueTimer = setTimeout(flushTranslationQueue, 50);
  }
}

async function flushTranslationQueue(): Promise<void> {
  queueTimer = null;
  if (queueMap.size === 0) return;

  const items = Array.from(queueMap.values());
  queueMap.clear();

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
      } catch (e) {}
    })
  );

  if (anyResolved) {
    notifyTranslationUpdates();
  }
}

// =========================================================================
// TWO-WAY AUTHOR LOCALIZATION
// When English: name, role, bio in English
// When Hindi: name, role, bio in Hindi
// =========================================================================

export function getLocalizedAuthor(
  authorInput: WpAuthor | WpPost | Record<string, any> | null | undefined,
  targetLang: Language
): WpAuthor {
  const isTargetHindi = targetLang === 'hi';

  // 1. Extract base data from WpPost or WpAuthor
  let id = 'staff-author';
  let rawName = '';
  let rawNameHi = '';
  let rawRole = '';
  let rawRoleHi = '';
  let avatar = '/logo-circle.png';
  let rawBio = '';
  let rawBioHi = '';
  let verified = true;
  let beats: string[] = ['National News'];
  let social: Record<string, string> = {};
  let slug = 'author';

  if (authorInput) {
    // If input is WpPost
    if ('title' in authorInput || 'category' in authorInput) {
      const post = authorInput as WpPost;
      id = post.authorId || 'staff-author';
      const mock = id && mockAuthors[id] ? mockAuthors[id] : null;

      if (post.customAuthor?.name) {
        rawName = post.customAuthor.name;
        rawRole = post.customAuthor.role || 'Staff Reporter';
        avatar = post.customAuthor.avatar || avatar;
        rawBio = post.customAuthor.bio || '';
        verified = false;
        slug = 'author';
      } else if (mock) {
        rawName = mock.name;
        rawNameHi = mock.nameHi || '';
        rawRole = mock.role;
        rawRoleHi = mock.roleHi || '';
        avatar = mock.avatar;
        rawBio = mock.bio;
        rawBioHi = mock.bioHi || '';
        verified = mock.verified;
        beats = mock.beats;
        social = (mock.social as any) || {};
        slug = mock.slug;
      } else {
        rawName = (post as any).authorName || 'NP News Metro Bureau';
        rawRole = (post as any).authorRole || 'Editorial Desk';
        avatar = (post as any).authorAvatar || avatar;
      }
    } else {
      // Input is WpAuthor
      const a = authorInput as WpAuthor;
      id = a.id || 'staff-author';
      const mock = id && mockAuthors[id] ? mockAuthors[id] : null;

      rawName = a.name || (mock ? mock.name : 'NP News Metro Bureau');
      rawNameHi = a.nameHi || (mock ? mock.nameHi || '' : '');
      rawRole = a.role || (mock ? mock.role : 'Editorial Desk');
      rawRoleHi = a.roleHi || (mock ? mock.roleHi || '' : '');
      avatar = a.avatar || (mock ? mock.avatar : avatar);
      rawBio = a.bio || (mock ? mock.bio : '');
      rawBioHi = a.bioHi || (mock ? mock.bioHi || '' : '');
      verified = a.verified ?? (mock ? mock.verified : true);
      beats = a.beats || (mock ? mock.beats : ['National News']);
      social = (a.social as any) || (mock ? (mock.social as any) : {});
      slug = a.slug || (mock ? mock.slug : 'author');
    }
  }

  // 2. Localize to Target Language
  let name = rawName;
  let role = rawRole;
  let bio = rawBio;

  if (isTargetHindi) {
    // Target is Hindi:
    // Name
    if (rawNameHi && rawNameHi.trim()) {
      name = rawNameHi;
    } else if (AUTHOR_TRANSLATIONS[rawName]) {
      name = AUTHOR_TRANSLATIONS[rawName];
    } else if (!isHindiText(rawName)) {
      name = getCachedTranslation(rawName, 'hi', 'en') || (enqueueTranslation(rawName, 'hi', 'en'), rawName);
    } else {
      name = rawName;
    }

    // Role
    if (rawRoleHi && rawRoleHi.trim()) {
      role = rawRoleHi;
    } else if (AUTHOR_TRANSLATIONS[rawRole]) {
      role = AUTHOR_TRANSLATIONS[rawRole];
    } else if (!isHindiText(rawRole)) {
      role = getCachedTranslation(rawRole, 'hi', 'en') || (enqueueTranslation(rawRole, 'hi', 'en'), 'संपादकीय डेस्क');
    } else {
      role = rawRole;
    }

    // Bio
    if (rawBioHi && rawBioHi.trim()) {
      bio = rawBioHi;
    } else if (rawBio && !isHindiText(rawBio)) {
      bio = getCachedTranslation(rawBio, 'hi', 'en') || (enqueueTranslation(rawBio, 'hi', 'en'), rawBio);
    } else {
      bio = rawBio;
    }
  } else {
    // Target is English:
    // Name
    if (AUTHOR_TRANSLATIONS[rawName]) {
      name = AUTHOR_TRANSLATIONS[rawName];
    } else if (isHindiText(rawName)) {
      name = getCachedTranslation(rawName, 'en', 'hi') || (enqueueTranslation(rawName, 'en', 'hi'), rawName);
    } else {
      name = rawName;
    }

    // Role
    if (AUTHOR_TRANSLATIONS[rawRole]) {
      role = AUTHOR_TRANSLATIONS[rawRole];
    } else if (isHindiText(rawRole)) {
      role = getCachedTranslation(rawRole, 'en', 'hi') || (enqueueTranslation(rawRole, 'en', 'hi'), 'Editorial Desk');
    } else {
      role = rawRole;
    }

    // Bio
    if (rawBio && isHindiText(rawBio)) {
      bio = getCachedTranslation(rawBio, 'en', 'hi') || (enqueueTranslation(rawBio, 'en', 'hi'), rawBio);
    } else {
      bio = rawBio;
    }
  }

  return {
    id,
    name,
    nameHi: rawNameHi,
    slug,
    role,
    roleHi: rawRoleHi,
    avatar,
    bio,
    bioHi: rawBioHi,
    verified,
    beats,
    social: social as any,
  };
}

// =========================================================================
// TWO-WAY DYNAMIC ARTICLE LOCALIZATION (English & Hindi)
// =========================================================================

export const getLocalizedPost = (post: WpPost, lang: Language): WpPost => {
  if (!post) return post;

  const localizedAuthor = getLocalizedAuthor(post, lang);

  // 1. Target is Hindi ('hi')
  if (lang === 'hi') {
    const hasPreHindiTitle = !!post.titleHi?.trim() && isHindiText(post.titleHi);
    const hasPreHindiDek = !!post.dekHi?.trim() && isHindiText(post.dekHi);
    const hasPreHindiBlocks = Array.isArray(post.blocksHi) && post.blocksHi.length > 0 && post.blocksHi.some(b => b.content && isHindiText(b.content));
    const hasPreHindiTakeaways = Array.isArray(post.keyTakeawaysHi) && post.keyTakeawaysHi.length > 0 && post.keyTakeawaysHi.some(isHindiText);
    const hasPreHindiCaption = !!post.imageCaptionHi?.trim() && isHindiText(post.imageCaptionHi);
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

    const keyTakeaways = hasPreHindiTakeaways
      ? post.keyTakeawaysHi
      : post.keyTakeaways?.map((item) => {
          if (isHindiText(item)) return item;
          const cached = getCachedTranslation(item, 'hi', 'en');
          if (cached) return cached;
          enqueueTranslation(item, 'hi', 'en');
          return item;
        });

    let blocks = hasPreHindiBlocks ? post.blocksHi! : post.blocks;
    if (!hasPreHindiBlocks && Array.isArray(post.blocks) && post.blocks.length > 0) {
      blocks = post.blocks.map((block) => {
        let updatedBlock = block;
        if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'pullquote') {
          if (block.content && !isHindiText(block.content)) {
            const cached = getCachedTranslation(block.content, 'hi', 'en');
            if (cached) {
              updatedBlock = { ...updatedBlock, content: cached };
            } else {
              enqueueTranslation(block.content, 'hi', 'en');
            }
          }
        }
        if (Array.isArray(block.items)) {
          const translatedItems = block.items.map((item) => {
            if (!isHindiText(item)) {
              const cached = getCachedTranslation(item, 'hi', 'en');
              if (cached) return cached;
              enqueueTranslation(item, 'hi', 'en');
            }
            return item;
          });
          updatedBlock = { ...updatedBlock, items: translatedItems };
        }
        return updatedBlock;
      });
    } else if (!hasPreHindiBlocks && post.content && typeof post.content === 'string') {
      const paragraphs = post.content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
      if (paragraphs.length > 0) {
        blocks = paragraphs.map((p, idx) => {
          if (!isHindiText(p)) {
            const cached = getCachedTranslation(p, 'hi', 'en');
            if (cached) return { id: `hi-p-${idx}`, type: 'paragraph' as const, content: cached };
            enqueueTranslation(p, 'hi', 'en');
          }
          return { id: `hi-p-${idx}`, type: 'paragraph' as const, content: p };
        });
      }
    }

    const imageCaption = hasPreHindiCaption
      ? post.imageCaptionHi!
      : (post.imageCaption
        ? (isHindiText(post.imageCaption)
          ? post.imageCaption
          : getCachedTranslation(post.imageCaption, 'hi', 'en') || (enqueueTranslation(post.imageCaption, 'hi', 'en'), post.imageCaption))
        : undefined);

    const categoryName = post.categoryHi || HINDI_CATEGORY_NAMES[post.category] || post.category;

    return {
      ...post,
      title,
      dek,
      category: categoryName as any,
      categoryHi: categoryName,
      imageCaption,
      keyTakeaways,
      blocks,
      readTime: post.readTime ? post.readTime.replace('min read', 'मिनट') : '3 मिनट',
      author: localizedAuthor,
      authorName: localizedAuthor.name,
      authorRole: localizedAuthor.role,
      customAuthor: post.customAuthor ? {
        ...post.customAuthor,
        name: localizedAuthor.name,
        role: localizedAuthor.role,
        bio: localizedAuthor.bio,
      } : undefined,
    } as WpPost;
  }

  // 2. Target is English ('en')
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
  if (Array.isArray(post.blocks) && post.blocks.length > 0) {
    blocks = post.blocks.map((block) => {
      let updatedBlock = block;
      if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'pullquote') {
        if (block.content && isHindiText(block.content)) {
          const cached = getCachedTranslation(block.content, 'en', 'hi');
          if (cached) {
            updatedBlock = { ...updatedBlock, content: cached };
          } else {
            enqueueTranslation(block.content, 'en', 'hi');
          }
        }
      }
      if (Array.isArray(block.items)) {
        const translatedItems = block.items.map((item) => {
          if (isHindiText(item)) {
            const cached = getCachedTranslation(item, 'en', 'hi');
            if (cached) return cached;
            enqueueTranslation(item, 'en', 'hi');
          }
          return item;
        });
        updatedBlock = { ...updatedBlock, items: translatedItems };
      }
      return updatedBlock;
    });
  } else if (post.content && typeof post.content === 'string') {
    const paragraphs = post.content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    if (paragraphs.length > 0) {
      blocks = paragraphs.map((p, idx) => {
        if (isHindiText(p)) {
          const cached = getCachedTranslation(p, 'en', 'hi');
          if (cached) return { id: `en-p-${idx}`, type: 'paragraph' as const, content: cached };
          enqueueTranslation(p, 'en', 'hi');
        }
        return { id: `en-p-${idx}`, type: 'paragraph' as const, content: p };
      });
    }
  }

  const imageCaption = post.imageCaption && isHindiText(post.imageCaption)
    ? getCachedTranslation(post.imageCaption, 'en', 'hi') || (enqueueTranslation(post.imageCaption, 'en', 'hi'), post.imageCaption)
    : post.imageCaption;

  const categoryName = ENGLISH_CATEGORY_NAMES[post.category] || (post.category.charAt(0).toUpperCase() + post.category.slice(1));

  return {
    ...post,
    title,
    dek,
    category: categoryName as any,
    imageCaption,
    keyTakeaways,
    blocks,
    readTime: post.readTime ? post.readTime.replace('मिनट', 'min read') : '3 min read',
    author: localizedAuthor,
    authorName: localizedAuthor.name,
    authorRole: localizedAuthor.role,
    customAuthor: post.customAuthor ? {
      ...post.customAuthor,
      name: localizedAuthor.name,
      role: localizedAuthor.role,
      bio: localizedAuthor.bio,
    } : undefined,
  } as WpPost;
};

// =========================================================================
// TWO-WAY VIDEO LOCALIZATION
// =========================================================================

export const getLocalizedVideo = (video: WpVideo, lang: Language): WpVideo => {
  if (!video) return video;

  if (lang === 'hi') {
    const hasPreHindiTitle = !!video.titleHi?.trim() && isHindiText(video.titleHi);
    const hasPreHindiCaption = !!video.captionHi?.trim() && isHindiText(video.captionHi);

    const title = hasPreHindiTitle
      ? video.titleHi!
      : (isHindiText(video.title)
        ? video.title
        : getCachedTranslation(video.title, 'hi', 'en') || (enqueueTranslation(video.title, 'hi', 'en'), video.title));

    const caption = hasPreHindiCaption
      ? video.captionHi!
      : (isHindiText(video.caption)
        ? video.caption
        : getCachedTranslation(video.caption, 'hi', 'en') || (enqueueTranslation(video.caption, 'hi', 'en'), video.caption));

    const category = video.categoryHi || HINDI_CATEGORY_NAMES[video.category.toLowerCase()] || video.category;

    return {
      ...video,
      title,
      caption,
      category,
    };
  }

  // English
  const title = !isHindiText(video.title)
    ? video.title
    : getCachedTranslation(video.title, 'en', 'hi') || (enqueueTranslation(video.title, 'en', 'hi'), video.title);

  const caption = !isHindiText(video.caption)
    ? video.caption
    : getCachedTranslation(video.caption, 'en', 'hi') || (enqueueTranslation(video.caption, 'en', 'hi'), video.caption);

  const category = ENGLISH_CATEGORY_NAMES[video.category.toLowerCase()] || video.category;

  return {
    ...video,
    title,
    caption,
    category,
  };
};

// =========================================================================
// FULL ARTICLE PREFETCHING ENGINE
// =========================================================================

export async function ensurePostTranslated(post: WpPost, targetLang: Language): Promise<void> {
  if (!post) return;

  const textsToTranslate: string[] = [];

  if (targetLang === 'en') {
    if (post.title && isHindiText(post.title) && !getCachedTranslation(post.title, 'en', 'hi')) {
      textsToTranslate.push(post.title);
    }
    if (post.dek && isHindiText(post.dek) && !getCachedTranslation(post.dek, 'en', 'hi')) {
      textsToTranslate.push(post.dek);
    }
    if (post.imageCaption && isHindiText(post.imageCaption) && !getCachedTranslation(post.imageCaption, 'en', 'hi')) {
      textsToTranslate.push(post.imageCaption);
    }
    if (post.customAuthor?.name && isHindiText(post.customAuthor.name) && !AUTHOR_TRANSLATIONS[post.customAuthor.name]) {
      textsToTranslate.push(post.customAuthor.name);
    }
    if (post.customAuthor?.role && isHindiText(post.customAuthor.role) && !AUTHOR_TRANSLATIONS[post.customAuthor.role]) {
      textsToTranslate.push(post.customAuthor.role);
    }
    if (post.customAuthor?.bio && isHindiText(post.customAuthor.bio)) {
      textsToTranslate.push(post.customAuthor.bio);
    }
    if (Array.isArray(post.keyTakeaways)) {
      post.keyTakeaways.forEach((k) => {
        if (isHindiText(k) && !getCachedTranslation(k, 'en', 'hi')) {
          textsToTranslate.push(k);
        }
      });
    }
    if (Array.isArray(post.blocks)) {
      post.blocks.forEach((b) => {
        if (b.content && isHindiText(b.content) && !getCachedTranslation(b.content, 'en', 'hi')) {
          textsToTranslate.push(b.content);
        }
        if (Array.isArray(b.items)) {
          b.items.forEach((item) => {
            if (isHindiText(item) && !getCachedTranslation(item, 'en', 'hi')) {
              textsToTranslate.push(item);
            }
          });
        }
      });
    }
    if (post.content && typeof post.content === 'string') {
      const paragraphs = post.content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
      paragraphs.forEach((p) => {
        if (isHindiText(p) && !getCachedTranslation(p, 'en', 'hi')) {
          textsToTranslate.push(p);
        }
      });
    }

    if (textsToTranslate.length > 0) {
      await translateTexts(textsToTranslate, 'en', 'hi');
      notifyTranslationUpdates();
    }
    return;
  }

  // targetLang === 'hi'
  const hasPreHindiTitle = !!post.titleHi?.trim() && isHindiText(post.titleHi);
  const hasPreHindiDek = !!post.dekHi?.trim() && isHindiText(post.dekHi);
  const hasPreHindiCaption = !!post.imageCaptionHi?.trim() && isHindiText(post.imageCaptionHi);
  const hasPreHindiTakeaways = Array.isArray(post.keyTakeawaysHi) && post.keyTakeawaysHi.length > 0 && post.keyTakeawaysHi.some(isHindiText);
  const hasPreHindiBlocks = Array.isArray(post.blocksHi) && post.blocksHi.length > 0 && post.blocksHi.some((b) => b.content && isHindiText(b.content));

  if (!hasPreHindiTitle && post.title && !isHindiText(post.title) && !getCachedTranslation(post.title, 'hi', 'en')) {
    textsToTranslate.push(post.title);
  }
  if (!hasPreHindiDek && post.dek && !isHindiText(post.dek) && !getCachedTranslation(post.dek, 'hi', 'en')) {
    textsToTranslate.push(post.dek);
  }
  if (!hasPreHindiCaption && post.imageCaption && !isHindiText(post.imageCaption) && !getCachedTranslation(post.imageCaption, 'hi', 'en')) {
    textsToTranslate.push(post.imageCaption);
  }
  if (post.customAuthor?.name && !isHindiText(post.customAuthor.name) && !AUTHOR_TRANSLATIONS[post.customAuthor.name]) {
    textsToTranslate.push(post.customAuthor.name);
  }
  if (post.customAuthor?.role && !isHindiText(post.customAuthor.role) && !AUTHOR_TRANSLATIONS[post.customAuthor.role]) {
    textsToTranslate.push(post.customAuthor.role);
  }
  if (post.customAuthor?.bio && !isHindiText(post.customAuthor.bio)) {
    textsToTranslate.push(post.customAuthor.bio);
  }
  if (!hasPreHindiTakeaways && Array.isArray(post.keyTakeaways)) {
    post.keyTakeaways.forEach((k) => {
      if (!isHindiText(k) && !getCachedTranslation(k, 'hi', 'en')) {
        textsToTranslate.push(k);
      }
    });
  }
  if (!hasPreHindiBlocks && Array.isArray(post.blocks)) {
    post.blocks.forEach((b) => {
      if (b.content && !isHindiText(b.content) && !getCachedTranslation(b.content, 'hi', 'en')) {
        textsToTranslate.push(b.content);
      }
      if (Array.isArray(b.items)) {
        b.items.forEach((item) => {
          if (!isHindiText(item) && !getCachedTranslation(item, 'hi', 'en')) {
            textsToTranslate.push(item);
          }
        });
      }
    });
  }
  if (!hasPreHindiBlocks && post.content && typeof post.content === 'string') {
    const paragraphs = post.content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    paragraphs.forEach((p) => {
      if (!isHindiText(p) && !getCachedTranslation(p, 'hi', 'en')) {
        textsToTranslate.push(p);
      }
    });
  }

  if (textsToTranslate.length > 0) {
    await translateTexts(textsToTranslate, 'hi', 'en');
    notifyTranslationUpdates();
  }
}
