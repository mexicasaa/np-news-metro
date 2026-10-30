import { Language } from '../i18n/translations';

/**
 * High-precision editorial date & relative time utilities
 * for NP News Metro (English & Hindi).
 */

const LOCALE_MAP: Record<Language, string> = {
  en: 'en-US',
  hi: 'hi-IN',
};

export const formatRelativeTime = (
  dateInput?: string | number | Date | null,
  lang: Language = 'hi'
): string => {
  if (!dateInput) {
    return lang === 'hi' ? 'हाल ही में' : 'Recently';
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
    return lang === 'hi' ? 'अभी-अभी' : 'Just now';
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
    return lang === 'hi' ? `कल, ${timeStr} IST` : `Yesterday, ${timeStr} IST`;
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
