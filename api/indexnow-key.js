// @ts-nocheck
export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
  res.status(200).send('968b4404627f469a8e29b9a607c4b1e7');
}
