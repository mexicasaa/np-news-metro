const testUrls = [
  'https://www.npnewsmetro.com/sitemap.xml',
  'https://www.npnewsmetro.com/sitemap_index.xml',
  'http://npnewsmetro.com/news-sitemap.xml',
  'https://www.npnewsmetro.com/news-sitemap.xml',
  'http://npnewsmetro.com/image-sitemap.xml',
  'https://www.npnewsmetro.com/image-sitemap.xml',
  'http://npnewsmetro.com/video-sitemap.xml',
  'https://www.npnewsmetro.com/video-sitemap.xml',
  'http://npnewsmetro.com/rss.xml',
  'https://www.npnewsmetro.com/rss.xml',
  'http://npnewsmetro.com/robots.txt',
  'https://www.npnewsmetro.com/robots.txt',
  'http://npnewsmetro.com/sitemap',
  'http://npnewsmetro.com/sitemaps.xml',
  'http://npnewsmetro.com/sitemap-index.xml'
];

async function runAudit() {
  console.log('================================================================');
  console.log('       NP NEWS METRO — PRODUCTION SITEMAP AUDIT REPORT          ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  for (const url of testUrls) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();
      const isXmlUrl = url.includes('.xml') || url.includes('sitemap') || url.includes('rss');
      const isRobots = url.includes('robots.txt');

      let valid = res.status === 200;
      let reason = '';

      if (isXmlUrl && !isRobots) {
        if (!contentType.includes('xml')) {
          valid = false;
          reason += ' Expected XML Content-Type, got: ' + contentType;
        }
        if (text.includes('<html') || text.includes('<!DOCTYPE html>')) {
          valid = false;
          reason += ' Contains HTML markup!';
        }
        if (!text.startsWith('<?xml') && !text.includes('<urlset') && !text.includes('<sitemapindex') && !text.includes('<rss')) {
          valid = false;
          reason += ' Invalid XML structure!';
        }
      } else if (isRobots) {
        if (!contentType.includes('text/plain')) {
          valid = false;
          reason += ' Expected text/plain Content-Type, got: ' + contentType;
        }
        if (!text.includes('Sitemap:')) {
          valid = false;
          reason += ' Missing Sitemap declaration!';
        }
      }

      if (valid) {
        console.log('[PASS] ' + url.padEnd(52) + ' => ' + res.status + ' | ' + contentType.split(';')[0]);
        passed++;
      } else {
        console.log('[FAIL] ' + url.padEnd(52) + ' => Status: ' + res.status + ' | Error: ' + reason);
        failed++;
      }
    } catch (e) {
      console.log('[ERROR] ' + url.padEnd(52) + ' => ' + e.message);
      failed++;
    }
  }

  console.log('\n================================================================');
  console.log('TOTAL TESTS: ' + testUrls.length + ' | PASSED: ' + passed + ' | FAILED: ' + failed);
  console.log('================================================================');
}

runAudit();
