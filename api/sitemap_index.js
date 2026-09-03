// @ts-nocheck
import { buildSitemapIndexXml, sendXmlResponse } from './_sitemapHelper.js';

export default async function handler(req, res) {
  try {
    const xml = buildSitemapIndexXml();
    return sendXmlResponse(res, xml);
  } catch (err) {
    const xml = buildSitemapIndexXml();
    return sendXmlResponse(res, xml);
  }
}
