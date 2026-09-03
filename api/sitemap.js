// @ts-nocheck
import { fetchLiveArticles, buildMainSitemapXml, sendXmlResponse } from './_sitemapHelper.js';

export default async function handler(req, res) {
  try {
    const articles = await fetchLiveArticles();
    const xml = buildMainSitemapXml(articles);
    return sendXmlResponse(res, xml);
  } catch (err) {
    const xml = buildMainSitemapXml([]);
    return sendXmlResponse(res, xml);
  }
}
