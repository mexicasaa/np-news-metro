import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import handler from '../api/share.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testAll() {
  const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x => x[1]);
  console.log(`Starting scan of ${urls.length} URLs from sitemap.xml...`);

  const failed = [];
  const BATCH_SIZE = 25;

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const chunk = urls.slice(i, i + BATCH_SIZE);
    await Promise.all(chunk.map(async (u) => {
      const parsed = new URL(u);
      const parts = parsed.pathname.split('/').filter(Boolean);
      const query = {};
      if (parts.length === 1) {
        query.slug = parts[0];
      } else if (parts.length === 2) {
        query.category = parts[0];
        query.slug = parts[1];
      }

      const res = {
        statusCode: 200,
        setHeader() {},
        status(c) { this.statusCode = c; return this; },
        send(b) { this.body = b; },
        end(b) { this.body = b; }
      };

      try {
        await handler({ url: parsed.pathname, query }, res);
        if (res.statusCode !== 200) {
          failed.push({ url: u, status: res.statusCode });
        }
      } catch (err) {
        failed.push({ url: u, status: 'ERROR', error: err.message });
      }
    }));
    console.log(`Scanned ${Math.min(i + BATCH_SIZE, urls.length)} / ${urls.length} URLs...`);
  }

  console.log('\n======================================================');
  console.log('--- ALL SITEMAP URLS SCAN COMPLETED ---');
  console.log(`Total URLs: ${urls.length}`);
  console.log(`Passed (200 OK): ${urls.length - failed.length}`);
  console.log(`Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.error('Failures detected:', JSON.stringify(failed, null, 2));
    process.exit(1);
  } else {
    console.log('✓ SUCCESS: 100% OF SITEMAP URLS RESOLVE WITH 200 OK!');
  }
  console.log('======================================================\n');
}

testAll().catch(e => {
  console.error('Fatal error during test:', e);
  process.exit(1);
});
