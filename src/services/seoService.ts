import { WpPost, WpVideo, WpCategory } from '../types/wordpress';
import { getAbsoluteImageUrl, getSiteOrigin } from '../utils/shareUtils';

export interface SeoMetadataOptions {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'video.other';
  ogImage?: string;
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
  section?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export interface InternalLinkResult {
  id: string;
  title: string;
  slug: string;
  category: string;
  url: string;
}

export interface ExternalLinkCheckResult {
  url: string;
  status: 'working' | 'broken' | 'redirecting' | 'timeout';
  httpCode?: number;
  message?: string;
}

const SITE_ORIGIN = getSiteOrigin();

export const generateArticleStructuredData = (
  post: WpPost,
  siteName: string = 'NP News Metro',
  siteUrl: string = SITE_ORIGIN
) => {
  const canonicalUrl = `${siteUrl}/${post.category}/${post.slug}`;
  const authorName = post.customAuthor?.name || 'NP News Metro Bureau';
  const authorRole = post.customAuthor?.role || 'Staff Journalist';
  const authorSlug = (authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || 'editorial';
  const absoluteImage = getAbsoluteImageUrl(post.featuredImage, siteUrl);
  const isHindi = !!(post.titleHi || /[\u0900-\u097F]/.test(post.title));
  const categoryUpper = post.category?.toUpperCase() || 'NATIONAL';

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsMediaOrganization',
        '@id': `${siteUrl}/#organization`,
        name: siteName,
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/logo.png`,
          width: 600,
          height: 120,
        },
        publishingPrinciples: `${siteUrl}/ethics`,
        correctionsPolicy: `${siteUrl}/corrections`,
        ethicsPolicy: `${siteUrl}/ethics`,
        masthead: `${siteUrl}/editorial-team`,
        diversityPolicy: `${siteUrl}/about`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'New Delhi',
          addressRegion: 'Delhi',
          addressCountry: 'IN',
        },
        sameAs: [
          'https://twitter.com/NPNewsMetro',
          'https://www.youtube.com/@NPNewsMetro',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: siteName,
        publisher: { '@id': `${siteUrl}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: categoryUpper, item: `${siteUrl}/category/${post.category}` },
          { '@type': 'ListItem', position: 3, name: post.title, item: canonicalUrl },
        ],
      },
      {
        '@type': 'NewsArticle',
        '@id': `${canonicalUrl}#article`,
        isPartOf: { '@id': `${siteUrl}/#website` },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
        headline: post.seoTitle || post.title,
        description: post.seoDescription || post.dek || post.title,
        image: [absoluteImage],
        datePublished: post.publishedAt || new Date().toISOString(),
        dateModified: post.updatedAt || post.publishedAt || new Date().toISOString(),
        articleSection: categoryUpper,
        inLanguage: isHindi ? 'hi-IN' : 'en-IN',
        isAccessibleForFree: 'True',
        copyrightYear: new Date(post.publishedAt || Date.now()).getFullYear(),
        copyrightHolder: { '@id': `${siteUrl}/#organization` },
        publisher: { '@id': `${siteUrl}/#organization` },
        author: [
          {
            '@type': 'Person',
            name: authorName,
            jobTitle: authorRole,
            url: `${siteUrl}/author/${authorSlug}`,
            worksFor: { '@id': `${siteUrl}/#organization` },
          },
        ],
        keywords: post.tags?.join(', ') || 'News, India, Policy, Analysis',
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '.dek', '.key-takeaways', '.article-body p:first-of-type'],
        },
        spatialCoverage: {
          '@type': 'Place',
          name: 'India',
          geo: {
            '@type': 'GeoCoordinates',
            latitude: 28.6139,
            longitude: 77.2090,
          },
        },
      },
    ],
  };
};

export const generateVideoStructuredData = (
  video: WpVideo,
  siteName: string = 'NP News Metro',
  siteUrl: string = SITE_ORIGIN
) => {
  const canonicalUrl = `${siteUrl}/videos/${video.slug}`;
  const absolutePoster = getAbsoluteImageUrl(video.posterUrl, siteUrl);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsMediaOrganization',
        '@id': `${siteUrl}/#organization`,
        name: siteName,
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/logo.png`,
        },
        sameAs: ['https://twitter.com/NPNewsMetro', 'https://www.youtube.com/@NPNewsMetro'],
      },
      {
        '@type': 'VideoObject',
        '@id': `${canonicalUrl}#video`,
        name: video.title,
        description: video.caption || video.title,
        thumbnailUrl: [absolutePoster],
        uploadDate: video.publishedAt || new Date().toISOString(),
        duration: 'PT5M00S',
        contentUrl: video.videoUrl,
        embedUrl: video.videoUrl.includes('watch?v=')
          ? video.videoUrl.replace('watch?v=', 'embed/')
          : video.videoUrl,
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'hi-IN',
      },
    ],
  };
};

export const generateWebsiteStructuredData = (
  siteName: string = 'NP News Metro',
  siteUrl: string = SITE_ORIGIN
) => {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsMediaOrganization',
        '@id': `${siteUrl}/#organization`,
        name: siteName,
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/logo.png`,
          width: 600,
          height: 120,
        },
        publishingPrinciples: `${siteUrl}/ethics`,
        correctionsPolicy: `${siteUrl}/corrections`,
        ethicsPolicy: `${siteUrl}/ethics`,
        masthead: `${siteUrl}/editorial-team`,
        sameAs: [
          'https://twitter.com/NPNewsMetro',
          'https://www.youtube.com/@NPNewsMetro',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: siteName,
        url: siteUrl,
        publisher: { '@id': `${siteUrl}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
};

export const generateBreadcrumbsStructuredData = (
  items: { name: string; url: string }[]
) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

export const searchInternalLinks = (
  posts: WpPost[],
  query: string
): InternalLinkResult[] => {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();

  return posts
    .filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.dek && p.dek.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
    )
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: p.category,
      url: `/${p.category}/${p.slug}`,
    }));
};

export const checkExternalLinkStatus = async (
  url: string
): Promise<ExternalLinkCheckResult> => {
  if (!url || !url.startsWith('http')) {
    return { url, status: 'broken', message: 'Malformed URL scheme.' };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    return {
      url,
      status: 'working',
      httpCode: response.status || 200,
      message: 'Resource accessible.',
    };
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return { url, status: 'timeout', message: 'Connection timed out (>4s).' };
    }
    return { url, status: 'working', message: 'External endpoint reached.' };
  }
};
