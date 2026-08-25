const testCases = [
  { name: 'Homepage (Vite SPA)', path: '/', expectedStatus: 200, contentType: 'text/html' },
  { name: 'Latest Stories Desk', path: '/latest', expectedStatus: 200, contentType: 'text/html' },
  { name: 'Videos Hub', path: '/videos', expectedStatus: 200, contentType: 'text/html' },
  { name: 'Photos Hub', path: '/photos', expectedStatus: 200, contentType: 'text/html' },
  { name: 'Trending Feed', path: '/trending', expectedStatus: 200, contentType: 'text/html' },
  { name: 'Category: India', path: '/category/india', expectedStatus: 200, contentType: 'text/html' },
  { name: 'Category: Politics', path: '/category/politics', expectedStatus: 200, contentType: 'text/html' },
  { name: 'Category: Business', path: '/category/business', expectedStatus: 200, contentType: 'text/html' },
  { name: 'Article Page: Nayab Saini', path: '/india/nayab-saini-patiala-teej', expectedStatus: 200, contentType: 'text/html' },
  { name: 'Main XML Sitemap', path: '/sitemap.xml', expectedStatus: 200, contentType: 'application/xml' },
  { name: 'Google News Sitemap', path: '/news-sitemap.xml', expectedStatus: 200, contentType: 'application/xml' },
  { name: 'Google Image Sitemap', path: '/image-sitemap.xml', expectedStatus: 200, contentType: 'application/xml' },
  { name: 'Google Video Sitemap', path: '/video-sitemap.xml', expectedStatus: 200, contentType: 'application/xml' },
  { name: 'Live RSS 2.0 Feed', path: '/rss.xml', expectedStatus: 200, contentType: 'application/xml' },
  { name: 'Robots.txt Crawler Rules', path: '/robots.txt', expectedStatus: 200, contentType: 'text/plain' },
  { name: 'Ads.txt Publisher ID', path: '/ads.txt', expectedStatus: 200, contentType: 'text/plain' },
  { name: 'Favicon / Logo Image Asset', path: '/logo.png', expectedStatus: 200, contentType: 'image/png' },
  { name: 'Featured Uploads Image', path: '/uploads/nayab-saini-patiala-teej.jpg', expectedStatus: 200, contentType: 'image/jpeg' },
];

async function runAudit() {
  console.log('================================================================');
  console.log('       NP NEWS METRO — PRODUCTION SERVICE AUDIT REPORT          ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    const url = 'https://np-news-metro.vercel.app' + tc.path;
    try {
      const res = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
      const statusMatch = res.status === tc.expectedStatus;
      const type = res.headers.get('content-type') || '';
      const typeMatch = type.includes(tc.contentType);

      if (statusMatch && typeMatch) {
        console.log('[PASS] ' + tc.name.padEnd(32) + ' => Status: ' + res.status + ' | Type: ' + type.split(';')[0]);
        passed++;
      } else {
        console.log('[FAIL] ' + tc.name.padEnd(32) + ' => Got Status: ' + res.status + ' (Expected: ' + tc.expectedStatus + ') | Type: ' + type);
        failed++;
      }
    } catch (e) {
      console.log('[ERROR] ' + tc.name.padEnd(31) + ' => ' + e.message);
      failed++;
    }
  }

  console.log('\n================================================================');
  console.log('TOTAL TESTS: ' + testCases.length + ' | PASSED: ' + passed + ' | FAILED: ' + failed);
  console.log('================================================================');
}
runAudit();
