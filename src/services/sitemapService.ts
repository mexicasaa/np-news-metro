import { WpPost, WpVideo, WpCategory } from '../types/wordpress';

const SITE_URL = 'https://npnewsmetro.in';

const escapeXml = (unsafe: string): string => {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

export const generateSitemapXml = (
  articles: WpPost[],
  categories: WpCategory[] = [],
  videos: WpVideo[] = []
): string => {
  const publishedArticles = articles.filter(a => (a as any).editorialStatus === 'published' || !(a as any).editorialStatus);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Homepage
  xml += `  <url>\n`;
  xml += `    <loc>${SITE_URL}/</loc>\n`;
  xml += `    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>\n`;
  xml += `    <changefreq>always</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;

  // 2. Desks / Categories
  const defaultCategorySlugs = ['india', 'politics', 'business', 'technology', 'world', 'sports', 'entertainment', 'lifestyle', 'opinion', 'videos', 'photos', 'latest'];
  for (const slug of defaultCategorySlugs) {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/category/${slug}</loc>\n`;
    xml += `    <changefreq>hourly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  // 3. Articles (Only published)
  for (const article of publishedArticles) {
    const pubDate = article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString();
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/${escapeXml(article.category)}/${escapeXml(article.slug)}</loc>\n`;
    xml += `    <lastmod>${pubDate.slice(0, 10)}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;
  }

  // 4. Videos
  for (const video of videos) {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/videos/${escapeXml(video.slug)}</loc>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
};

export const generateNewsSitemapXml = (articles: WpPost[]): string => {
  const publishedArticles = articles.filter(a => (a as any).editorialStatus === 'published' || !(a as any).editorialStatus);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

  for (const article of publishedArticles) {
    const pubDate = article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString();
    const language = article.titleHi ? 'hi' : 'en';

    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/${escapeXml(article.category)}/${escapeXml(article.slug)}</loc>\n`;
    xml += `    <news:news>\n`;
    xml += `      <news:publication>\n`;
    xml += `        <news:name>NP News Metro</news:name>\n`;
    xml += `        <news:language>${language}</news:language>\n`;
    xml += `      </news:publication>\n`;
    xml += `      <news:publication_date>${pubDate}</news:publication_date>\n`;
    xml += `      <news:title>${escapeXml(article.seoTitle || article.title)}</news:title>\n`;
    if (article.tags && article.tags.length > 0) {
      xml += `      <news:keywords>${escapeXml(article.tags.join(', '))}</news:keywords>\n`;
    }
    xml += `    </news:news>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
};

export const generateImageSitemapXml = (articles: WpPost[]): string => {
  const published = articles.filter(a => a.featuredImage);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  for (const article of published) {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/${escapeXml(article.category)}/${escapeXml(article.slug)}</loc>\n`;
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

  xml += `</urlset>`;
  return xml;
};

export const generateVideoSitemapXml = (videos: WpVideo[]): string => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n`;

  for (const video of videos) {
    const pubDate = video.publishedAt ? new Date(video.publishedAt).toISOString() : new Date().toISOString();
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/videos/${escapeXml(video.slug)}</loc>\n`;
    xml += `    <video:video>\n`;
    xml += `      <video:thumbnail_loc>${escapeXml(video.posterUrl)}</video:thumbnail_loc>\n`;
    xml += `      <video:title>${escapeXml(video.title)}</video:title>\n`;
    xml += `      <video:description>${escapeXml(video.caption || video.title)}</video:description>\n`;
    xml += `      <video:player_loc>${escapeXml(video.videoUrl)}</video:player_loc>\n`;
    xml += `      <video:publication_date>${pubDate}</video:publication_date>\n`;
    xml += `      <video:family_friendly>yes</video:family_friendly>\n`;
    xml += `    </video:video>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
};

export const generateRssXml = (
  articles: WpPost[],
  siteTitle: string = 'NP News Metro',
  siteDescription: string = 'National News, Policy, Governance & Investigative Journalism'
): string => {
  const published = articles.filter(a => (a as any).editorialStatus === 'published' || !(a as any).editorialStatus);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">\n`;
  xml += `  <channel>\n`;
  xml += `    <title>${escapeXml(siteTitle)}</title>\n`;
  xml += `    <link>${SITE_URL}</link>\n`;
  xml += `    <description>${escapeXml(siteDescription)}</description>\n`;
  xml += `    <language>en-IN</language>\n`;
  xml += `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;
  xml += `    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />\n`;

  for (const article of published) {
    const link = `${SITE_URL}/${escapeXml(article.category)}/${escapeXml(article.slug)}`;
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

export const generateRobotsTxt = (): string => {
  return `# Robots.txt - NP News Metro Search Engine Crawler Directives
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /wp-admin/
Disallow: /api/private/

# Googlebot News Directives
User-agent: Googlebot-News
Allow: /

# XML Sitemaps
Sitemap: ${SITE_URL}/sitemap.xml
Sitemap: ${SITE_URL}/news-sitemap.xml
Sitemap: ${SITE_URL}/image-sitemap.xml
Sitemap: ${SITE_URL}/video-sitemap.xml
`;
};

export const generateAdsTxt = (publisherId: string = 'pub-0000000000000000'): string => {
  return `# ads.txt - NP News Metro Authorized Digital Sellers
google.com, ${publisherId}, DIRECT, f08c47fec0942fa0
`;
};
