import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  fetchLiveArticles,
  buildSitemapIndexXml,
  buildMainSitemapXml,
  buildNewsSitemapXml,
  buildImageSitemapXml,
  buildVideoSitemapXml,
  buildRssXml,
  buildRobotsTxt
} from '../api/_sitemapHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('Fetching live articles for static sitemap generation...');
  const articles = await fetchLiveArticles();
  console.log(`Generating sitemaps with ${articles.length} total articles...`);

  fs.writeFileSync(path.join(publicDir, 'sitemap_index.xml'), buildSitemapIndexXml(), 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), buildMainSitemapXml(articles), 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'news-sitemap.xml'), buildNewsSitemapXml(articles), 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'image-sitemap.xml'), buildImageSitemapXml(articles), 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'video-sitemap.xml'), buildVideoSitemapXml(), 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'rss.xml'), buildRssXml(articles), 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), buildRobotsTxt(), 'utf-8');

  console.log('All XML sitemaps, index, and robots.txt generated successfully in public/');
}

main().catch(err => {
  console.warn('Warning during static sitemap generation (using committed fallback sitemaps):', err?.message || err);
});
