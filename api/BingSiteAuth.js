export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
  res.status(200).send(`<?xml version="1.0"?>
<users>
\t<user>5D7354DDEF89DCEDC3477F001284CE20</user>
</users>`);
}
