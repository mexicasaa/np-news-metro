import React, { useEffect } from 'react';
import { SeoMetadataOptions } from '../../services/seoService';
import { trackPageView } from '../../services/analyticsService';
import { getAbsoluteImageUrl, getSiteOrigin } from '../../utils/shareUtils';

interface SeoHeadProps {
  metadata?: SeoMetadataOptions;
  structuredData?: Record<string, any> | Array<Record<string, any>>;
}

export const SeoHead: React.FC<SeoHeadProps> = ({ metadata, structuredData }) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const baseTitle = 'NP NEWS METRO — Real News. Real Impact. | Indian Digital Newspaper';
    const finalTitle = metadata?.title 
      ? (metadata.title.includes('NP News Metro') || metadata.title.includes('NP NEWS METRO') ? metadata.title : `${metadata.title} | NP News Metro`)
      : baseTitle;
    const finalDesc = metadata?.description || 'Fast, verified, and in-depth national news coverage, policy analysis, investigative journalism, and live market updates.';
    const finalUrl = metadata?.canonicalUrl || (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://www.npnewsmetro.com/');
    const finalImage = getAbsoluteImageUrl(metadata?.ogImage, 'https://www.npnewsmetro.com');
    const robotsContent = metadata?.noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
    const googleNewsContent = metadata?.noIndex ? 'noindex, nofollow' : 'index, follow';

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
    setMetaTag('meta[name="googlebot"]', 'name', 'googlebot', robotsContent);
    setMetaTag('meta[name="googlebot-news"]', 'name', 'googlebot-news', googleNewsContent);

    // 3. Open Graph (Facebook, WhatsApp, LinkedIn, iMessage, etc.)
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', finalTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', finalDesc);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', finalUrl);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', finalImage);
    setMetaTag('meta[property="og:image:secure_url"]', 'property', 'og:image:secure_url', finalImage);
    setMetaTag('meta[property="og:image:width"]', 'property', 'og:image:width', '1200');
    setMetaTag('meta[property="og:image:height"]', 'property', 'og:image:height', '630');
    setMetaTag('meta[property="og:image:type"]', 'property', 'og:image:type', 'image/jpeg');
    setMetaTag('meta[property="og:image:alt"]', 'property', 'og:image:alt', metadata?.title || 'NP News Metro');
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', metadata?.ogType || 'website');
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'NP News Metro');

    // Article Specific OG tags
    if (metadata?.ogType === 'article') {
      if (metadata.publishedTime) {
        setMetaTag('meta[property="article:published_time"]', 'property', 'article:published_time', metadata.publishedTime);
      }
      if (metadata.modifiedTime) {
        setMetaTag('meta[property="article:modified_time"]', 'property', 'article:modified_time', metadata.modifiedTime);
      }
      if (metadata.authorName) {
        setMetaTag('meta[property="article:author"]', 'property', 'article:author', metadata.authorName);
      }
      if (metadata.section) {
        setMetaTag('meta[property="article:section"]', 'property', 'article:section', metadata.section);
      }
    }

    // 4. Twitter / X Cards
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:domain"]', 'name', 'twitter:domain', 'www.npnewsmetro.com');
    setMetaTag('meta[name="twitter:site"]', 'name', 'twitter:site', '@NPNewsMetro');
    setMetaTag('meta[name="twitter:creator"]', 'name', 'twitter:creator', '@NPNewsMetro');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', finalTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', finalDesc);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', finalImage);
    setMetaTag('meta[name="twitter:image:src"]', 'name', 'twitter:image:src', finalImage);
    setMetaTag('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt', finalTitle);

    // 5. Image Src Link (for legacy/WhatsApp scrapers)
    let imageSrcLink = document.querySelector('link[rel="image_src"]') as HTMLLinkElement;
    if (!imageSrcLink) {
      imageSrcLink = document.createElement('link');
      imageSrcLink.setAttribute('rel', 'image_src');
      document.head.appendChild(imageSrcLink);
    }
    imageSrcLink.setAttribute('href', finalImage);

    // 6. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', finalUrl);

    // 7. JSON-LD Structured Data
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
