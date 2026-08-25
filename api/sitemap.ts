import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jkzrjqclgqpfjdqxsnut.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprenJqcWNsZ3FwZmpkcXhzbnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NjU0ODksImV4cCI6MjEwMzE0MTQ4OX0.tDPKLptID2tvWKAKstPVr73I7p_cFt3PPGX9AXL4l28';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SITE_URL = 'https://npnewsmetro.com';

function sendResponse(res: any, statusCode: number, contentType: string, body: string) {
  res.statusCode = statusCode;
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=600');
  }
  if (typeof res.status === 'function' && typeof res.send === 'function') {
    return res.status(statusCode).send(body);
  }
  return res.end(body);
}

export default async function handler(req: any, res: any) {
  try {
    const { data } = await supabase
      .from('articles')
      .select('slug, category_id, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    const staticPages = [
      '',
      '/latest',
      '/videos',
      '/photos',
      '/trending',
      '/category/india',
      '/category/politics',
      '/category/business',
      '/category/technology',
      '/category/world',
      '/category/sports',
      '/category/entertainment',
      '/category/lifestyle',
      '/category/opinion',
    ];

    const staticXml = staticPages.map(page => `  <url>
    <loc>${SITE_URL}${page}</loc>
    <changefreq>hourly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n');

    const articlesXml = (data || []).map((post: any) => `  <url>
    <loc>${SITE_URL}/${post.category_id || 'india'}/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at || post.published_at || Date.now()).toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticXml}
${articlesXml}
</urlset>`;

    return sendResponse(res, 200, 'application/xml; charset=utf-8', xml);
  } catch (err: any) {
    return sendResponse(res, 500, 'text/plain; charset=utf-8', 'Error generating sitemap: ' + err?.message);
  }
}
