import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jkzrjqclgqpfjdqxsnut.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprenJqcWNsZ3FwZmpkcXhzbnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NjU0ODksImV4cCI6MjEwMzE0MTQ4OX0.tDPKLptID2tvWKAKstPVr73I7p_cFt3PPGX9AXL4l28';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SITE_ORIGIN = 'https://npnewsmetro.com';
const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200';

function getAbsoluteUrl(img?: string): string {
  if (!img || typeof img !== 'string' || !img.trim()) return DEFAULT_OG_IMAGE;
  const trimmed = img.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${SITE_ORIGIN}${cleanPath}`;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

const FALLBACK_SLUGS: Record<string, { title: string; dek: string; category: string; image: string }> = {
  'nayab-saini-patiala-teej': {
    title: 'Haryana CM Nayab Saini Celebrates Teej in Patiala: "Punjab & Haryana Share Timeless Ties of Love and Brotherhood"',
    dek: 'Chief Minister Nayab Saini highlights enduring cultural brotherhood between Punjab and Haryana at Teej celebration in Patiala.',
    category: 'politics',
    image: '/uploads/nayab-saini-patiala-teej.jpg',
  },
  'iskcon-noida-janmashtami-2026': {
    title: 'ISKCON Noida Unveils Grand Janmashtami 2026 Celebrations: 108 Sacred Kalash Maha Abhishek and 5 Lakh Devotees Expected',
    dek: 'ISKCON Sector 33 Noida gears up for historic Janmashtami festival with 1008 Bhog offerings, immersive cultural pavilions, and round-the-clock spiritual festivities.',
    category: 'culture',
    image: '/uploads/iskcon-noida-janmashtami-2026.jpg',
  },
  'dr-deepak-goswami': {
    title: 'Dr. Deepak Goswami: Visionary Leader & Editorial Vanguard at NP News Metro',
    dek: 'Leading investigative journalism and ground reporting across the nation.',
    category: 'india',
    image: '/uploads/dr-deepak-goswami.jpg',
  },
  'sugarcane-ethanol-future-featured': {
    title: 'Sugarcane to Ethanol: The Fuel Revolution Transforming Rural India',
    dek: 'How India bio-energy roadmap is reviving farmer economics and cutting crude imports.',
    category: 'business',
    image: '/uploads/sugarcane-ethanol-future-featured.jpg',
  }
};

export default async function handler(req: any, res: any) {
  try {
    const url = new URL(req.url || '/', SITE_ORIGIN);
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

    let article: any = null;

    if (cleanSlug) {
      try {
        const { data } = await supabase
          .from('articles')
          .select('title, seo_title, excerpt, meta_description, category_id, featured_image_url, published_at, slug')
          .eq('slug', cleanSlug)
          .maybeSingle();

        if (data) {
          article = {
            title: data.seo_title || data.title,
            dek: data.meta_description || data.excerpt || data.title,
            category: cleanCategory,
            image: data.featured_image_url,
            slug: data.slug || cleanSlug,
            publishedAt: data.published_at,
          };
        }
      } catch {
        // Fallback
      }

      if (!article && FALLBACK_SLUGS[cleanSlug]) {
        const f = FALLBACK_SLUGS[cleanSlug];
        article = {
          title: f.title,
          dek: f.dek,
          category: f.category,
          image: f.image,
          slug: cleanSlug,
        };
      }
    }

    const title = article ? article.title : 'NP NEWS METRO — Real News. Real Impact.';
    const description = article ? article.dek : 'Independent, credible digital journalism for modern India.';
    const image = article ? getAbsoluteUrl(article.image) : `${SITE_ORIGIN}/uploads/dr-deepak-goswami.jpg`;
    const category = article ? article.category : cleanCategory;
    const slug = article ? article.slug : cleanSlug;
    const canonicalUrl = slug ? `${SITE_ORIGIN}/${category}/${slug}` : SITE_ORIGIN;

    const html = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} | NP News Metro</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${canonicalUrl}" />

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

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@NPNewsMetro" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${image}" />

  <meta http-equiv="refresh" content="0;url=${canonicalUrl}" />
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <img src="${image}" alt="${escapeHtml(title)}" />
  <p><a href="${canonicalUrl}">Click here to read the full story on NP News Metro...</a></p>
  <script>window.location.replace('${canonicalUrl}');</script>
</body>
</html>`;

    return sendResponse(res, 200, 'text/html; charset=utf-8', html);
  } catch (err: any) {
    return sendResponse(res, 500, 'text/plain; charset=utf-8', 'Error: ' + err?.message);
  }
}
