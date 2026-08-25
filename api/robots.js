import { buildRobotsTxt, sendTextResponse } from './_sitemapHelper.js';

export default async function handler(req, res) {
  try {
    const text = buildRobotsTxt();
    return sendTextResponse(res, text);
  } catch (err) {
    const text = buildRobotsTxt();
    return sendTextResponse(res, text);
  }
}
