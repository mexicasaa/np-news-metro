import { createClient } from '@supabase/supabase-js';
import { mockPosts } from '../src/data/mockWpData';
import { mapDbToWpPost } from '../src/services/articleService';
import { getAbsoluteImageUrl } from '../src/utils/shareUtils';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jkzrjqclgqpfjdqxsnut.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprenJqcWNsZ3FwZmpkcXhzbnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NjU0ODksImV4cCI6MjEwMzE0MTQ4OX0.tDPKLptID2tvWKAKstPVr73I7p_cFt3PPGX9AXL4l28';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SITE_ORIGIN = 'https://npnewsmetro.com';

export default async function handler(req: any, res: any) {
  try {
    const url = new URL(req.url || '/', 'https://npnewsmetro.com');
    const slugParam = req.query?.slug || url.searchParams.get('slug') || '';
    const categoryParam = req.query?.category || url.searchParams.get('category') || 'india';
    const pathParam = req.query?.path || url.searchParams.get('path') || '';

    let cleanSlug = slugParam;
    let cleanCategory = categoryParam;

    if (!cleanSlug && pathParam) {
      const parts = pathParam.replace(/^\/+|\/+$/g, '').split('/');
      if (parts.length >= 2) {
        cleanCategory = parts[0];
        cleanSlug = parts[1];
      } else if (parts.length === 1) {
        cleanSlug = parts[0];
      }
    }

    let post: any = null;

    if (cleanSlug) {
      // 1. Try fetching from Supabase database
      try {
        const { data } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', cleanSlug)
          .single();

        if (data) {
          post = mapDbToWpPost(data);
        }
      } catch {
        // Fallback to mock data
      }

      // 2. Try matching in mock posts
      if (!post) {
        post = mockPosts.find(p => p.slug === cleanSlug || p.id === cleanSlug);
      }
    }

    // Default Fallback values if post not matched
    const title = post ? (post.seoTitle || post.title) : 'NP NEWS METRO — Real News. Real Impact.';
    const description = post ? (post.seoDescription || post.dek || post.title) : 'Independent, credible digital journalism for modern India.';
    const image = post ? getAbsoluteImageUrl(post.featuredImage, SITE_ORIGIN) : `${SITE_ORIGIN}/uploads/dr-deepak-goswami.jpg`;
    const category = post?.category || cleanCategory || 'india';
    const canonicalUrl = post ? `${SITE_ORIGIN}/${category}/${post.slug}` : `${SITE_ORIGIN}/${cleanCategory}/${cleanSlug || ''}`;
    const authorName = post?.customAuthor?.name || 'NP News Metro Bureau';
    const publishedTime = post?.publishedAt || new Date().toISOString();

    const html = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} | NP News Metro</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${canonicalUrl}" />

  <!-- Open Graph / WhatsApp / Facebook / LinkedIn Previews -->
  <meta property="og:site_name" content="NP News Metro" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:secure_url" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:alt" content="${escapeHtml(title)}" />
  
  <!-- Article Metadata -->
  <meta property="article:published_time" content="${publishedTime}" />
  <meta property="article:author" content="${escapeHtml(authorName)}" />
  <meta property="article:section" content="${category.toUpperCase()}" />

  <!-- Twitter / X Cards -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@NPNewsMetro" />
  <meta name="twitter:creator" content="@NPNewsMetro" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:image:src" content="${image}" />

  <meta http-equiv="refresh" content="0;url=${canonicalUrl}" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; color: #1e293b; }
    img { max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0; }
    h1 { font-size: 1.75rem; line-height: 1.3; }
    p { font-size: 1.1rem; line-height: 1.6; color: #475569; }
    a { color: #0284c7; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <img src="${image}" alt="${escapeHtml(title)}" />
  <p><a href="${canonicalUrl}">Click here if you are not redirected automatically...</a></p>
  <script>
    if (typeof window !== 'undefined') {
      window.location.replace('${canonicalUrl}');
    }
  </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
    return res.status(200).send(html);
  } catch (err: any) {
    res.setHeader('Content-Type', 'text/plain');
    return res.status(500).send('Error rendering share preview: ' + err?.message);
  }
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
