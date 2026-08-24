import { generateRobotsTxt } from '../src/services/sitemapService';

export default function handler(req: any, res: any) {
  const robots = generateRobotsTxt();
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=3600');
  return res.status(200).send(robots);
}
