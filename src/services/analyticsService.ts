/**
 * Google Analytics 4 (GA4) Dispatcher
 * Manages privacy-compliant, non-duplicated page views and engagement tracking.
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

const GA_ID = import.meta.env?.VITE_GA_MEASUREMENT_ID || 'G-NPNEWS2026';
let isInitialized = false;

export const initGoogleAnalytics = () => {
  if (typeof window === 'undefined' || isInitialized) return;

  try {
    // Inject gtag script if not already present
    if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(script);
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', GA_ID, {
      send_page_view: false, // We dispatch explicit single-truth page views to avoid double counts
      anonymize_ip: true,
    });

    isInitialized = true;
  } catch (err) {
    console.warn('Google Analytics initialization notice:', err);
  }
};

export const trackPageView = (pagePath: string, pageTitle: string) => {
  if (typeof window === 'undefined') return;
  initGoogleAnalytics();

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: pagePath,
        page_title: pageTitle,
        page_location: window.location.href,
      });
    }
  } catch (e) {}
};

export const trackArticleView = (articleId: string, headline: string, category: string) => {
  if (typeof window === 'undefined') return;
  initGoogleAnalytics();

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'article_read', {
        article_id: articleId,
        article_headline: headline,
        article_category: category,
      });
    }
  } catch (e) {}
};

export const trackVideoView = (videoId: string, title: string) => {
  if (typeof window === 'undefined') return;
  initGoogleAnalytics();

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'video_play', {
        video_id: videoId,
        video_title: title,
      });
    }
  } catch (e) {}
};
