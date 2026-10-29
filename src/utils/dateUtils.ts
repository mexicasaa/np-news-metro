import { Language } from '../i18n/translations';

/**
 * High-precision, multilingual editorial date & relative time utilities
 * for NP News Metro. Ensures all articles display genuine, clear publication timestamps
 * in the visitor's selected language.
 */

const LOCALE_MAP: Record<string, string> = {
  hi: 'hi-IN',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ar: 'ar-SA',
  ru: 'ru-RU',
  pt: 'pt-BR',
  it: 'it-IT',
  bn: 'bn-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  gu: 'gu-IN',
  ur: 'ur-PK',
};

export const formatRelativeTime = (
  dateInput?: string | number | Date | null,
  lang: Language = 'hi'
): string => {
  if (!dateInput) {
    if (lang === 'hi') return 'हाल ही में';
    if (lang === 'ar') return 'مؤخراً';
    if (lang === 'fr') return 'Récemment';
    if (lang === 'es') return 'Recientemente';
    if (lang === 'de') return 'Kürzlich';
    if (lang === 'ja') return '最近';
    if (lang === 'zh') return '近期';
    return 'Recently';
  }

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return lang === 'hi' ? 'हाल ही में' : 'Recently';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  const locale = LOCALE_MAP[lang] || 'en-US';

  // If timestamp is slightly in future or <1 min
  if (diffMinutes < 1) {
    if (lang === 'hi') return 'अभी-अभी';
    if (lang === 'ar') return 'الآن';
    if (lang === 'fr') return 'À l\'instant';
    if (lang === 'es') return 'Ahora mismo';
    if (lang === 'de') return 'Gerade eben';
    if (lang === 'ja') return 'たった今';
    if (lang === 'zh') return '刚刚';
    return 'Just now';
  }

  // Under 60 minutes
  if (diffMinutes < 60) {
    try {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'always' });
      return rtf.format(-diffMinutes, 'minute');
    } catch {
      return lang === 'hi' ? `${diffMinutes} मिनट पहले` : `${diffMinutes}m ago`;
    }
  }

  // Under 24 hours
  if (diffHours < 24) {
    try {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'always' });
      return rtf.format(-diffHours, 'hour');
    } catch {
      return lang === 'hi' ? `${diffHours} घंटे पहले` : `${diffHours}h ago`;
    }
  }

  // Yesterday
  if (diffDays === 1) {
    const timeStr = date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    });
    if (lang === 'hi') return `कल, ${timeStr} IST`;
    if (lang === 'ar') return `أمس، ${timeStr} IST`;
    if (lang === 'fr') return `Hier, ${timeStr} IST`;
    if (lang === 'es') return `Ayer, ${timeStr} IST`;
    if (lang === 'de') return `Gestern, ${timeStr} IST`;
    return `Yesterday, ${timeStr} IST`;
  }

  // Under 7 days
  if (diffDays < 7) {
    try {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'always' });
      return rtf.format(-diffDays, 'day');
    } catch {
      return lang === 'hi' ? `${diffDays} दिन पहले` : `${diffDays}d ago`;
    }
  }

  // Same year
  const isSameYear = date.getFullYear() === now.getFullYear();
  if (isSameYear) {
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      timeZone: 'Asia/Kolkata',
    });
  }

  // Full calendar date
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
};

export const formatFullArticleDate = (
  dateInput?: string | number | Date | null,
  lang: Language = 'hi'
): string => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const locale = LOCALE_MAP[lang] || 'en-US';

  const datePart = date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });

  const timePart = date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata',
  });

  return `${datePart} • ${timePart} IST`;
};

export const isFreshStory = (
  dateInput?: string | number | Date | null,
  maxHours: number = 24
): boolean => {
  if (!dateInput) return false;
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return false;
  const diffHours = (Date.now() - date.getTime()) / (60 * 60 * 1000);
  return diffHours >= 0 && diffHours <= maxHours;
};
