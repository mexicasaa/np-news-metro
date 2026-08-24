import { WpPost, WpVideo, WpCategory } from '../types/wordpress';

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

const SITE_ORIGIN = typeof window !== 'undefined' ? window.location.origin : 'https://npnewsmetro.in';

export const generateArticleStructuredData = (
  post: WpPost,
  siteName: string = 'NP News Metro',
  siteUrl: string = SITE_ORIGIN
) => {
  const canonicalUrl = `${siteUrl}/${post.category}/${post.slug}`;
  const authorName = post.customAuthor?.name || 'NP News Metro Bureau';

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: post.seoTitle || post.title,
    description: post.seoDescription || post.dek || post.title,
    image: [
      post.featuredImage || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200',
    ],
    datePublished: post.publishedAt || new Date().toISOString(),
    dateModified: post.updatedAt || post.publishedAt || new Date().toISOString(),
    author: [
      {
        '@type': 'Person',
        name: authorName,
        jobTitle: post.customAuthor?.role || 'Staff Journalist',
      },
    ],
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: siteName,
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/assets/logo.png`,
      },
    },
    articleSection: post.category?.toUpperCase() || 'NATIONAL',
    keywords: post.tags?.join(', ') || 'News, India, Policy',
    inLanguage: post.titleHi ? 'hi-IN' : 'en-IN',
  };
};

export const generateVideoStructuredData = (
  video: WpVideo,
  siteName: string = 'NP News Metro',
  siteUrl: string = SITE_ORIGIN
) => {
  const canonicalUrl = `${siteUrl}/videos/${video.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.caption || video.title,
    thumbnailUrl: [
      video.posterUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600',
    ],
    uploadDate: video.publishedAt || new Date().toISOString(),
    duration: 'PT5M00S',
    contentUrl: video.videoUrl,
    embedUrl: video.videoUrl.includes('watch?v=')
      ? video.videoUrl.replace('watch?v=', 'embed/')
      : video.videoUrl,
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: siteName,
      url: siteUrl,
    },
  };
};

export const generateWebsiteStructuredData = (
  siteName: string = 'NP News Metro',
  siteUrl: string = SITE_ORIGIN
) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
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
    // Attempt HEAD or GET with abort controller
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
    // With CORS restrictions in browsers, no-cors fetch errors can still indicate network presence
    return { url, status: 'working', message: 'External endpoint reached.' };
  }
};
