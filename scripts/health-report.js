import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read .env
const envPath = path.join(rootDir, '.env');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://bogjmdyolhazzvicjrjl.supabase.co';
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;
const CDN_DOMAIN = env.VITE_CDN_DOMAIN || 'https://cdn.npnewsmetro.com';
const R2_PUBLIC_URL = env.VITE_R2_PUBLIC_URL || 'https://pub-a4495fe3c1c741f2a1c8d8cd43ce064f.r2.dev';
const BASE_URL = 'https://www.npnewsmetro.com';

const report = {
  timestamp: new Date().toISOString(),
  target: BASE_URL,
  sections: {}
};

async function timedFetch(url, options = {}) {
  const start = performance.now();
  try {
    const res = await fetch(url, { ...options, redirect: 'follow' });
    const durationMs = Math.round(performance.now() - start);
    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      durationMs,
      headers: Object.fromEntries(res.headers.entries()),
      text: await res.text(),
      error: null
    };
  } catch (err) {
    const durationMs = Math.round(performance.now() - start);
    return {
      ok: false,
      status: 0,
      statusText: err.code || err.message,
      durationMs,
      headers: {},
      text: '',
      error: err.message
    };
  }
}

async function runHealthCheck() {
  console.log('========================================================================');
  console.log(`  COMPREHENSIVE WEBSITE HEALTH REPORT: ${BASE_URL}`);
  console.log(`  Generated at: ${new Date().toLocaleString()}`);
  console.log('========================================================================\n');

  // SECTION 1: Core Website & Edge Latency
  console.log('--- 1. CORE ENDPOINTS & PERFORMANCE ---');
  const coreUrls = [
    { name: 'Homepage (HTTPS)', url: `${BASE_URL}/` },
    { name: 'Latest News', url: `${BASE_URL}/latest` },
    { name: 'Category: India', url: `${BASE_URL}/india` },
    { name: 'Category: World', url: `${BASE_URL}/world` },
    { name: 'Category: Business', url: `${BASE_URL}/business` },
    { name: 'Category: Entertainment', url: `${BASE_URL}/entertainment` },
    { name: 'Category: Sports', url: `${BASE_URL}/sports` },
    { name: 'Trending Hub', url: `${BASE_URL}/trending` },
    { name: 'Video Hub', url: `${BASE_URL}/videos` },
    { name: 'Admin Portal', url: `${BASE_URL}/admin` },
    { name: 'Privacy Policy', url: `${BASE_URL}/privacy-policy` },
    { name: 'About Us', url: `${BASE_URL}/about` }
  ];

  const coreResults = [];
  for (const item of coreUrls) {
    const res = await timedFetch(item.url);
    const result = {
      name: item.name,
      url: item.url,
      status: res.status,
      durationMs: res.durationMs,
      passed: res.ok && res.status === 200,
      server: res.headers['server'] || res.headers['x-vercel-id'] ? 'Vercel / Cloudflare' : (res.headers['server'] || 'Unknown'),
      cacheStatus: res.headers['cf-cache-status'] || res.headers['x-vercel-cache'] || 'N/A'
    };
    coreResults.push(result);
    console.log(`  [${result.passed ? '✓' : '✗'}] ${result.name.padEnd(25)} Status: ${result.status} | Latency: ${result.durationMs}ms`);
  }
  report.sections.core = coreResults;

  // SECTION 2: SEO, Sitemaps & Feeds
  console.log('\n--- 2. SEO, SITEMAPS & FEEDS ---');
  const seoUrls = [
    { name: 'Robots.txt', url: `${BASE_URL}/robots.txt`, expectedType: 'text/plain' },
    { name: 'Root Sitemap Index', url: `${BASE_URL}/sitemap.xml`, expectedType: 'xml' },
    { name: 'Google News Sitemap', url: `${BASE_URL}/news-sitemap.xml`, expectedType: 'xml' },
    { name: 'Image Sitemap', url: `${BASE_URL}/image-sitemap.xml`, expectedType: 'xml' },
    { name: 'Video Sitemap', url: `${BASE_URL}/video-sitemap.xml`, expectedType: 'xml' },
    { name: 'RSS 2.0 Feed', url: `${BASE_URL}/rss.xml`, expectedType: 'xml' },
    { name: 'Ads.txt', url: `${BASE_URL}/ads.txt`, expectedType: 'text/plain' },
    { name: 'Bing Auth', url: `${BASE_URL}/BingSiteAuth.xml`, expectedType: 'xml' }
  ];

  const seoResults = [];
  for (const item of seoUrls) {
    const res = await timedFetch(item.url);
    const contentType = res.headers['content-type'] || '';
    const hasExpectedType = item.expectedType ? contentType.includes(item.expectedType) : true;
    const passed = res.ok && res.status === 200 && hasExpectedType;
    const result = {
      name: item.name,
      url: item.url,
      status: res.status,
      durationMs: res.durationMs,
      contentType: contentType.split(';')[0],
      passed,
      contentLength: res.text.length
    };
    seoResults.push(result);
    console.log(`  [${passed ? '✓' : '✗'}] ${result.name.padEnd(25)} Status: ${result.status} | Content-Type: ${result.contentType} | Size: ${result.contentLength} bytes (${result.durationMs}ms)`);
  }
  report.sections.seo = seoResults;

  // SECTION 3: Social Crawler & OpenGraph Pre-renderer
  console.log('\n--- 3. SOCIAL BOT & OPEN GRAPH PRE-RENDERER ---');
  const sampleArticleSlug = 'aatha-dashaka-kee-prateekshaa-ke-baada-vaishvika-shikhara-para-st';
  const sampleArticleUrl = `${BASE_URL}/india/${sampleArticleSlug}`;
  const botUserAgents = [
    { bot: 'WhatsApp Bot', ua: 'WhatsApp/2.21.12.21 i' },
    { bot: 'Twitterbot / X', ua: 'Twitterbot/1.0' },
    { bot: 'Facebook / Meta ExternalHit', ua: 'facebookexternalhit/1.1' },
    { bot: 'Googlebot Smartphone', ua: 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/W.X.Y.Z Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }
  ];

  const crawlerResults = [];
  for (const bot of botUserAgents) {
    const res = await timedFetch(sampleArticleUrl, {
      headers: { 'User-Agent': bot.ua }
    });
    const ogTitle = res.text.match(/<meta property="og:title" content="([^"]+)"/)?.[1] || res.text.match(/<title>([^<]+)<\/title>/)?.[1];
    const ogImage = res.text.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
    const isPreRendered = !!(ogTitle || ogImage);
    const passed = res.status === 200 && isPreRendered;
    const result = {
      bot: bot.bot,
      status: res.status,
      ogTitle: ogTitle ? ogTitle.substring(0, 40) + '...' : 'Missing',
      hasOgImage: !!ogImage,
      passed,
      durationMs: res.durationMs
    };
    crawlerResults.push(result);
    console.log(`  [${passed ? '✓' : '✗'}] ${bot.bot.padEnd(25)} Status: ${res.status} | OG Title: "${result.ogTitle}" | OG Image: ${result.hasOgImage ? 'Present' : 'None'} (${res.durationMs}ms)`);
  }
  report.sections.crawlers = crawlerResults;

  // SECTION 4: Database & Backend Services Health
  console.log('\n--- 4. DATABASE & BACKEND SERVICES HEALTH ---');
  const dbStart = performance.now();
  let dbStatus = 'FAIL';
  let articleCount = 0;
  let dbLatency = 0;
  let recentArticle = null;
  try {
    const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/articles?select=id,title,slug,status,published_at&status=eq.published&order=published_at.desc&limit=5`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    dbLatency = Math.round(performance.now() - dbStart);
    if (dbRes.ok) {
      const articles = await dbRes.json();
      articleCount = articles.length;
      dbStatus = articleCount > 0 ? 'HEALTHY' : 'DEGRADED';
      recentArticle = articles[0];
    } else {
      dbStatus = `HTTP_${dbRes.status}`;
    }
  } catch (err) {
    dbStatus = 'OFFLINE';
  }
  console.log(`  Database Status:     ${dbStatus} (Response time: ${dbLatency}ms)`);
  console.log(`  Articles accessible: ${articleCount} returned in query`);
  if (recentArticle) {
    console.log(`  Latest Article:      "${recentArticle.title?.substring(0, 40)}..." (Published: ${recentArticle.published_at})`);
  }
  report.sections.database = { dbStatus, dbLatency, articleCount, recentArticle };

  // SECTION 5: CDN & Media Storage Health
  console.log('\n--- 5. CDN & STORAGE INFRASTRUCTURE ---');
  const cdnRes = await timedFetch(`${CDN_DOMAIN}/robots.txt`);
  console.log(`  Custom CDN Domain (${CDN_DOMAIN}): Status ${cdnRes.status} (${cdnRes.durationMs}ms)`);

  const r2Res = await timedFetch(`${R2_PUBLIC_URL}/`);
  console.log(`  Cloudflare R2 Public Gateway: Status ${r2Res.status} (${r2Res.durationMs}ms)`);

  report.sections.infrastructure = {
    cdnDomain: { status: cdnRes.status, durationMs: cdnRes.durationMs },
    r2Gateway: { status: r2Res.status, durationMs: r2Res.durationMs }
  };

  // SECTION 6: Security & Protocol Headers
  console.log('\n--- 6. SECURITY & SSL HEADERS ---');
  const homeRes = await timedFetch(`${BASE_URL}/`);
  const headers = homeRes.headers;
  const securityHeaders = {
    'Strict-Transport-Security': headers['strict-transport-security'] || 'Not set',
    'X-Content-Type-Options': headers['x-content-type-options'] || 'Not set',
    'X-Frame-Options': headers['x-frame-options'] || 'Not set',
    'Content-Security-Policy': headers['content-security-policy'] ? 'Configured' : 'Not set',
    'X-Vercel-Id': headers['x-vercel-id'] ? 'Vercel Edge Active' : 'Not present'
  };
  for (const [k, v] of Object.entries(securityHeaders)) {
    console.log(`  ${k.padEnd(30)}: ${v}`);
  }
  report.sections.security = securityHeaders;

  // SUMMARY
  const allTests = [
    ...coreResults.map(r => r.passed),
    ...seoResults.map(r => r.passed),
    ...crawlerResults.map(r => r.passed),
    dbStatus === 'HEALTHY'
  ];
  const passedCount = allTests.filter(Boolean).length;
  const totalCount = allTests.length;
  const healthPercent = Math.round((passedCount / totalCount) * 100);

  console.log('\n========================================================================');
  console.log(`  OVERALL SYSTEM HEALTH: ${healthPercent}% (${passedCount}/${totalCount} CHECKS PASSED)`);
  console.log('========================================================================\n');

  return report;
}

runHealthCheck();
