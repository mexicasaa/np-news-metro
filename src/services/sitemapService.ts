import { WpPost, WpVideo, WpCategory } from '../types/wordpress';
import { supabase } from '../lib/supabase';
import { getPublishedArticles } from './articleService';
import { getPublishedVideos } from './videoService';

export const getBaseSiteUrl = (): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_SITE_URL) {
      return String((import.meta as any).env.VITE_SITE_URL).replace(/\/+$/, '');
    }
  } catch (e) {
    // Ignore in non-ESM
  }
  try {
    if (typeof process !== 'undefined' && (process?.env?.VITE_SITE_URL || process?.env?.NEXT_PUBLIC_SITE_URL)) {
      return String(process.env.VITE_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL).replace(/\/+$/, '');
    }
  } catch (e) {
    // Ignore
  }
  return 'https://npnewsmetro.com';
};

const escapeXml = (unsafe: string): string => {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * Filter articles to only indexable, published, public items
 */
export const filterIndexableArticles = (articles: WpPost[]): WpPost[] => {
  const now = Date.now();
  return articles.filter((a) => {
    // 1. Must have published status
    const status = (a as any).editorialStatus || (a as any).status || 'published';
    if (status === 'draft' || status === 'review' || status === 'scheduled' || status === 'archived') {
      return false;
    }

    // 2. Publication timestamp must not be in the future
    if (a.publishedAt) {
      const pubTime = new Date(a.publishedAt).getTime();
      if (!isNaN(pubTime) && pubTime > now + 60000) { // 1 min buffer
        return false;
      }
    }

    // 3. Respect robots_index / noindex flags
    if ((a as any).robots_index === false || (a as any).robotsIndex === false) {
      return false;
    }

    // 4. Must have slug and category
    if (!a.slug || !a.category) {
      return false;
    }

    return true;
  });
};

/**
 * 1. Main XML Sitemap (/sitemap.xml)
 */
export const generateSitemapXml = (
  articles: WpPost[],
  categories: WpCategory[] = [],
  videos: WpVideo[] = []
): string => {
  const baseUrl = getBaseSiteUrl();
  const indexableArticles = filterIndexableArticles(articles);
  const seenUrls = new Set<string>();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Homepage
  const homeUrl = `${baseUrl}/`;
  seenUrls.add(homeUrl);
  xml += `  <url>\n`;
  xml += `    <loc>${homeUrl}</loc>\n`;
  xml += `    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>\n`;
  xml += `    <changefreq>always</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;

  // 2. Desks / Categories
  const defaultCategorySlugs = [
    'india', 'politics', 'business', 'technology', 'world', 
    'sports', 'entertainment', 'lifestyle', 'opinion', 'videos', 'photos', 'latest'
  ];
  for (const slug of defaultCategorySlugs) {
    const catUrl = `${baseUrl}/category/${slug}`;
    if (!seenUrls.has(catUrl)) {
      seenUrls.add(catUrl);
      xml += `  <url>\n`;
      xml += `    <loc>${catUrl}</loc>\n`;
      xml += `    <changefreq>hourly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }
  }

  // 3. Published Articles (De-duplicated & validated)
  for (const article of indexableArticles) {
    const articleUrl = `${baseUrl}/${escapeXml(article.category)}/${escapeXml(article.slug)}`;
    if (!seenUrls.has(articleUrl)) {
      seenUrls.add(articleUrl);
      const pubDate = article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString();
      xml += `  <url>\n`;
      xml += `    <loc>${articleUrl}</loc>\n`;
      xml += `    <lastmod>${pubDate.slice(0, 10)}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    }
  }

  // 4. Public Videos
  for (const video of videos) {
    if (video.slug) {
      const videoUrl = `${baseUrl}/videos/${escapeXml(video.slug)}`;
      if (!seenUrls.has(videoUrl)) {
        seenUrls.add(videoUrl);
        xml += `  <url>\n`;
        xml += `    <loc>${videoUrl}</loc>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      }
    }
  }

  xml += `</urlset>`;
  return xml;
};

/**
 * 2. Google News XML Sitemap (/news-sitemap.xml)
 */
export const generateNewsSitemapXml = (articles: WpPost[]): string => {
  const baseUrl = getBaseSiteUrl();
  const indexableArticles = filterIndexableArticles(articles);
  const seenUrls = new Set<string>();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

  // Include recent eligible news items (sorted newest first)
  const sorted = [...indexableArticles].sort((a, b) => {
    return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
  });

  for (const article of sorted) {
    const articleUrl = `${baseUrl}/${escapeXml(article.category)}/${escapeXml(article.slug)}`;
    if (!seenUrls.has(articleUrl)) {
      seenUrls.add(articleUrl);
      const pubDate = article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString();
      const language = article.titleHi ? 'hi' : 'en';

      xml += `  <url>\n`;
      xml += `    <loc>${articleUrl}</loc>\n`;
      xml += `    <news:news>\n`;
      xml += `      <news:publication>\n`;
      xml += `        <news:name>NP News Metro</news:name>\n`;
      xml += `        <news:language>${language}</news:language>\n`;
      xml += `      </news:publication>\n`;
      xml += `      <news:publication_date>${pubDate}</news:publication_date>\n`;
      xml += `      <news:title>${escapeXml(article.seoTitle || article.title)}</news:title>\n`;
      if (article.tags && article.tags.length > 0) {
        xml += `      <news:keywords>${escapeXml(article.tags.slice(0, 5).join(', '))}</news:keywords>\n`;
      }
      xml += `    </news:news>\n`;
      xml += `  </url>\n`;
    }
  }

  xml += `</urlset>`;
  return xml;
};

/**
 * 3. Image XML Sitemap (/image-sitemap.xml)
 */
export const generateImageSitemapXml = (articles: WpPost[]): string => {
  const baseUrl = getBaseSiteUrl();
  const indexableArticles = filterIndexableArticles(articles);
  const publishedWithImages = indexableArticles.filter(a => a.featuredImage && a.featuredImage.startsWith('http'));
  const seenUrls = new Set<string>();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  for (const article of publishedWithImages) {
    const articleUrl = `${baseUrl}/${escapeXml(article.category)}/${escapeXml(article.slug)}`;
    if (!seenUrls.has(articleUrl)) {
      seenUrls.add(articleUrl);
      xml += `  <url>\n`;
      xml += `    <loc>${articleUrl}</loc>\n`;
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(article.featuredImage)}</image:loc>\n`;
      if (article.imageCaption || article.title) {
        xml += `      <image:caption>${escapeXml(article.imageCaption || article.title)}</image:caption>\n`;
      }
      if (article.title) {
        xml += `      <image:title>${escapeXml(article.title)}</image:title>\n`;
      }
      xml += `    </image:image>\n`;
      xml += `  </url>\n`;
    }
  }

  xml += `</urlset>`;
  return xml;
};

/**
 * 4. Video XML Sitemap (/video-sitemap.xml)
 */
export const generateVideoSitemapXml = (videos: WpVideo[]): string => {
  const baseUrl = getBaseSiteUrl();
  const seenUrls = new Set<string>();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n`;

  for (const video of videos) {
    if (video.slug) {
      const videoUrl = `${baseUrl}/videos/${escapeXml(video.slug)}`;
      if (!seenUrls.has(videoUrl)) {
        seenUrls.add(videoUrl);
        const pubDate = video.publishedAt ? new Date(video.publishedAt).toISOString() : new Date().toISOString();
        xml += `  <url>\n`;
        xml += `    <loc>${videoUrl}</loc>\n`;
        xml += `    <video:video>\n`;
        xml += `      <video:thumbnail_loc>${escapeXml(video.posterUrl || 'https://npnewsmetro.com/logo.png')}</video:thumbnail_loc>\n`;
        xml += `      <video:title>${escapeXml(video.title)}</video:title>\n`;
        xml += `      <video:description>${escapeXml(video.caption || video.title)}</video:description>\n`;
        xml += `      <video:player_loc>${escapeXml(video.videoUrl)}</video:player_loc>\n`;
        xml += `      <video:publication_date>${pubDate}</video:publication_date>\n`;
        xml += `      <video:family_friendly>yes</video:family_friendly>\n`;
        xml += `    </video:video>\n`;
        xml += `  </url>\n`;
      }
    }
  }

  xml += `</urlset>`;
  return xml;
};

/**
 * 5. RSS 2.0 Feed (/rss.xml)
 */
export const generateRssXml = (
  articles: WpPost[],
  siteTitle: string = 'NP News Metro',
  siteDescription: string = 'National News, Policy, Governance & Investigative Journalism'
): string => {
  const baseUrl = getBaseSiteUrl();
  const indexableArticles = filterIndexableArticles(articles);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">\n`;
  xml += `  <channel>\n`;
  xml += `    <title>${escapeXml(siteTitle)}</title>\n`;
  xml += `    <link>${baseUrl}</link>\n`;
  xml += `    <description>${escapeXml(siteDescription)}</description>\n`;
  xml += `    <language>en-IN</language>\n`;
  xml += `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;
  xml += `    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />\n`;

  for (const article of indexableArticles) {
    const link = `${baseUrl}/${escapeXml(article.category)}/${escapeXml(article.slug)}`;
    const pubDate = article.publishedAt ? new Date(article.publishedAt).toUTCString() : new Date().toUTCString();

    xml += `    <item>\n`;
    xml += `      <title>${escapeXml(article.title)}</title>\n`;
    xml += `      <link>${link}</link>\n`;
    xml += `      <guid isPermaLink="true">${link}</guid>\n`;
    xml += `      <pubDate>${pubDate}</pubDate>\n`;
    xml += `      <description>${escapeXml(article.dek || article.title)}</description>\n`;
    xml += `      <dc:creator>${escapeXml(article.customAuthor?.name || 'NP News Metro Desk')}</dc:creator>\n`;
    if (article.category) {
      xml += `      <category>${escapeXml(article.category.toUpperCase())}</category>\n`;
    }
    xml += `    </item>\n`;
  }

  xml += `  </channel>\n`;
  xml += `</rss>`;
  return xml;
};

/**
 * 6. Robots.txt (/robots.txt)
 */

export const generateAdsTxt = (publisherId: string = 'pub-0000000000000000'): string => {
  return `# ads.txt - NP News Metro Authorized Digital Sellers
google.com, ${publisherId}, DIRECT, f08c47fec0942fa0
`;
};

export const generateRobotsTxt = (): string => {
  const baseUrl = getBaseSiteUrl();
  return `# Robots.txt - NP News Metro Search Engine Crawler Directives
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin
Disallow: /api/
Disallow: /login
Disallow: /auth/

# Googlebot News Directives
User-agent: Googlebot-News
Allow: /

# XML Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/news-sitemap.xml
Sitemap: ${baseUrl}/image-sitemap.xml
Sitemap: ${baseUrl}/video-sitemap.xml
`;
};

/**
 * Live Sitemap Statistics for Admin Dashboard
 */
export interface SitemapStats {
  mainUrlCount: number;
  newsUrlCount: number;
  imageUrlCount: number;
  videoUrlCount: number;
  publishedArticlesCount: number;
  lastGenerated: string;
  baseUrl: string;
  status: 'active' | 'revalidating' | 'error';
}

export const getSitemapStats = async (): Promise<SitemapStats> => {
  try {
    const baseUrl = getBaseSiteUrl();
    const [livePosts, liveVideos] = await Promise.all([
      getPublishedArticles(),
      getPublishedVideos(),
    ]);

    const indexableArticles = filterIndexableArticles(livePosts);
    const defaultCategoriesCount = 12; // homepage + 12 categories
    const mainCount = 1 + defaultCategoriesCount + indexableArticles.length + liveVideos.length;
    const newsCount = indexableArticles.length;
    const imageCount = indexableArticles.filter(a => a.featuredImage && a.featuredImage.startsWith('http')).length;
    const videoCount = liveVideos.length;

    return {
      mainUrlCount: mainCount,
      newsUrlCount: newsCount,
      imageUrlCount: imageCount,
      videoUrlCount: videoCount,
      publishedArticlesCount: indexableArticles.length,
      lastGenerated: new Date().toISOString(),
      baseUrl,
      status: 'active',
    };
  } catch (err) {
    console.error('Error computing sitemap stats:', err);
    return {
      mainUrlCount: 0,
      newsUrlCount: 0,
      imageUrlCount: 0,
      videoUrlCount: 0,
      publishedArticlesCount: 0,
      lastGenerated: new Date().toISOString(),
      baseUrl: getBaseSiteUrl(),
      status: 'error',
    };
  }
};