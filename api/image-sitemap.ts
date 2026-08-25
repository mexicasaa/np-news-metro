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
      .select('title, slug, category_id, featured_image_url')
      .eq('status', 'published')
      .not('featured_image_url', 'is', null)
      .order('published_at', { ascending: false });

    const itemsXml = (data || []).map((post: any) => {
      const imgUrl = post.featured_image_url?.startsWith('http')
        ? post.featured_image_url
        : `${SITE_URL}${post.featured_image_url?.startsWith('/') ? '' : '/'}${post.featured_image_url || 'uploads/dr-deepak-goswami.jpg'}`;

      return `  <url>
    <loc>${SITE_URL}/${post.category_id || 'india'}/${post.slug}</loc>
    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${escapeXml(post.title)}</image:title>
    </image:image>
  </url>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${itemsXml}
</urlset>`;

    return sendResponse(res, 200, 'application/xml; charset=utf-8', xml);
  } catch (err: any) {
    return sendResponse(res, 500, 'text/plain; charset=utf-8', 'Error generating image sitemap: ' + err?.message);
  }
}
