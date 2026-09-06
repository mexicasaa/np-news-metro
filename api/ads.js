// @ts-nocheck
import './_suppressWarnings.js';
import engagementHandler from './engagement.js';

export default async function handler(req, res) {
  req.query = req.query || {};
  req.query.action = 'ads';
  return engagementHandler(req, res);
}
