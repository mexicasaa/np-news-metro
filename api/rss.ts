import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jkzrjqclgqpfjdqxsnut.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprenJqcWNsZ3FwZmpkcXhzbnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NjU0ODksImV4cCI6MjEwMzE0MTQ4OX0.tDPKLptID2tvWKAKstPVr73I7p_cFt3PPGX9AXL4l28';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SITE_URL = 'https://npnewsmetro.com';

function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default async function handler(req: any, res: any) {
  try {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(50);

    const itemsXml = (data || []).map((post: any) => {
      const url = `${SITE_URL}/${post.category_id || 'india'}/${post.slug}`;
      const pubDate = post.published_at ? new Date(post.published_at).toUTCString() : new Date().toUTCString();
      const image = post.featured_image_url || `${SITE_URL}/uploads/dr-deepak-goswami.jpg`;

      return `    <item>
      <title>${escapeXml(post.seo_title || post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.meta_description || post.excerpt || post.title)}</description>
      <pubDate>${pubDate}</pubDate>
      <enclosure url="${escapeXml(image)}" type="image/jpeg" length="0" />
    </item>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>NP News Metro — Live RSS Feed</title>
    <link>${SITE_URL}</link>
    <description>Fast, verified, and in-depth national news coverage and investigative journalism.</description>
    <language>hi-IN</language>
    <atom:link href="${SITE_URL}/api/rss" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=300');
    return res.status(200).send(xml);
  } catch (err: any) {
    res.setHeader('Content-Type', 'text/plain');
    return res.status(500).send('Error generating RSS feed: ' + err?.message);
  }
}
