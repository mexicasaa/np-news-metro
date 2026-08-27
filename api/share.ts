import { createClient } from '@supabase/supabase-js';
import { FALLBACK_ARTICLES } from './_sitemapHelper.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jkzrjqclgqpfjdqxsnut.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprenJqcWNsZ3FwZmpkcXhzbnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NjU0ODksImV4cCI6MjEwMzE0MTQ4OX0.tDPKLptID2tvWKAKstPVr73I7p_cFt3PPGX9AXL4l28';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SITE_ORIGIN = 'https://www.npnewsmetro.com';
const DEFAULT_OG_IMAGE = 'https://www.npnewsmetro.com/uploads/dr-deepak-goswami.jpg';

function getAbsoluteUrl(img) {
  if (!img || typeof img !== 'string' || !img.trim()) return DEFAULT_OG_IMAGE;
  const trimmed = img.trim();
  if (trimmed.includes('supabase.co/storage/v1/object/public/')) {
    const pathAfter = trimmed.split('/storage/v1/object/public/')[1];
    if (pathAfter) {
      return `${SITE_ORIGIN}/api/image/${pathAfter.replace(/^\/+/, '')}`;
    }
    return `${SITE_ORIGIN}/api/image?url=${encodeURIComponent(trimmed)}`;
  }
  if (trimmed.includes('supabase.co/storage/v1/render/image/public/')) {
    const pathAfter = trimmed.split('/storage/v1/render/image/public/')[1]?.split('?')[0];
    if (pathAfter) {
      return `${SITE_ORIGIN}/api/image/${pathAfter.replace(/^\/+/, '')}`;
    }
    return `${SITE_ORIGIN}/api/image?url=${encodeURIComponent(trimmed)}`;
  }
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${SITE_ORIGIN}${cleanPath}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sendResponse(res, statusCode, contentType, body) {
  res.statusCode = statusCode;
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=30');
  }
  if (typeof res.status === 'function' && typeof res.send === 'function') {
    return res.status(statusCode).send(body);
  }
  return res.end(body);
}

const CATEGORY_NAMES = {
  india: 'India & National',
  politics: 'Politics',
  business: 'Business & Economy',
  technology: 'Technology & AI',
  world: 'World News',
  sports: 'Sports',
  entertainment: 'Entertainment',
  lifestyle: 'Lifestyle & Health',
  opinion: 'Opinion & Editorial',
  videos: 'Videos & Broadcasts',
  photos: 'Photo Galleries',
  latest: 'Latest News',
};

const FALLBACK_SLUGS = {
  'nayab-saini-patiala-teej': {
    title: 'Haryana CM Nayab Saini Celebrates Teej in Patiala: "Punjab & Haryana Share Timeless Ties of Love and Brotherhood"',
    dek: 'Chief Minister Nayab Saini highlights enduring cultural brotherhood between Punjab and Haryana at Teej celebration in Patiala.',
    category: 'politics',
    image: '/uploads/nayab-saini-patiala-teej.jpg',
    author: 'NP Newsroom Political Bureau',
    publishedAt: '2026-08-22T16:00:00.000Z',
    paragraphs: [
      'Patiala: Haryana Chief Minister Nayab Singh Saini on Saturday addressed a vibrant gathering at the traditional Teej festival celebrations in Patiala, emphasizing the deep historical, cultural, and emotional bonds shared between Punjab and Haryana.',
      'Addressing the gathering, the Chief Minister remarked that political boundaries cannot diminish the shared civilizational heritage, agricultural traditions, and fraternal affection uniting the people of both states.',
      'Prominent community leaders, social representatives, and cultural troupes attended the event, which featured folk music, traditional swings, and community feasts.'
    ]
  },
  'iskcon-noida-janmashtami-2026': {
    title: 'ISKCON Noida Unveils Grand Janmashtami 2026 Celebrations: 108 Sacred Kalash Maha Abhishek and 5 Lakh Devotees Expected',
    dek: 'ISKCON Sector 33 Noida gears up for historic Janmashtami festival with 1008 Bhog offerings, immersive cultural pavilions, and round-the-clock spiritual festivities.',
    category: 'india',
    image: '/uploads/iskcon-noida-janmashtami-2026.jpg',
    author: 'NP News Metro Cultural Desk',
    publishedAt: '2026-08-22T15:30:00.000Z',
    paragraphs: [
      'Noida: The International Society for Krishna Consciousness (ISKCON) temple at Sector 33, Noida, has announced comprehensive arrangements for the forthcoming Sri Krishna Janmashtami celebrations.',
      'Temple administrators confirmed that over five lakh devotees from across the National Capital Region (NCR) are expected to visit the shrine over the three-day festivities.',
      'Key highlights include the 108 Sacred Kalash Maha Abhishek, 1008 Chhappan Bhog offerings prepared by international chefs, and immersive digital walkthroughs detailing the pastimes of Lord Krishna.'
    ]
  },
  'dr-deepak-goswami': {
    title: 'Dr. Deepak Goswami: Visionary Leader & Editorial Vanguard at NP News Metro',
    dek: 'Leading investigative journalism and ground reporting across the nation.',
    category: 'india',
    image: '/uploads/dr-deepak-goswami.jpg',
    author: 'NP News Metro Editorial Board',
    publishedAt: '2026-08-20T10:00:00.000Z',
    paragraphs: [
      'Dr. Deepak Goswami has been at the forefront of digital news modernization in India, advocating for ethical journalism, investigative depth, and public accountability.',
      'Under his editorial stewardship, NP News Metro has expanded its reporting network to provide rigorous coverage of public policy, rural development, technology, and economic transformation.'
    ]
  },
  'sugarcane-ethanol-future-featured': {
    title: 'Sugarcane to Ethanol: The Fuel Revolution Transforming Rural India',
    dek: 'How India bio-energy roadmap is reviving farmer economics and cutting crude imports.',
    category: 'business',
    image: '/uploads/sugarcane-ethanol-future-featured.jpg',
    author: 'Agri-Business & Energy Bureau',
    publishedAt: '2026-08-22T02:30:00.000Z',
    paragraphs: [
      'New Delhi: India’s accelerated ethanol blending programme is transforming the sugarcane agrarian belt into a renewable energy hub, providing timely liquidity to millions of cane growers while significantly lowering petroleum import bills.',
      'Distillery capacities across Uttar Pradesh, Maharashtra, and Karnataka have undergone massive technological modernization to support dual-feed ethanol manufacturing.',
      'Government policy incentives and guaranteed off-take pricing by Oil Marketing Companies (OMCs) have created a resilient economic ecosystem connecting farmers directly to national energy security.'
    ]
  },
  'cabinet-approves-infrastructure-corridor-western-ports': {
    title: 'Union Cabinet Approves ₹1.2 Lakh Crore Infrastructure Corridor Linking Major Western Ports to Industrial Nodes',
    dek: 'The mega multi-modal logistics grid will slash transit times by 40% and connect key manufacturing hubs to JNPT and Mundra ports.',
    category: 'india',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1200',
    author: 'NP Newsroom Infrastructure Bureau',
    publishedAt: '2026-08-19T02:00:00.000Z',
    paragraphs: [
      'New Delhi: The Union Cabinet on Wednesday gave its approval for a transformative ₹1.2 lakh crore multi-modal freight and industrial corridor connecting vital western maritime gateways directly with Northern and Central industrial clusters.',
      'The corridor integrates dedicated rail freight spines, access-controlled high-speed expressways, and automated multi-modal logistics parks equipped with inland container depots (ICDs).',
      'The project is expected to generate hundreds of thousands of formal employment opportunities and elevate India’s ranking on the global Logistics Performance Index (LPI).'
    ]
  }
};

export default async function handler(req, res) {
  try {
    const url = new URL(req.url || '/', SITE_ORIGIN);
    const rawSlugParam = (req.query?.slug || url.searchParams.get('slug') || '').trim();
    const rawCatParam = (req.query?.category || url.searchParams.get('category') || 'india').trim().toLowerCase();
    const pathParam = (req.query?.path || url.searchParams.get('path') || '').trim();
    const rawVersionParam = (req.query?.v || url.searchParams.get('v') || '').trim();

    let cleanSlug = rawSlugParam;
    let cleanCategory = rawCatParam;

    try {
      if (cleanSlug) cleanSlug = decodeURIComponent(cleanSlug).trim();
      if (cleanCategory) cleanCategory = decodeURIComponent(cleanCategory).trim().toLowerCase();
    } catch (e) {}

    if (!cleanSlug && pathParam) {
      const parts = pathParam.replace(/^\/+|\/+$/g, '').split('/');
      if (parts.length >= 2) {
        cleanCategory = decodeURIComponent(parts[0]).toLowerCase();
        cleanSlug = decodeURIComponent(parts[1]);
      } else if (parts.length === 1) {
        cleanSlug = decodeURIComponent(parts[0]);
      }
    }

    // 1. CATEGORY VIEW PRE-RENDERING
    if ((cleanCategory && !cleanSlug) || cleanCategory === 'category') {
      const targetCat = (cleanSlug || cleanCategory).toLowerCase();
      const catDisplayName = CATEGORY_NAMES[targetCat] || targetCat.toUpperCase();
      const canonicalCatUrl = `${SITE_ORIGIN}/category/${targetCat}`;

      // Fetch recent articles in this category from Supabase
      let catArticles = [];
      try {
        const { data: catData } = await supabase
          .from('articles')
          .select('title, slug, excerpt, featured_image_url, published_at, categories(slug)')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(15);
        if (catData && catData.length > 0) {
          catArticles = catData.filter(a => (a.categories?.slug || 'india').toLowerCase() === targetCat || targetCat === 'latest');
        }
      } catch (e) {}

      // Fallback to FALLBACK_ARTICLES if no DB articles found
      if (catArticles.length === 0) {
        catArticles = FALLBACK_ARTICLES
          .filter(a => a.category.toLowerCase() === targetCat || targetCat === 'latest')
          .slice(0, 15)
          .map(a => ({
            title: a.title,
            slug: a.slug,
            excerpt: a.caption || a.title,
            featured_image_url: a.featuredImage,
            published_at: a.publishedAt,
            categories: { slug: a.category }
          }));
      }

      const catHtml = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(catDisplayName)} News &amp; Latest Analysis | NP News Metro</title>
  <meta name="description" content="Latest breaking headlines, reports, and exclusive analysis in ${escapeHtml(catDisplayName)} from NP News Metro." />
  <link rel="canonical" href="${canonicalCatUrl}" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  <meta name="googlebot-news" content="index, follow" />

  <meta property="og:site_name" content="NP News Metro" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(catDisplayName)} News | NP News Metro" />
  <meta property="og:description" content="Latest breaking headlines and investigative reporting in ${escapeHtml(catDisplayName)}." />
  <meta property="og:url" content="${canonicalCatUrl}" />
  <meta property="og:image" content="${DEFAULT_OG_IMAGE}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@NPNewsMetro" />
  <meta name="twitter:title" content="${escapeHtml(catDisplayName)} News | NP News Metro" />
  <meta name="twitter:description" content="Latest breaking headlines and investigative reporting in ${escapeHtml(catDisplayName)}." />
  <meta name="twitter:image" content="${DEFAULT_OG_IMAGE}" />

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "${escapeHtml(catDisplayName)} News",
    "url": "${canonicalCatUrl}",
    "description": "Latest breaking headlines, reports, and exclusive analysis in ${escapeHtml(catDisplayName)} from NP News Metro.",
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": "NP News Metro",
      "url": "${SITE_ORIGIN}/",
      "logo": {
        "@type": "ImageObject",
        "url": "${SITE_ORIGIN}/logo.png"
      }
    }
  }
  </script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #0f172a; max-width: 1000px; margin: 0 auto; padding: 20px; }
    header { border-bottom: 2px solid #990000; padding-bottom: 12px; margin-bottom: 24px; }
    nav a { margin-right: 14px; text-decoration: none; color: #990000; font-weight: bold; font-size: 14px; }
    h1 { font-family: Georgia, serif; font-size: 28px; color: #0f172a; margin-top: 0; }
    .story-card { border-bottom: 1px solid #e2e8f0; padding: 16px 0; }
    .story-card h2 { font-family: Georgia, serif; font-size: 18px; margin: 0 0 8px 0; }
    .story-card h2 a { color: #0f172a; text-decoration: none; }
    .story-card h2 a:hover { color: #990000; }
    .meta { font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <header>
    <a href="${SITE_ORIGIN}/" style="font-size: 22px; font-family: Georgia, serif; font-weight: bold; color: #990000; text-decoration: none;">NP NEWS METRO</a>
    <nav style="margin-top: 10px;">
      <a href="${SITE_ORIGIN}/">Home</a>
      <a href="${SITE_ORIGIN}/category/india">India</a>
      <a href="${SITE_ORIGIN}/category/politics">Politics</a>
      <a href="${SITE_ORIGIN}/category/business">Business</a>
      <a href="${SITE_ORIGIN}/category/technology">Technology</a>
      <a href="${SITE_ORIGIN}/category/world">World</a>
      <a href="${SITE_ORIGIN}/category/sports">Sports</a>
      <a href="${SITE_ORIGIN}/videos">Videos</a>
      <a href="${SITE_ORIGIN}/latest">Latest</a>
    </nav>
  </header>
  <main>
    <h1>${escapeHtml(catDisplayName)} News &amp; Latest Coverage</h1>
    <p style="color: #64748b; margin-bottom: 24px;">Explore authoritative journalism, policy dispatches, and ground reporting in ${escapeHtml(catDisplayName)}.</p>
    <div class="articles-list">
      ${catArticles.map(a => `
        <article class="story-card">
          <h2><a href="${SITE_ORIGIN}/${(a.categories?.slug || targetCat)}/${escapeHtml(a.slug)}">${escapeHtml(a.title)}</a></h2>
          <p style="color: #475569; font-size: 14px; margin: 4px 0;">${escapeHtml(a.excerpt || a.title)}</p>
          <div class="meta">Published: ${new Date(a.published_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </article>
      `).join('')}
    </div>
  </main>
  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
    &copy; ${new Date().getFullYear()} NP News Metro. All rights reserved. | <a href="${SITE_ORIGIN}/about" style="color: #64748b;">About Us</a> | <a href="${SITE_ORIGIN}/privacy" style="color: #64748b;">Privacy Policy</a> | <a href="${SITE_ORIGIN}/terms" style="color: #64748b;">Terms</a> | <a href="${SITE_ORIGIN}/sitemap.xml" style="color: #64748b;">Sitemap</a>
  </footer>
</body>
</html>`;
      return sendResponse(res, 200, 'text/html; charset=utf-8', catHtml);
    }

    let mediaItem = null;

    // 2. CHECK VIDEOS DESK
    if (cleanCategory === 'videos' && cleanSlug) {
      try {
        const { data: vData } = await supabase
          .from('videos')
          .select('title, description, thumbnail_url, youtube_url, published_at, slug')
          .eq('slug', cleanSlug)
          .maybeSingle();

        if (vData) {
          mediaItem = {
            title: vData.title,
            dek: vData.description || vData.title,
            category: 'videos',
            image: vData.thumbnail_url || `${SITE_ORIGIN}/uploads/dr-deepak-goswami.jpg`,
            slug: vData.slug || cleanSlug,
            type: 'video.other',
            videoUrl: vData.youtube_url,
            publishedAt: vData.published_at || new Date().toISOString(),
            author: 'NP News Metro Video Bureau',
            paragraphs: [vData.description || vData.title]
          };
        }
      } catch (e) {}
    }

    // 3. CHECK ARTICLES IN SUPABASE
    if (!mediaItem && cleanSlug) {
      try {
        let { data } = await supabase
          .from('articles')
          .select(`
            title, 
            seo_title, 
            excerpt, 
            meta_description, 
            content,
            blocks,
            category_id, 
            featured_image_url, 
            featured_image_caption,
            author_name,
            author_role,
            custom_author,
            published_at, 
            updated_at,
            slug,
            categories (slug, name)
          `)
          .eq('slug', cleanSlug)
          .maybeSingle();

        // Fallback: If not found with decoded slug, try rawSlugParam or lowercase
        if (!data && rawSlugParam && rawSlugParam !== cleanSlug) {
          const { data: rawData } = await supabase
            .from('articles')
            .select(`
              title, 
              seo_title, 
              excerpt, 
              meta_description, 
              content,
              blocks,
              category_id, 
              featured_image_url, 
              featured_image_caption,
              author_name,
              author_role,
              custom_author,
              published_at, 
              updated_at,
              slug,
              categories (slug, name)
            `)
            .eq('slug', rawSlugParam)
            .maybeSingle();
          if (rawData) data = rawData;
        }

        if (data) {
          const resolvedCat = (data.categories && data.categories.slug) ? data.categories.slug : cleanCategory;
          let bodyParagraphs = [];

          if (Array.isArray(data.blocks) && data.blocks.length > 0) {
            bodyParagraphs = data.blocks
              .filter(b => b.type === 'paragraph' && b.content)
              .map(b => b.content);
          }
          if (bodyParagraphs.length === 0 && data.content) {
            bodyParagraphs = String(data.content)
              .split(/\n\s*\n/)
              .map(p => p.trim())
              .filter(Boolean);
          }
          if (bodyParagraphs.length === 0 && (data.meta_description || data.excerpt)) {
            bodyParagraphs = [data.meta_description || data.excerpt];
          }

          const authorName = data.custom_author?.name || data.author_name || 'NP News Metro Bureau';

          mediaItem = {
            title: data.seo_title || data.title,
            dek: data.meta_description || data.excerpt || data.title,
            category: resolvedCat || 'india',
            image: data.featured_image_url,
            caption: data.featured_image_caption || data.title,
            slug: data.slug || cleanSlug,
            publishedAt: data.published_at || new Date().toISOString(),
            modifiedAt: data.updated_at || data.published_at || new Date().toISOString(),
            author: authorName,
            authorRole: data.custom_author?.role || data.author_role || 'Staff Journalist',
            paragraphs: bodyParagraphs,
            type: 'article',
          };
        }
      } catch (e) {}

      // Check FALLBACK_ARTICLES from _sitemapHelper if not found in db
      if (!mediaItem) {
        const mockArticle = FALLBACK_ARTICLES.find(p => p.slug === cleanSlug);
        if (mockArticle) {
          mediaItem = {
            title: mockArticle.title,
            dek: mockArticle.caption || mockArticle.title,
            category: mockArticle.category,
            image: mockArticle.featuredImage,
            caption: mockArticle.caption || mockArticle.title,
            slug: cleanSlug,
            publishedAt: mockArticle.publishedAt || new Date().toISOString(),
            modifiedAt: mockArticle.publishedAt || new Date().toISOString(),
            author: 'NP News Metro Bureau',
            authorRole: 'Editorial Desk',
            paragraphs: [mockArticle.caption || mockArticle.title],
            type: 'article',
          };
        }
      }

      // Check legacy FALLBACK_SLUGS
      if (!mediaItem && FALLBACK_SLUGS[cleanSlug]) {
        const f = FALLBACK_SLUGS[cleanSlug];
        mediaItem = {
          title: f.title,
          dek: f.dek,
          category: f.category,
          image: f.image,
          caption: f.title,
          slug: cleanSlug,
          publishedAt: f.publishedAt || new Date().toISOString(),
          modifiedAt: f.publishedAt || new Date().toISOString(),
          author: f.author || 'NP News Metro Bureau',
          authorRole: 'Editorial Desk',
          paragraphs: f.paragraphs || [f.dek],
          type: 'article',
        };
      }
    }

    // 4. IF ARTICLE/MEDIA ITEM NOT FOUND -> FALLBACK TO GENERIC METADATA
    if (!mediaItem && cleanSlug) {
      mediaItem = {
        title: 'NP News Metro - Real News. Real Impact.',
        dek: 'Independent, credible digital journalism for modern India.',
        category: 'latest',
        image: DEFAULT_OG_IMAGE,
        caption: 'NP News Metro',
        slug: cleanSlug,
        publishedAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        author: 'NP News Metro',
        authorRole: 'Editorial',
        paragraphs: ['Independent, credible digital journalism for modern India.'],
        type: 'website'
      };
    }

    // 5. CONSTRUCT CANONICAL METADATA FOR VALID STORY
    const title = mediaItem ? mediaItem.title : 'NP NEWS METRO — Real News. Real Impact.';
    const description = mediaItem ? mediaItem.dek : 'Independent, credible digital journalism for modern India.';
    const image = mediaItem ? getAbsoluteUrl(mediaItem.image) : DEFAULT_OG_IMAGE;
    const category = mediaItem ? mediaItem.category : cleanCategory;
    const slug = mediaItem ? mediaItem.slug : cleanSlug;
    const isVideo = category === 'videos';
    const canonicalUrl = slug 
      ? (isVideo ? `${SITE_ORIGIN}/videos/${slug}` : `${SITE_ORIGIN}/${category}/${slug}`)
      : `${SITE_ORIGIN}/`;
    const shareUrl = rawVersionParam 
      ? `${canonicalUrl}?v=${encodeURIComponent(rawVersionParam)}` 
      : canonicalUrl;
    const publishedIso = mediaItem?.publishedAt || new Date().toISOString();
    const modifiedIso = mediaItem?.modifiedAt || publishedIso;
    const authorName = mediaItem?.author || 'NP News Metro Bureau';
    const authorRole = mediaItem?.authorRole || 'Staff Journalist';
    const paragraphs = mediaItem?.paragraphs || [description];

    // Schema.org Structured Data
    const structuredData = isVideo ? {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: title,
      description: description,
      thumbnailUrl: [image],
      uploadDate: publishedIso,
      contentUrl: mediaItem.videoUrl || canonicalUrl,
      publisher: {
        '@type': 'NewsMediaOrganization',
        name: 'NP News Metro',
        url: `${SITE_ORIGIN}/`,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_ORIGIN}/logo.png`
        }
      }
    } : {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
      headline: title,
      description: description,
      image: [image],
      datePublished: publishedIso,
      dateModified: modifiedIso,
      author: [
        {
          '@type': 'Person',
          name: authorName,
          jobTitle: authorRole,
        }
      ],
      publisher: {
        '@type': 'NewsMediaOrganization',
        name: 'NP News Metro',
        url: `${SITE_ORIGIN}/`,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_ORIGIN}/logo.png`
        }
      },
      articleSection: category.toUpperCase(),
      inLanguage: /[\u0900-\u097F]/.test(title) ? 'hi-IN' : 'en-IN'
    };

    const breadcrumbsData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: CATEGORY_NAMES[category] || category.toUpperCase(), item: `${SITE_ORIGIN}/category/${category}` },
        { '@type': 'ListItem', position: 3, name: title, item: canonicalUrl }
      ]
    };

    const html = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} | NP News Metro</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  <meta name="googlebot-news" content="index, follow" />

  <meta property="og:site_name" content="NP News Metro" />
  <meta property="og:type" content="${mediaItem?.type || 'article'}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${shareUrl}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:url" content="${image}" />
  <meta property="og:image:secure_url" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:alt" content="${escapeHtml(title)}" />
  <meta property="article:published_time" content="${publishedIso}" />
  <meta property="article:modified_time" content="${modifiedIso}" />
  <meta property="article:section" content="${escapeHtml(category.toUpperCase())}" />
  <meta property="article:author" content="${escapeHtml(authorName)}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@NPNewsMetro" />
  <meta name="twitter:creator" content="@NPNewsMetro" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:url" content="${shareUrl}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:image:src" content="${image}" />
  <link rel="image_src" href="${image}" />

  <script type="application/ld+json">
  ${JSON.stringify(structuredData, null, 2)}
  </script>
  <script type="application/ld+json">
  ${JSON.stringify(breadcrumbsData, null, 2)}
  </script>

  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.7; color: #0f172a; max-width: 860px; margin: 0 auto; padding: 20px; background-color: #faf8f5; }
    header { border-bottom: 2px solid #990000; padding-bottom: 12px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; }
    .brand { font-family: Georgia, serif; font-size: 24px; font-weight: 800; color: #990000; text-decoration: none; }
    nav a { margin-left: 14px; text-decoration: none; color: #334155; font-size: 13px; font-weight: 600; text-transform: uppercase; }
    nav a:hover { color: #990000; }
    .breadcrumbs { font-size: 12px; color: #64748b; margin-bottom: 16px; text-transform: uppercase; font-weight: 600; }
    .breadcrumbs a { color: #990000; text-decoration: none; }
    h1 { font-family: Georgia, serif; font-size: 32px; line-height: 1.25; color: #0f172a; margin: 12px 0; font-weight: 800; }
    .dek { font-size: 18px; color: #475569; line-height: 1.5; margin-bottom: 20px; font-weight: 400; border-left: 4px solid #990000; padding-left: 14px; }
    .byline { font-size: 13px; color: #64748b; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; }
    .featured-img { width: 100%; height: auto; border-radius: 4px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 8px; }
    .caption { font-size: 12px; color: #64748b; font-style: italic; margin-bottom: 28px; }
    .article-body p { font-size: 17px; line-height: 1.8; margin-bottom: 20px; color: #1e293b; }
    footer { margin-top: 50px; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; text-align: center; }
    footer a { color: #64748b; text-decoration: none; margin: 0 8px; }
  </style>
</head>
<body>
  <header>
    <a href="${SITE_ORIGIN}/" class="brand">NP NEWS METRO</a>
    <nav>
      <a href="${SITE_ORIGIN}/">Home</a>
      <a href="${SITE_ORIGIN}/category/india">India</a>
      <a href="${SITE_ORIGIN}/category/politics">Politics</a>
      <a href="${SITE_ORIGIN}/category/business">Business</a>
      <a href="${SITE_ORIGIN}/category/technology">Tech</a>
      <a href="${SITE_ORIGIN}/category/world">World</a>
      <a href="${SITE_ORIGIN}/category/sports">Sports</a>
      <a href="${SITE_ORIGIN}/videos">Videos</a>
      <a href="${SITE_ORIGIN}/latest">Latest</a>
    </nav>
  </header>

  <main>
    <div class="breadcrumbs">
      <a href="${SITE_ORIGIN}/">Home</a> &rsaquo; 
      <a href="${SITE_ORIGIN}/category/${category}">${escapeHtml(category.toUpperCase())}</a> &rsaquo; 
      <span>Report</span>
    </div>

    <article>
      <h1>${escapeHtml(title)}</h1>
      <p class="dek">${escapeHtml(description)}</p>
      <div class="byline">
        <strong>By ${escapeHtml(authorName)}</strong> &bull; ${escapeHtml(authorRole)} &bull; Published on ${new Date(publishedIso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
      </div>

      <img src="${image}" alt="${escapeHtml(title)}" class="featured-img" />
      <div class="caption">${escapeHtml(mediaItem?.caption || title)} &bull; Credit: NP News Metro Photo Desk</div>

      <div class="article-body">
        ${paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('\n        ')}
      </div>
    </article>
  </main>

  <footer>
    <p>&copy; ${new Date().getFullYear()} NP News Metro. Real News. Real Impact. All rights reserved.</p>
    <p>
      <a href="${SITE_ORIGIN}/about">About Us</a> &bull; 
      <a href="${SITE_ORIGIN}/editorial-team">Masthead</a> &bull; 
      <a href="${SITE_ORIGIN}/ethics">Code of Ethics</a> &bull; 
      <a href="${SITE_ORIGIN}/corrections">Corrections Policy</a> &bull; 
      <a href="${SITE_ORIGIN}/privacy">Privacy Policy</a> &bull; 
      <a href="${SITE_ORIGIN}/terms">Terms</a> &bull; 
      <a href="${SITE_ORIGIN}/sitemap.xml">XML Sitemap</a>
    </p>
  </footer>
</body>
</html>`;

    return sendResponse(res, 200, 'text/html; charset=utf-8', html);
  } catch (err) {
    return sendResponse(res, 500, 'text/plain; charset=utf-8', 'Server Error: ' + err?.message);
  }
}

