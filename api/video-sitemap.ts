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
      .from('videos')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    const itemsXml = (data || []).map((video: any) => `  <url>
    <loc>${SITE_URL}/videos/${video.slug}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeXml(video.thumbnail_url || `${SITE_URL}/uploads/dr-deepak-goswami.jpg`)}</video:thumbnail_loc>
      <video:title>${escapeXml(video.title)}</video:title>
      <video:description>${escapeXml(video.description || video.title)}</video:description>
      <video:player_loc>${escapeXml(video.video_url || '')}</video:player_loc>
      <video:publication_date>${new Date(video.published_at || Date.now()).toISOString()}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
    </video:video>
  </url>`).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${itemsXml}
</urlset>`;

    return sendResponse(res, 200, 'application/xml; charset=utf-8', xml);
  } catch (err: any) {
    return sendResponse(res, 500, 'text/plain; charset=utf-8', 'Error generating video sitemap: ' + err?.message);
  }
}
