import { Language } from '../i18n/translations';

export const LANGUAGE_STORAGE_KEY = 'np_news_language_preference_v2';
export const LANGUAGE_MANUAL_FLAG = 'np_news_language_manual_v1';

export const SUPPORTED_LANGUAGE_CODES: Language[] = [
  'en', 'hi', 'es', 'fr', 'de', 'zh', 'ja', 'ar', 'ru', 'pt', 'it',
  'bn', 'mr', 'ta', 'te', 'gu', 'ur'
];

/**
 * Maps IANA Timezones to primary country / regional language.
 * Strictly adheres to regional defaults:
 * - India: Hindi ('hi')
 * - United States & United Kingdom: English ('en')
 * - China: Simplified Chinese ('zh')
 * - Japan: Japanese ('ja')
 * - France: French ('fr')
 * - Germany: German ('de')
 * - Spain: Spanish ('es')
 * - Arabic-speaking countries: Arabic ('ar')
 * - European & international countries: their local language when supported.
 */
const TIMEZONE_TO_LANGUAGE: Record<string, Language> = {
  // India -> Hindi default
  'asia/kolkata': 'hi',
  'asia/calcutta': 'hi',

  // United States & United Kingdom -> English default
  'america/new_york': 'en',
  'america/detroit': 'en',
  'america/chicago': 'en',
  'america/denver': 'en',
  'america/phoenix': 'en',
  'america/los_angeles': 'en',
  'america/anchorage': 'en',
  'america/honolulu': 'en',
  'america/boise': 'en',
  'america/indiana/indianapolis': 'en',
  'europe/london': 'en',
  'europe/belfast': 'en',
  'australia/sydney': 'en',
  'australia/melbourne': 'en',
  'australia/brisbane': 'en',
  'australia/perth': 'en',
  'pacific/auckland': 'en',

  // China -> Simplified Chinese
  'asia/shanghai': 'zh',
  'asia/chongqing': 'zh',
  'asia/harbin': 'zh',
  'asia/urumqi': 'zh',
  'asia/kashgar': 'zh',
  'asia/hong_kong': 'zh',
  'asia/macau': 'zh',
  'asia/taipei': 'zh',

  // Japan -> Japanese
  'asia/tokyo': 'ja',

  // France -> French
  'europe/paris': 'fr',
  'europe/monaco': 'fr',

  // Germany, Austria, Switzerland (German region) -> German
  'europe/berlin': 'de',
  'europe/busingen': 'de',
  'europe/vienna': 'de',
  'europe/zurich': 'de',
  'europe/vaduz': 'de',

  // Spain & Spanish-speaking Americas -> Spanish
  'europe/madrid': 'es',
  'atlantic/canary': 'es',
  'africa/ceuta': 'es',
  'america/mexico_city': 'es',
  'america/cancun': 'es',
  'america/monterrey': 'es',
  'america/tijuana': 'es',
  'america/bogota': 'es',
  'america/buenos_aires': 'es',
  'america/santiago': 'es',
  'america/lima': 'es',
  'america/caracas': 'es',
  'america/guayaquil': 'es',
  'america/havana': 'es',
  'america/santo_domingo': 'es',
  'america/panama': 'es',
  'america/costa_rica': 'es',
  'america/guatemala': 'es',

  // Arabic-speaking countries -> Arabic (RTL)
  'asia/riyadh': 'ar', // Saudi Arabia
  'asia/dubai': 'ar', // UAE
  'africa/cairo': 'ar', // Egypt
  'asia/qatar': 'ar', // Qatar
  'asia/kuwait': 'ar', // Kuwait
  'asia/muscat': 'ar', // Oman
  'asia/bahrain': 'ar', // Bahrain
  'asia/baghdad': 'ar', // Iraq
  'asia/amman': 'ar', // Jordan
  'asia/beirut': 'ar', // Lebanon
  'africa/casablanca': 'ar', // Morocco
  'africa/algiers': 'ar', // Algeria
  'africa/tunis': 'ar', // Tunisia
  'africa/tripoli': 'ar', // Libya
  'africa/khartoum': 'ar', // Sudan
  'asia/aden': 'ar', // Yemen
  'asia/damascus': 'ar', // Syria
  'asia/gaza': 'ar',
  'asia/hebron': 'ar',
  'asia/jerusalem': 'ar',

  // Italy -> Italian
  'europe/rome': 'it',
  'europe/san_marino': 'it',
  'europe/vatican': 'it',

  // Portugal & Brazil -> Portuguese
  'europe/lisbon': 'pt',
  'atlantic/madeira': 'pt',
  'atlantic/azores': 'pt',
  'america/sao_paulo': 'pt',
  'america/fortaleza': 'pt',
  'america/recife': 'pt',
  'america/rio_branco': 'pt',
  'america/manaus': 'pt',

  // Russia -> Russian
  'europe/moscow': 'ru',
  'europe/kaliningrad': 'ru',
  'europe/samara': 'ru',
  'asia/yekaterinburg': 'ru',
  'asia/novosibirsk': 'ru',
  'asia/krasnoyarsk': 'ru',
  'asia/irkutsk': 'ru',
  'asia/vladivostok': 'ru',
};

/**
 * Maps ISO Alpha-2 country code to language.
 */
const COUNTRY_TO_LANGUAGE: Record<string, Language> = {
  IN: 'hi', // India -> Hindi
  US: 'en', // United States -> English
  GB: 'en', // United Kingdom -> English
  AU: 'en',
  CA: 'en',
  NZ: 'en',
  IE: 'en',
  CN: 'zh', // China -> Simplified Chinese
  TW: 'zh',
  HK: 'zh',
  JP: 'ja', // Japan -> Japanese
  FR: 'fr', // France -> French
  BE: 'fr',
  MC: 'fr',
  DE: 'de', // Germany -> German
  AT: 'de', // Austria -> German
  CH: 'de', // Switzerland
  LI: 'de',
  ES: 'es', // Spain -> Spanish
  MX: 'es',
  AR: 'es',
  CO: 'es',
  CL: 'es',
  PE: 'es',
  VE: 'es',
  EC: 'es',
  GT: 'es',
  CU: 'es',
  BO: 'es',
  DO: 'es',
  HN: 'es',
  PY: 'es',
  SV: 'es',
  NI: 'es',
  CR: 'es',
  PA: 'es',
  UY: 'es',
  PR: 'es',
  // Arabic Countries
  SA: 'ar',
  AE: 'ar',
  EG: 'ar',
  QA: 'ar',
  KW: 'ar',
  OM: 'ar',
  BH: 'ar',
  IQ: 'ar',
  JO: 'ar',
  LB: 'ar',
  MA: 'ar',
  DZ: 'ar',
  TN: 'ar',
  LY: 'ar',
  SD: 'ar',
  YE: 'ar',
  SY: 'ar',
  PS: 'ar',
  // Other regions
  IT: 'it', // Italy -> Italian
  PT: 'pt', // Portugal -> Portuguese
  BR: 'pt', // Brazil -> Portuguese
  RU: 'ru', // Russia -> Russian
  BY: 'ru',
  KZ: 'ru',
  BD: 'bn', // Bangladesh -> Bengali
  PK: 'ur', // Pakistan -> Urdu
};

/**
 * Maps browser language codes (e.g. 'fr-FR', 'es-MX', 'zh-CN') to supported Language.
 */
export function mapBrowserLanguageToSupported(langCode?: string): Language | null {
  if (!langCode || typeof langCode !== 'string') return null;
  const lower = langCode.toLowerCase().trim();

  // Exact prefix match
  const prefix = lower.split('-')[0].split('_')[0];
  if (SUPPORTED_LANGUAGE_CODES.includes(prefix as Language)) {
    return prefix as Language;
  }

  // Handle special variants
  if (lower.startsWith('zh')) return 'zh';
  if (lower.startsWith('hi')) return 'hi';
  if (lower.startsWith('es')) return 'es';
  if (lower.startsWith('fr')) return 'fr';
  if (lower.startsWith('de')) return 'de';
  if (lower.startsWith('ja')) return 'ja';
  if (lower.startsWith('ar')) return 'ar';
  if (lower.startsWith('ru')) return 'ru';
  if (lower.startsWith('pt')) return 'pt';
  if (lower.startsWith('it')) return 'it';

  return null;
}

/**
 * Detect language based on system/browser timezone.
 */
export function detectLanguageFromTimezone(): Language | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone?.toLowerCase();
    if (!tz) return null;

    if (TIMEZONE_TO_LANGUAGE[tz]) {
      return TIMEZONE_TO_LANGUAGE[tz];
    }

    // Prefix matching
    if (tz.startsWith('asia/kolkata') || tz.startsWith('asia/calcutta')) return 'hi';
    if (tz.startsWith('america/new_york') || tz.startsWith('america/chicago') || tz.startsWith('america/los_angeles')) return 'en';
    if (tz.startsWith('europe/london')) return 'en';
    if (tz.startsWith('europe/paris')) return 'fr';
    if (tz.startsWith('europe/berlin') || tz.startsWith('europe/vienna')) return 'de';
    if (tz.startsWith('europe/madrid')) return 'es';
    if (tz.startsWith('asia/tokyo')) return 'ja';
    if (tz.startsWith('asia/shanghai')) return 'zh';
    if (tz.startsWith('europe/rome')) return 'it';
    if (tz.startsWith('europe/lisbon') || tz.startsWith('america/sao_paulo')) return 'pt';
    if (tz.startsWith('europe/moscow')) return 'ru';

    // Arabic region timezones
    const arabicTimezones = [
      'riyadh', 'dubai', 'cairo', 'qatar', 'kuwait', 'muscat',
      'bahrain', 'baghdad', 'amman', 'beirut', 'casablanca',
      'algiers', 'tunis', 'tripoli', 'khartoum', 'aden', 'damascus'
    ];
    if (arabicTimezones.some(city => tz.includes(city))) {
      return 'ar';
    }
  } catch (e) {
    // ignore
  }
  return null;
}

/**
 * Detect language based on browser navigator language.
 */
export function detectLanguageFromBrowser(): Language | null {
  if (typeof navigator === 'undefined') return null;

  // Try navigator.languages array first
  if (Array.isArray(navigator.languages)) {
    for (const l of navigator.languages) {
      const match = mapBrowserLanguageToSupported(l);
      if (match) return match;
    }
  }

  // Fallback to single navigator.language
  if (navigator.language) {
    return mapBrowserLanguageToSupported(navigator.language);
  }

  return null;
}

/**
 * Automatically select the website language for visitors on their first visit,
 * while giving manual user selection absolute priority.
 *
 * Rules:
 * 1. If visitor manually chose a language previously: return saved language.
 * 2. If first visit:
 *    - Regional detection (Timezone / IP country):
 *      - India: 'hi' by default
 *      - US / UK: 'en' by default
 *      - China: 'zh'
 *      - Japan: 'ja'
 *      - France: 'fr'
 *      - Germany: 'de'
 *      - Spain: 'es'
 *      - Arabic countries: 'ar' (RTL)
 *      - Other supported regions: their local language
 *    - If regional detection fails: browser language
 *    - Fallback: 'en'
 */
export function detectInitialLanguage(): Language {
  // 1. Manual user selection priority
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
      if (saved && SUPPORTED_LANGUAGE_CODES.includes(saved)) {
        return saved;
      }
    }
  } catch (e) {}

  // 2. Automatic Regional Detection (Timezone)
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
 * Helper to check if a language is Right-to-Left.
 */
export function isRtlLanguage(lang: Language): boolean {
  return lang === 'ar' || lang === 'ur';
}
