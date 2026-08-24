import React, { useEffect } from 'react';
import { SeoMetadataOptions } from '../../services/seoService';
import { trackPageView } from '../../services/analyticsService';

interface SeoHeadProps {
  metadata?: SeoMetadataOptions;
  structuredData?: Record<string, any> | Array<Record<string, any>>;
}

export const SeoHead: React.FC<SeoHeadProps> = ({ metadata, structuredData }) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const baseTitle = 'NP News Metro • India’s Premier Newsroom';
    const finalTitle = metadata?.title ? `${metadata.title} | NP News Metro` : baseTitle;
    const finalDesc = metadata?.description || 'Fast, verified, and in-depth national news coverage, policy analysis, investigative journalism, and live market updates.';
    const finalUrl = metadata?.canonicalUrl || window.location.href;
    const finalImage = metadata?.ogImage || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200';
    const robotsContent = metadata?.noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

    // 1. Document Title
    document.title = finalTitle;

    // Helper to set or create meta tags
    const setMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Primary Meta Tags
    setMetaTag('meta[name="description"]', 'name', 'description', finalDesc);
    setMetaTag('meta[name="robots"]', 'name', 'robots', robotsContent);
    setMetaTag('meta[name="googlebot-news"]', 'name', 'googlebot-news', 'index, follow');

    // 3. Open Graph
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', finalTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', finalDesc);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', finalUrl);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', finalImage);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', metadata?.ogType || 'website');
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'NP News Metro');

    // 4. Twitter / X Cards
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', finalTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', finalDesc);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', finalImage);

    // 5. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', finalUrl);

    // 6. JSON-LD Structured Data
    const SCRIPT_ID = 'npnews-structured-data';
    let scriptEl = document.getElementById(SCRIPT_ID);
    if (structuredData) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.setAttribute('id', SCRIPT_ID);
        scriptEl.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(structuredData, null, 2);
    } else if (scriptEl) {
      scriptEl.remove();
    }

    // 7. Track analytics page view
    trackPageView(window.location.pathname, finalTitle);
  }, [metadata, structuredData]);

  return null;
};
