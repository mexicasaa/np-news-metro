// @ts-nocheck
import { fetchLiveArticles, BASE_URL, DEFAULT_CATEGORIES } from './_sitemapHelper.js';

export const INDEXNOW_KEY = '968b4404627f469a8e29b9a607c4b1e7';
export const INDEXNOW_HOST = 'www.npnewsmetro.com';
export const INDEXNOW_KEY_LOCATION = 'https://www.npnewsmetro.com/968b4404627f469a8e29b9a607c4b1e7.txt';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let urlList = [];

    if (req.method === 'POST' && req.body) {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }
      if (Array.isArray(body.urlList) && body.urlList.length > 0) {
        urlList = body.urlList;
      } else if (Array.isArray(body.urls) && body.urls.length > 0) {
        urlList = body.urls;
      } else if (typeof body.url === 'string' && body.url.trim()) {
        urlList = [body.url.trim()];
      }
    }

    // If no specific URLs provided, assemble recent live articles + categories + homepage
    if (urlList.length === 0) {
      const articles = await fetchLiveArticles();
      const articleUrls = articles.map(a => `${BASE_URL}/${a.category}/${a.slug}`);
      const categoryUrls = DEFAULT_CATEGORIES.map(cat => `${BASE_URL}/category/${cat}`);
      
      urlList = [
        `${BASE_URL}/`,
        ...categoryUrls,
        ...articleUrls
      ];
    }

    // Deduplicate and ensure absolute URLs match host
    urlList = Array.from(new Set(urlList))
      .filter(u => typeof u === 'string' && u.startsWith('http'));

    // Limit to IndexNow batch limit (up to 10,000 per request)
    const submitUrls = urlList.slice(0, 1000);

    const payload = {
      host: INDEXNOW_HOST,
      key: INDEXNOW_KEY,
      keyLocation: INDEXNOW_KEY_LOCATION,
      urlList: submitUrls
    };

    // Submit to IndexNow master endpoint
    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    const responseStatus = response.status;
    const responseText = await response.text();

    const isSuccess = responseStatus === 200 || responseStatus === 202;

    return res.status(isSuccess ? 200 : responseStatus).json({
      success: isSuccess,
      statusCode: responseStatus,
      message: isSuccess 
        ? (responseStatus === 200 ? 'URLs submitted and key verified.' : 'URLs accepted by IndexNow.')
        : `IndexNow responded with status ${responseStatus}`,
      details: responseText || null,
      submittedCount: submitUrls.length,
      urls: submitUrls
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal Server Error during IndexNow submission'
    });
  }
}
