function sendResponse(res: any, statusCode: number, contentType: string, body: string) {
  res.statusCode = statusCode;
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
  }
  if (typeof res.status === 'function' && typeof res.send === 'function') {
    return res.status(statusCode).send(body);
  }
  return res.end(body);
}

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
  return sendResponse(res, 200, 'text/plain; charset=utf-8', robots);
}
