import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jkzrjqclgqpfjdqxsnut.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprenJqcWNsZ3FwZmpkcXhzbnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NjU0ODksImV4cCI6MjEwMzE0MTQ4OX0.tDPKLptID2tvWKAKstPVr73I7p_cFt3PPGX9AXL4l28';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const BASE_URL = 'https://www.npnewsmetro.com';

export const escapeXml = (unsafe) => {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

export const DEFAULT_CATEGORIES = [
  'india', 'politics', 'business', 'economy', 'technology', 'world',
  'sports', 'entertainment', 'lifestyle', 'opinion'
];

export const FALLBACK_ARTICLES = [
  {
    slug: 'india-strategic-ai-infrastructure-corridor',
    category: 'technology',
    title: 'India Announces Strategic AI Infrastructure Corridor With $12B Clean Energy Backing',
    publishedAt: '2026-08-24T06:00:44.556Z',
    featuredImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200',
    caption: 'High-density server architecture in the new hyperscale corridor.',
    tags: ['Technology & AI', 'Infrastructure']
  },
  {
    slug: 'nayab-saini-ka-bhagwant-mann-par-hamla-sirf-chutkule-sunakar-time-pass',
    category: 'politics',
    title: 'Haryana CM Nayab Saini Attacks Bhagwant Mann: "Punjab CM is Just Killing Time by Cracking Jokes"',
    publishedAt: '2026-08-22T16:00:00.000Z',
    featuredImage: 'https://www.npnewsmetro.com/uploads/nayab-saini-patiala-teej.jpg',
    caption: 'Haryana CM Nayab Saini at Teej celebration.',
    tags: ['नायब सिंह सैनी', 'भगवंत मान', 'पंजाब राजनीति']
  },
  {
    slug: 'iskcon-noida-me-bhavya-janmashtami-mahotsav-5-lakh-shradhalu',
    category: 'india',
    title: 'Grand Sri Krishna Janmashtami Mahotsav at ISKCON Noida: Over 5 Lakh Devotees Expected',
    publishedAt: '2026-08-22T15:30:00.000Z',
    featuredImage: 'https://www.npnewsmetro.com/uploads/iskcon-noida-janmashtami-2026.jpg',
    caption: 'ISKCON Noida Janmashtami preparations.',
    tags: ['इस्कॉन नोएडा', 'श्रीकृष्ण जन्माष्टमी', 'शोभायात्रा']
  },
  {
    slug: 'ganne-ke-ras-ki-ek-boond-me-uljha-desh-ka-bhavishya',
    category: 'economy',
    title: 'Tangled in a Single Drop of Sugarcane Juice: The Future of the Nation',
    publishedAt: '2026-08-22T02:30:00.000Z',
    featuredImage: 'https://www.npnewsmetro.com/uploads/sugarcane-ethanol-future-featured.jpg',
    caption: 'Sugarcane to ethanol transformation.',
    tags: ['गन्ना किसान', 'एथेनॉल', 'ऊर्जा नीति']
  },
  {
    slug: 'cabinet-approves-infrastructure-corridor-western-ports',
    category: 'india',
    title: 'Union Cabinet Approves ₹1.2 Lakh Crore Infrastructure Corridor Linking Major Western Ports to Industrial Nodes',
    publishedAt: '2026-08-19T02:00:00.000Z',
    featuredImage: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1200',
    caption: 'Freight lines and automated terminal logistics under construction at JNPT.',
    tags: ['Infrastructure', 'Logistics', 'Cabinet Decision']
  },
  {
    slug: 'election-commission-announces-assembly-poll-dates-schedule',
    category: 'politics',
    title: 'Election Commission Announces Schedule for Five Key State Assembly Polls; Voting Across Three Phases Starting November 12',
    publishedAt: '2026-08-19T04:30:00.000Z',
    featuredImage: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=1200',
    caption: 'Chief Election Commissioner addressing press conference.',
    tags: ['Election Commission', 'State Polls', 'Assembly Elections']
  },
  {
    slug: 'rethinking-urban-density-india-megacities-polycentric-transit',
    category: 'opinion',
    title: 'Rethinking Urban Density: Why India’s Megacities Need Polycentric Transit, Not Just Taller Towers',
    publishedAt: '2026-08-18T12:30:00.000Z',
    featuredImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200',
    caption: 'High-rise residential and commercial density along transit spine.',
    tags: ['Urban Planning', 'Sustainability', 'Climate']
  },
  {
    slug: 'retail-inflation-moderates-july-cpi-food-supply-rbi',
    category: 'economy',
    title: 'Retail Inflation Moderates to 3.8% in July as Food Supply Chains Stabilize; RBI Stance Unchanged',
    publishedAt: '2026-08-19T00:45:00.000Z',
    featuredImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200',
    caption: 'Vegetable wholesale markets in Navi Mumbai.',
    tags: ['Inflation', 'CPI', 'RBI', 'Monetary Policy']
  },
  {
    slug: 'india-first-commercial-semiconductor-fab-dholera-gujarat',
    category: 'technology',
    title: 'India’s First Commercial 28nm Fabrication Facility Begins Tool Installation at Dholera Special Investment Region',
    publishedAt: '2026-08-18T08:50:00.000Z',
    featuredImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200',
    caption: 'High-precision cleanroom fabrication machinery.',
    tags: ['Semiconductors', 'Dholera', 'Make In India']
  },
  {
    slug: 'sensex-nifty-all-time-high-fii-inflows-corporate-earnings',
    category: 'business',
    title: 'Sensex Scales Historic 85,000 Mark on Strong Foreign Institutional Inflows and Robust Q1 Corporate Earnings',
    publishedAt: '2026-08-19T06:00:00.000Z',
    featuredImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1200',
    caption: 'Traders monitoring real-time stock ticker indices at BSE.',
    tags: ['Sensex', 'Nifty', 'Stock Markets']
  },
  {
    slug: 'global-maritime-trade-alliance-red-sea-security-protocol',
    category: 'world',
    title: 'Global Maritime Trade Alliance Finalizes New Red Sea Security Escort Protocol Ahead of UN Assembly',
    publishedAt: '2026-08-18T16:45:00.000Z',
    featuredImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1200',
    caption: 'International naval frigates coordinating maritime corridor protection.',
    tags: ['Global Trade', 'Maritime Security', 'United Nations']
  },
  {
    slug: 'india-england-lords-test-match-pace-bowling-series-win',
    category: 'sports',
    title: 'Indian Cricket Team Clinches Historic Test Series Victory at Lord’s with Fierce Day 5 Pace Bowling Masterclass',
    publishedAt: '2026-08-18T18:15:00.000Z',
    featuredImage: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=1200',
    caption: 'The Indian cricket team celebrating victory at Lord’s balcony.',
    tags: ['Cricket', 'Test Match', 'Lords', 'Team India']
  },
  {
    slug: 'restoring-western-ghats-sacred-groves-community-forestry',
    category: 'lifestyle',
    title: 'Restoring the Western Ghats: How Community-Led Sacred Grove Forestry is Reviving Ancient Water Tables',
    publishedAt: '2026-08-17T05:30:00.000Z',
    featuredImage: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&q=80&w=1200',
    caption: 'Lush evergreen canopy inside sacred grove reserves.',
    tags: ['Western Ghats', 'Environment', 'Forestry']
  },
  {
    slug: '71st-national-film-awards-regional-cinema-triumph-winners',
    category: 'entertainment',
    title: '71st National Film Awards: Regional Cinema Triumphs with Groundbreaking Narrative Storytelling and Audiovisual Craft',
    publishedAt: '2026-08-17T11:00:00.000Z',
    featuredImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1200',
    caption: 'Dignitaries and award-winning filmmakers gather at Vigyan Bhawan.',
    tags: ['National Film Awards', 'Cinema', 'Culture']
  },
  {
    slug: 'parliament-clears-digital-public-infrastructure-bill-monsoon-session',
    category: 'politics',
    title: 'Parliament Clears Landmark Digital Public Infrastructure & Data Protection Amendment Bill in Monsoon Session',
    publishedAt: '2026-08-19T09:00:00.000Z',
    featuredImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200',
    caption: 'The Parliament House illuminated during monsoon session.',
    tags: ['Parliament', 'Data Protection', 'Digital India']
  },
  {
    slug: 'upi-cross-border-remittances-monthly-record-transactions',
    category: 'business',
    title: 'Digital Payments Ecosystem Logs Record 16.5 Billion Monthly UPI Transactions as Cross-Border Remittances Expand',
    publishedAt: '2026-08-19T10:30:00.000Z',
    featuredImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=1200',
    caption: 'Digital point-of-sale terminals and merchant QR code network.',
    tags: ['UPI', 'Fintech', 'Banking', 'Digital Payments']
  },
  {
    slug: 'national-cyber-coordination-centre-ai-defense-grid',
    category: 'technology',
    title: 'National Cyber Coordination Centre Deploys AI Defense Shield Across Critical Energy & Railway Grids',
    publishedAt: '2026-08-18T13:15:00.000Z',
    featuredImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200',
    caption: 'Operations center monitoring high-security telemetry feeds.',
    tags: ['Cybersecurity', 'AI', 'National Security']
  },
  {
    slug: 'indo-pacific-trade-corridor-tokyo-summit-critical-minerals',
    category: 'world',
    title: 'Indo-Pacific Trade Corridor Summit Concludes in Tokyo with Trilateral Critical Minerals Pact',
    publishedAt: '2026-08-19T02:45:00.000Z',
    featuredImage: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200',
    caption: 'Delegates and trade ministers signing clean energy mineral alliance.',
    tags: ['Geopolitics', 'Indo-Pacific', 'Critical Minerals']
  }
];

export const FALLBACK_VIDEOS = [
  {
    slug: 'inside-indias-semiconductor-revolution',
    title: "Inside India's Semiconductor Revolution: Ground Report from Dholera Fab",
    description: "Special investigative dispatch from the Dholera Special Investment Region examining mega-fab construction timelines and cleanroom standards.",
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600',
    publishedAt: '2026-08-23T11:00:44.556Z'
  }
];

export async function fetchLiveArticles() {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        id, slug, title, title_hi, excerpt, status, published_at, 
        featured_image_url, featured_image_caption, 
        categories(slug, name),
        article_tags(tags(name))
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return FALLBACK_ARTICLES;
    }

    const liveArticles = data
      .filter(item => item.slug && item.slug !== 'auto-draft' && !item.slug.startsWith('auto-draft') && item.slug !== 'draft')
      .map(item => {
        const tagsList = Array.isArray(item.article_tags)
          ? item.article_tags.map(at => at.tags?.name).filter(Boolean)
          : ['News', 'National'];

        return {
          slug: item.slug,
          category: item.categories?.slug || 'india',
          title: item.title,
          titleHi: item.title_hi,
          publishedAt: item.published_at || new Date().toISOString(),
          featuredImage: item.featured_image_url,
          caption: item.featured_image_caption || item.title,
          tags: tagsList
        };
      });

    const liveSlugs = new Set(liveArticles.map(a => a.slug));
    return [...liveArticles, ...FALLBACK_ARTICLES.filter(f => !liveSlugs.has(f.slug))];
  } catch (err) {
    return FALLBACK_ARTICLES;
  }
}

export function buildSitemapIndexXml() {
  const today = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/news-sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/image-sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/video-sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>
`;
}

export function buildMainSitemapXml(articles, videos = FALLBACK_VIDEOS) {
  const today = new Date().toISOString().slice(0, 10);
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
`;

  // Hub Pages
  const hubPages = ['latest', 'trending', 'videos', 'photos'];
  for (const hub of hubPages) {
    xml += `  <url>
    <loc>${BASE_URL}/${hub}</loc>
    <changefreq>hourly</changefreq>
    <priority>0.85</priority>
  </url>
`;
  }

  for (const cat of DEFAULT_CATEGORIES) {
    xml += `  <url>
    <loc>${BASE_URL}/category/${cat}</loc>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  const staticPages = ['about', 'contact', 'privacy', 'disclaimer', 'terms', 'ethics', 'editorial-team', 'corrections', 'advertise'];
  for (const page of staticPages) {
    xml += `  <url>
    <loc>${BASE_URL}/${page}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
  }

  const seen = new Set();
  for (const article of articles) {
    const loc = `${BASE_URL}/${article.category}/${article.slug}`;
    if (!seen.has(loc)) {
      seen.add(loc);
      const lastmod = (article.publishedAt ? new Date(article.publishedAt).toISOString() : today).slice(0, 10);
      xml += `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
    }
  }

  for (const video of videos) {
    const loc = `${BASE_URL}/videos/${video.slug}`;
    if (!seen.has(loc)) {
      seen.add(loc);
      xml += `  <url>
    <loc>${loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }
  }

  xml += `</urlset>\n`;
  return xml;
}

export function buildNewsSitemapXml(articles) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
`;

  const sorted = [...articles].sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
  const seen = new Set();

  for (const article of sorted) {
    const loc = `${BASE_URL}/${article.category}/${article.slug}`;
    if (!seen.has(loc)) {
      seen.add(loc);
      const pubDate = article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString();
      const lang = article.titleHi || /[\u0900-\u097F]/.test(article.title) ? 'hi' : 'en';

      xml += `  <url>
    <loc>${loc}</loc>
    <news:news>
      <news:publication>
        <news:name>NP News Metro</news:name>
        <news:language>${lang}</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
`;
      if (article.tags && article.tags.length > 0) {
        xml += `      <news:keywords>${escapeXml(article.tags.slice(0, 5).join(', '))}</news:keywords>\n`;
      }
      xml += `    </news:news>
  </url>
`;
    }
  }

  xml += `</urlset>\n`;
  return xml;
}

export function buildImageSitemapXml(articles) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  const seen = new Set();
  for (const article of articles) {
    if (!article.featuredImage) continue;
    const loc = `${BASE_URL}/${article.category}/${article.slug}`;
    if (!seen.has(loc)) {
      seen.add(loc);
      const imgUrl = article.featuredImage.startsWith('http') ? article.featuredImage : `${BASE_URL}${article.featuredImage.startsWith('/') ? '' : '/'}${article.featuredImage}`;

      xml += `  <url>
    <loc>${loc}</loc>
    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:caption>${escapeXml(article.caption || article.title)}</image:caption>
      <image:title>${escapeXml(article.title)}</image:title>
    </image:image>
  </url>
`;
    }
  }

  xml += `</urlset>\n`;
  return xml;
}

export function buildVideoSitemapXml(videos = FALLBACK_VIDEOS) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
`;

  for (const video of videos) {
    const loc = `${BASE_URL}/videos/${video.slug}`;
    const pubDate = video.publishedAt ? new Date(video.publishedAt).toISOString() : new Date().toISOString();
    xml += `  <url>
    <loc>${loc}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeXml(video.thumbnailUrl)}</video:thumbnail_loc>
      <video:title>${escapeXml(video.title)}</video:title>
      <video:description>${escapeXml(video.description)}</video:description>
      <video:player_loc>${escapeXml(video.videoUrl)}</video:player_loc>
      <video:publication_date>${pubDate}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
    </video:video>
  </url>
`;
  }

  xml += `</urlset>\n`;
  return xml;
}

export function buildRssXml(articles) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>NP News Metro</title>
    <link>${BASE_URL}</link>
    <description>National News, Policy, Governance &amp; Investigative Journalism</description>
    <language>hi-IN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
`;

  for (const article of articles) {
    const link = `${BASE_URL}/${article.category}/${article.slug}`;
    const pubDate = article.publishedAt ? new Date(article.publishedAt).toUTCString() : new Date().toUTCString();

    xml += `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(article.caption || article.title)}</description>
      <dc:creator>NP News Metro Desk</dc:creator>
      <category>${escapeXml(article.category.toUpperCase())}</category>
    </item>
`;
  }

  xml += `  </channel>
</rss>
`;
  return xml;
}

export function buildRobotsTxt() {
  return `# Robots.txt - NP News Metro Search Engine Crawler Directives
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin
Disallow: /api/
Disallow: /login
Disallow: /auth/

# Googlebot News Directives
User-agent: Googlebot-News
Allow: /

# XML Sitemaps (Canonical Domain)
Sitemap: ${BASE_URL}/sitemap_index.xml
Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/news-sitemap.xml
Sitemap: ${BASE_URL}/image-sitemap.xml
Sitemap: ${BASE_URL}/video-sitemap.xml
Sitemap: ${BASE_URL}/rss.xml
`;
}

export function sendXmlResponse(res, xmlBody) {
  res.statusCode = 200;
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=600');
  }
  if (typeof res.status === 'function' && typeof res.send === 'function') {
    return res.status(200).send(xmlBody);
  }
  return res.end(xmlBody);
}

export function sendTextResponse(res, textBody) {
  res.statusCode = 200;
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
  }
  if (typeof res.status === 'function' && typeof res.send === 'function') {
    return res.status(200).send(textBody);
  }
  return res.end(textBody);
}
