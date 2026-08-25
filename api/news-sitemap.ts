import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jkzrjqclgqpfjdqxsnut.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprenJqcWNsZ3FwZmpkcXhzbnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NjU0ODksImV4cCI6MjEwMzE0MTQ4OX0.tDPKLptID2tvWKAKstPVr73I7p_cFt3PPGX9AXL4l28';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SITE_URL = 'https://npnewsmetro.com';

function escapeXml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function sendResponse(res: any, statusCode: number, contentType: string, body: string) {
  res.statusCode = statusCode;
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=900, stale-while-revalidate=300');
  }
  if (typeof res.status === 'function' && typeof res.send === 'function') {
    return res.status(statusCode).send(body);
  }
  return res.end(body);
}

export default async function handler(req: any, res: any) {
  try {
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data } = await supabase
      .from('articles')
      .select('title, slug, category_id, published_at')
      .eq('status', 'published')
      .gte('published_at', twoDaysAgo)
      .order('published_at', { ascending: false });

    const articlesXml = (data || []).map((post: any) => `  <url>
    <loc>${SITE_URL}/${post.category_id || 'india'}/${post.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>NP News Metro</news:name>
        <news:language>hi</news:language>
      </news:publication>
      <news:publication_date>${new Date(post.published_at || Date.now()).toISOString()}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
    </news:news>
  </url>`).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${articlesXml}
</urlset>`;

    return sendResponse(res, 200, 'application/xml; charset=utf-8', xml);
  } catch (err: any) {
    return sendResponse(res, 500, 'text/plain; charset=utf-8', 'Error generating news sitemap: ' + err?.message);
  }
}
