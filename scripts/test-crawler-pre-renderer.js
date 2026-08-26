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

  // Test 3: 404 for non-existent story
  const r3 = await simulateRequest('/politics/non-existent-story-12345', { category: 'politics', slug: 'non-existent-story-12345' });
  assert.strictEqual(r3.statusCode, 404, 'Non-existent story must return 404');
  assert.ok(r3.body.includes('404'), 'Must render 404 text');
  console.log('✓ Test 3 Passed: Non-existent story returns genuine HTTP 404 status (no Soft 404)');

  console.log('\n======================================================');
  console.log('ALL CRAWLER PRE-RENDERER TESTS PASSED SUCCESSFULLY!');
  console.log('======================================================');
}

runCrawlerTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
