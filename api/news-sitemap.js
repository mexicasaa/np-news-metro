// @ts-nocheck
import { fetchLiveArticles, buildNewsSitemapXml, sendXmlResponse } from './_sitemapHelper.js';

export default async function handler(req, res) {
  try {
    const articles = await fetchLiveArticles();
    const xml = buildNewsSitemapXml(articles);
    return sendXmlResponse(res, xml);
  } catch (err) {
    const xml = buildNewsSitemapXml([]);
    return sendXmlResponse(res, xml);
  }
}
