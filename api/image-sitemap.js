import { fetchLiveArticles, buildImageSitemapXml, sendXmlResponse } from './_sitemapHelper.js';

export default async function handler(req, res) {
  try {
    const articles = await fetchLiveArticles();
    const xml = buildImageSitemapXml(articles);
    return sendXmlResponse(res, xml);
  } catch (err) {
    const xml = buildImageSitemapXml([]);
    return sendXmlResponse(res, xml);
  }
}
