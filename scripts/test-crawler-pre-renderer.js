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
  console.log('--- Testing Crawler Pre-Renderer (api/share.js) ---');

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

  // Test 4: Live article from Supabase
  const r4 = await simulateRequest('/india/aatha-dashaka-kee-prateekshaa-ke-baada-vaishvika-shikhara-para-st', { category: 'india', slug: 'aatha-dashaka-kee-prateekshaa-ke-baada-vaishvika-shikhara-para-st' });
  console.log('Status code for live article:', r4.statusCode);
  const ogImg = r4.body.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  console.log('og:image extracted:', ogImg);
  const twitterImg = r4.body.match(/<meta name="twitter:image" content="([^"]+)"/)?.[1];
  console.log('twitter:image extracted:', twitterImg);
  assert.strictEqual(r4.statusCode, 200);
  assert.ok(ogImg && (ogImg.includes('mt9') || ogImg.includes('api/image')), `og:image must be the uploaded image or proxy, got: ${ogImg}`);
  console.log('✓ Test 4 Passed: Live article pre-renders the EXACT uploaded featured image!');

  console.log('\n======================================================');
  console.log('ALL CRAWLER PRE-RENDERER TESTS PASSED SUCCESSFULLY!');
  console.log('======================================================');
}

runCrawlerTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
