import { fetchLiveArticles, buildRssXml, sendXmlResponse } from './_sitemapHelper.js';

export default async function handler(req, res) {
  try {
    const articles = await fetchLiveArticles();
    const xml = buildRssXml(articles);
    return sendXmlResponse(res, xml);
  } catch (err) {
    const xml = buildRssXml([]);
    return sendXmlResponse(res, xml);
  }
}
