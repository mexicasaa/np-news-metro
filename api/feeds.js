// @ts-nocheck
import './_suppressWarnings.js';
import {
  fetchLiveArticles,
  buildSitemapIndexXml,
  buildMainSitemapXml,
  buildNewsSitemapXml,
  buildImageSitemapXml,
  buildVideoSitemapXml,
  buildRssXml,
  buildRobotsTxt,
  sendXmlResponse,
  sendTextResponse,
  DEFAULT_CATEGORIES,
  BASE_URL
} from './_sitemapHelper.js';

export default async function handler(req, res) {
  const type = req.query?.type || 'index';

  // 1. Static Text/Auth Handlers
  if (type === 'BingSiteAuth') {
    return sendXmlResponse(res, `<?xml version="1.0"?>
<users>
  <user>A6AC5AC0DF7666DF72BEE1DC1E1D94C0</user>
</users>`);
  }

  if (type === 'indexnow-key') {
    return sendTextResponse(res, '968b4404627f469a8e29b9a607c4b1e7');
  }

  if (type === 'robots') {
    return sendTextResponse(res, buildRobotsTxt());
  }

  // 2. Video Sitemap (Doesn't require article list)
  if (type === 'video') {
    return sendXmlResponse(res, buildVideoSitemapXml());
  }

  // 3. Sitemap Index
  if (type === 'index') {
    return sendXmlResponse(res, buildSitemapIndexXml());
  }

  // 4. IndexNow Submission Webhook/Trigger
  if (type === 'indexnow') {
    if (req.method !== 'POST' && req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
      const articles = await fetchLiveArticles();
      const recentUrls = articles.slice(0, 50).map(a => `${BASE_URL}/${a.category || 'india'}/${a.slug}`);
      const categoryUrls = DEFAULT_CATEGORIES.map(c => `${BASE_URL}/category/${c}`);
      const urlList = [BASE_URL, ...categoryUrls, ...recentUrls];

      const payload = {
        host: 'www.npnewsmetro.com',
        key: '968b4404627f469a8e29b9a607c4b1e7',
        keyLocation: 'https://www.npnewsmetro.com/968b4404627f469a8e29b9a607c4b1e7.txt',
        urlList: urlList.slice(0, 100)
      };

      const response = await fetch('https://api.indexnow.org/IndexNow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
      });

      return res.status(200).json({
        success: true,
        status: response.status,
        submittedUrlsCount: payload.urlList.length
      });
    } catch (err) {
      return res.status(500).json({ error: err.message || 'IndexNow submission failed' });
    }
  }

  // 5. Article-based Sitemaps & Feeds
  try {
    const articles = await fetchLiveArticles();

    if (type === 'news') {
      return sendXmlResponse(res, buildNewsSitemapXml(articles));
    }
    if (type === 'image') {
      return sendXmlResponse(res, buildImageSitemapXml(articles));
    }
    if (type === 'rss') {
      return sendXmlResponse(res, buildRssXml(articles));
    }
    // Default: Main sitemap
    return sendXmlResponse(res, buildMainSitemapXml(articles));
  } catch (err) {
    console.error(`Error generating feed [${type}]:`, err);
    return res.status(500).send('Internal Server Error generating feed: ' + (err?.message || err));
  }
}
