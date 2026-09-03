// @ts-nocheck
import { buildVideoSitemapXml, sendXmlResponse } from './_sitemapHelper.js';

export default async function handler(req, res) {
  try {
    const xml = buildVideoSitemapXml();
    return sendXmlResponse(res, xml);
  } catch (err) {
    const xml = buildVideoSitemapXml();
    return sendXmlResponse(res, xml);
  }
}
