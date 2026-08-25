export default function handler(req: any, res: any) {
  const robots = `User-agent: *
Allow: /

# Googlebot News Directives
User-agent: Googlebot-News
Allow: /

# Sitemaps
Sitemap: https://npnewsmetro.com/sitemap.xml
Sitemap: https://npnewsmetro.com/news-sitemap.xml
Sitemap: https://npnewsmetro.com/image-sitemap.xml
Sitemap: https://npnewsmetro.com/video-sitemap.xml
Sitemap: https://npnewsmetro.com/rss.xml
`;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=3600');
  return res.status(200).send(robots);
}
