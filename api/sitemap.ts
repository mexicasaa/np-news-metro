import { createClient } from '@supabase/supabase-js';
import { generateSitemapXml } from '../src/services/sitemapService';
import { mapDbToWpPost } from '../src/services/articleService';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jkzrjqclgqpfjdqxsnut.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprenJqcWNsZ3FwZmpkcXhzbnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NjU0ODksImV4cCI6MjEwMzE0MTQ4OX0.tDPKLptID2tvWKAKstPVr73I7p_cFt3PPGX9AXL4l28';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: any, res: any) {
  try {
    const [articlesRes, videosRes] = await Promise.all([
      supabase.from('articles').select('*').eq('status', 'published').order('published_at', { ascending: false }),
      supabase.from('videos').select('*').eq('is_published', true).order('published_at', { ascending: false })
    ]);

    const articles = (articlesRes.data || []).map(row => mapDbToWpPost(row));
    const videos = (videosRes.data || []).map(row => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      videoUrl: row.video_url,
      posterUrl: row.thumbnail_url,
      caption: row.description,
      publishedAt: row.published_at,
    }));

    const xml = generateSitemapXml(articles, [], videos as any);

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
    return res.status(200).send(xml);
  } catch (err: any) {
    res.setHeader('Content-Type', 'text/plain');
    return res.status(500).send('Error generating sitemap: ' + err?.message);
  }
}
