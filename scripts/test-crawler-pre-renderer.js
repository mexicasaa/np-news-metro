import assert from 'assert';
import handler from '../api/share.js';

async function simulateRequest(path, query = {}) {
  let statusCode = 200;
  let headers = {};
  let body = '';
  const req = { url: path, query };
  const res = {
    statusCode: 200,
    setHeader: (k, v) => { headers[k] = v; },
    status: (code) => { statusCode = code; return { send: (b) => { body = b; } }; },
    send: (b) => { body = b; },
    end: (b) => { body = b; }
  };
  await handler(req, res);
  return { statusCode, headers, body };
}

async function runCrawlerTests() {
  console.log('--- Testing Crawler Pre-Renderer (api/share.ts) ---');

  // Test 1: Article rendering
  const r1 = await simulateRequest('/politics/nayab-saini-patiala-teej', { category: 'politics', slug: 'nayab-saini-patiala-teej' });
  assert.strictEqual(r1.statusCode, 200, 'Article should return 200');
  assert.ok(r1.body.includes('https://www.npnewsmetro.com/politics/nayab-saini-patiala-teej'), 'Must have canonical URL');
  assert.ok(r1.body.includes('"@type": "NewsArticle"'), 'Must have NewsArticle JSON-LD');
  assert.ok(r1.body.includes('<article>'), 'Must render semantic <article>');
  assert.ok(r1.body.includes('Patiala:'), 'Must render full body content');
  assert.ok(!r1.body.includes('http-equiv="refresh"'), 'Must NOT have meta http-equiv refresh');
  assert.ok(!r1.body.includes('window.location.replace'), 'Must NOT have window.location.replace');
  console.log('✓ Test 1 Passed: Valid article pre-renders full HTML, JSON-LD, body content, and NO soft redirects');

  // Test 2: Category page pre-rendering
  const r2 = await simulateRequest('/category/politics', { category: 'politics' });
  assert.strictEqual(r2.statusCode, 200, 'Category should return 200');
  assert.ok(r2.body.includes('https://www.npnewsmetro.com/category/politics'), 'Must have category canonical');
  assert.ok(r2.body.includes('CollectionPage'), 'Must have CollectionPage schema');
  console.log('✓ Test 2 Passed: Category route pre-renders semantic collection with links');

  // Test 3: Live article from Supabase (User Report 1: Ananta Bandhana)
  const r3 = await simulateRequest('/india/ananta-bandhana-akhanda-rakshaa-rakshaa-bandhana-para-vishesha?v=1787856397874', { 
    category: 'india', 
    slug: 'ananta-bandhana-akhanda-rakshaa-rakshaa-bandhana-para-vishesha',
    v: '1787856397874'
  });
  assert.strictEqual(r3.statusCode, 200, 'Article 1 should return 200');
  const ogImg3 = r3.body.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  const ogUrl3 = r3.body.match(/<meta property="og:url" content="([^"]+)"/)?.[1];
  console.log('Article 1 og:image:', ogImg3);
  console.log('Article 1 og:url:', ogUrl3);
  assert.ok(ogImg3 && ogImg3.includes('/api/image/article-images/articles/general/1005537465-mtbur5bp.jpg'), 'Article 1 og:image must be clean /api/image/ route');
  assert.ok(ogUrl3 && ogUrl3.includes('v=1787856397874'), 'Article 1 og:url must include cache buster for social scrapers');
  console.log('✓ Test 3 Passed: Article 1 generates clean first-party image URL and cache-busted og:url');

  // Test 4: Live article from Supabase (User Report 2: Himaalaya Royaa)
  const r4 = await simulateRequest('/india/himaalaya-royaa-to-janajeevana-maidaana-doobaaa?v=1787856835846', { 
    category: 'india', 
    slug: 'himaalaya-royaa-to-janajeevana-maidaana-doobaaa',
    v: '1787856835846'
  });
  assert.strictEqual(r4.statusCode, 200, 'Article 2 should return 200');
  const ogImg4 = r4.body.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  const ogUrl4 = r4.body.match(/<meta property="og:url" content="([^"]+)"/)?.[1];
  console.log('Article 2 og:image:', ogImg4);
  console.log('Article 2 og:url:', ogUrl4);
  assert.ok(ogImg4 && ogImg4.includes('/api/image/article-images/articles/4524b399-18ca-4e9e-8c00-40055f45d5b4/1005537397-mtbu880l-mtbvs0et.jpg'), 'Article 2 og:image must be clean /api/image/ route');
  assert.ok(ogUrl4 && ogUrl4.includes('v=1787856835846'), 'Article 2 og:url must include cache buster for social scrapers');
  console.log('✓ Test 4 Passed: Article 2 generates clean first-party image URL and cache-busted og:url');

  console.log('\n======================================================');
  console.log('ALL CRAWLER PRE-RENDERER TESTS PASSED SUCCESSFULLY!');
  console.log('======================================================');
}

runCrawlerTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
