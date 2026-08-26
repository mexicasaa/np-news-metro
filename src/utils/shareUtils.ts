/**
 * Share Utilities for NP News Metro
 * Handles absolute image resolution, social sharing link generation,
 * and Web Share API Level 2 (with image file attachments).
 */

export const DEFAULT_SITE_ORIGIN = 'https://www.npnewsmetro.com';
export const DEFAULT_OG_IMAGE = 'https://www.npnewsmetro.com/uploads/dr-deepak-goswami.jpg';

/**
 * Returns the current site origin in browser or default production domain
 */
export const getSiteOrigin = (): string => {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }
  return DEFAULT_SITE_ORIGIN;
};

/**
 * Converts any image path (relative /uploads/..., local asset, or external URL)
 * into a fully-qualified absolute URL required by social media crawlers (WhatsApp, Facebook, Twitter, Telegram, LinkedIn, etc.)
 */
export const getAbsoluteImageUrl = (imageUrl?: string, customOrigin?: string): string => {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
    return DEFAULT_OG_IMAGE;
  }

  const trimmed = imageUrl.trim();

  // If Supabase storage, route via first-party /api/image endpoint to avoid x-robots-tag: none and ensure 100% crawlability
  if (trimmed.includes('supabase.co/storage/v1/object/public/')) {
    const origin = customOrigin || getSiteOrigin();
    const cleanOrigin = origin.replace(/\/+$/, '');
    return `${cleanOrigin}/api/image?url=${encodeURIComponent(trimmed)}`;
  }

  // Already a full absolute HTTP/HTTPS URL or data URI
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Data URLs shouldn't be prefixed
  if (trimmed.startsWith('data:')) {
    return trimmed;
  }

  const origin = customOrigin || getSiteOrigin();
  const cleanOrigin = origin.replace(/\/+$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return `${cleanOrigin}${cleanPath}`;
};

/**
 * Generates the canonical URL for an article or media item
 */
export const getCanonicalArticleUrl = (
  category?: string,
  slug?: string,
  customOrigin?: string,
  updatedAt?: string | null
): string => {
  const origin = (customOrigin || getSiteOrigin()).replace(/\/+$/, '');
  let url = '';
  if (!slug) {
    url = typeof window !== 'undefined' ? window.location.href.split('?')[0] : origin;
  } else {
    const cleanCategory = (category || 'india').toLowerCase().trim();
    url = `${origin}/${cleanCategory}/${slug}`;
  }
  
  // Append cache busting parameter based on the last update time
  // This completely solves WhatsApp/Facebook caching issues when featured images are updated multiple times
  if (updatedAt) {
    const timestamp = new Date(updatedAt).getTime();
    if (!isNaN(timestamp)) {
      url = `${url}?v=${timestamp}`;
    }
  }
  return url;
};

/**
 * Fetches an image URL and converts it into a browser File object
 * for native file sharing (Web Share API Level 2).
 */
export const fetchImageAsFile = async (
  imageUrl: string,
  fileName: string = 'npnews-article.jpg'
): Promise<File | null> => {
  try {
    const absoluteUrl = getAbsoluteImageUrl(imageUrl);
    const response = await fetch(absoluteUrl, { mode: 'cors' });
    if (!response.ok) return null;
    const blob = await response.blob();
    const mimeType = blob.type || 'image/jpeg';
    return new File([blob], fileName, { type: mimeType });
  } catch {
    // In case of CORS or network error, return null so caller falls back to standard text/URL sharing
    return null;
  }
};

export interface ShareOptions {
  title: string;
  url: string;
  imageUrl?: string;
  summary?: string;
  category?: string;
}

/**
 * Generates formatted social sharing links for WhatsApp, X/Twitter, Facebook, Telegram, LinkedIn, and Email
 */
export const generateSocialShareLinks = ({
  title,
  url,
  imageUrl,
  summary,
}: ShareOptions) => {
  const absoluteImage = getAbsoluteImageUrl(imageUrl);
  const cleanTitle = title.trim();
  const cleanUrl = url.trim();
  const cleanSummary = summary ? summary.trim() : '';

  // WhatsApp formatted message with bold headline, dek, and full link (WhatsApp auto-renders rich link card with image)
  const whatsAppText = `${cleanTitle}\n\n${cleanSummary ? `${cleanSummary}\n\n` : ''}🔗 Read Full Story:\n${cleanUrl}`;

  // Twitter / X tweet text
  const twitterText = `${cleanTitle} — via @NPNewsMetro`;

  // Telegram formatted text
  const telegramText = `${cleanTitle}\n\n${cleanSummary ? `${cleanSummary}\n\n` : ''}`;

  // Email subject and body
  const emailSubject = `${cleanTitle} | NP News Metro`;
  const emailBody = `${cleanTitle}\n\n${cleanSummary ? `${cleanSummary}\n\n` : ''}Read the complete story on NP News Metro:\n${cleanUrl}`;

  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsAppText)}`,
    whatsappWeb: `https://web.whatsapp.com/send?text=${encodeURIComponent(whatsAppText)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(cleanUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cleanUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(cleanUrl)}&text=${encodeURIComponent(telegramText)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(cleanUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`,
    googleNews: `https://news.google.com/search?q=${encodeURIComponent(cleanTitle + ' NP News Metro')}`,
    absoluteImage,
  };
};

/**
 * Triggers the Native Web Share API.
 * If file sharing is supported, it attaches the featured image file.
 * Otherwise, it shares title, text, and canonical URL.
 */
export const shareArticleNative = async ({
  title,
  url,
  imageUrl,
  summary,
}: ShareOptions): Promise<{ success: boolean; method: 'files' | 'standard' | 'unsupported'; error?: any }> => {
  if (typeof navigator === 'undefined' || !navigator.share) {
    return { success: false, method: 'unsupported' };
  }

  const shareData: ShareData = {
    title,
    text: summary ? `${title}\n\n${summary}` : title,
    url,
  };

  // Try Web Share Level 2 with Image File if supported
  if (imageUrl && navigator.canShare) {
    try {
      const file = await fetchImageAsFile(imageUrl);
      if (file && navigator.canShare({ files: [file] })) {
        await navigator.share({
          ...shareData,
          files: [file],
        });
        return { success: true, method: 'files' };
      }
    } catch (e: any) {
      // User cancelled or aborted
      if (e?.name === 'AbortError') {
        return { success: false, method: 'files', error: e };
      }
      // If file sharing failed due to permission/fetch, fallback to standard share below
    }
  }

  // Fallback to Standard Web Share
  try {
    await navigator.share(shareData);
    return { success: true, method: 'standard' };
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      return { success: false, method: 'standard', error: e };
    }
    return { success: false, method: 'standard', error: e };
  }
};
