import { Language } from '../i18n/translations';

export const LANGUAGE_STORAGE_KEY = 'np_news_language_preference_v2';
export const LANGUAGE_MANUAL_FLAG = 'np_news_language_manual_v1';

export const SUPPORTED_LANGUAGE_CODES: Language[] = ['en', 'hi'];

/**
 * Maps IANA Timezones to primary language:
 * - India: Hindi ('hi')
 * - Rest of the world: English ('en')
 */
const INDIAN_TIMEZONES = new Set([
  'asia/kolkata',
  'asia/calcutta',
]);

export function detectLanguageFromTimezone(): Language | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone?.toLowerCase();
    if (!tz) return null;

    if (INDIAN_TIMEZONES.has(tz) || tz.includes('kolkata') || tz.includes('calcutta')) {
      return 'hi';
    }

    return 'en';
  } catch (e) {
    return null;
  }
}

/**
 * Detect language from navigator.languages / navigator.language.
 */
export function detectLanguageFromBrowser(): Language | null {
  try {
    if (typeof navigator === 'undefined') return null;

    const languages: string[] = [];
    if (Array.isArray(navigator.languages)) {
      languages.push(...navigator.languages);
    }
    if (navigator.language) {
      languages.push(navigator.language);
    }

    for (const raw of languages) {
      if (!raw) continue;
      const lower = raw.toLowerCase().trim();
      if (lower.startsWith('hi')) {
        return 'hi';
      }
      if (lower.startsWith('en')) {
        return 'en';
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Automatically select the website language for visitors on their first visit,
 * while giving manual user selection absolute priority.
 */
export function detectInitialLanguage(): Language {
  // 1. Manual user selection priority
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
      if (saved && (saved === 'en' || saved === 'hi')) {
        return saved;
      }
    }
  } catch (e) {}

  // 2. Automatic Regional Detection (Timezone - India defaults to Hindi)
  const tzLang = detectLanguageFromTimezone();
  if (tzLang) {
    return tzLang;
  }

  // 3. Browser Language Detection
  const browserLang = detectLanguageFromBrowser();
  if (browserLang) {
    return browserLang;
  }

  // 4. Default to English
  return 'en';
}

/**
 * Records a visitor's manual language selection in localStorage.
 */
export function recordManualLanguageSelection(lang: Language): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      localStorage.setItem(LANGUAGE_MANUAL_FLAG, 'true');
    }
  } catch (e) {}
}

/**
 * Both English and Hindi use LTR.
 */
export function isRtlLanguage(_lang: Language): boolean {
  return false;
}
