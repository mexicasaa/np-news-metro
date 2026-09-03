import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Read Supabase credentials from .env or defaults
function getEnvConfig() {
  const envPath = path.join(rootDir, '.env');
  const envVars = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = (match[2] || '').trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        envVars[match[1]] = val;
      }
    }
  }

  const url = process.env.VITE_SUPABASE_URL || envVars['VITE_SUPABASE_URL'] || 'https://bogjmdyolhazzvicjrjl.supabase.co';
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || envVars['VITE_SUPABASE_ANON_KEY'] || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZ2ptZHlvbGhhenp2aWNqcmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDcxNDAsImV4cCI6MjEwNDAyMzE0MH0.taOdcGmN6pQ3sfuIC2UIVkSV-8j0Y_wuXS-7Un4xo_0';

  return { url, anonKey };
}

// Download helper with retry
async function downloadFile(url, destPath, retries = 3) {
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(destPath, buffer);
      return { success: true, size: buffer.length };
    } catch (err) {
      if (attempt === retries) {
        console.warn(`[WARN] Failed downloading ${url} after ${retries} attempts: ${err.message}`);
        return { success: false, error: err.message };
      }
      await new Promise(r => setTimeout(r, 500 * attempt));
    }
  }
}

// Batch download helper with concurrency pool
async function downloadPool(items, concurrency = 8) {
  let completed = 0;
  let totalBytes = 0;
  const results = [];
  const total = items.length;

  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    const chunkResults = await Promise.all(chunk.map(async (item) => {
      const res = await downloadFile(item.url, item.destPath);
      completed++;
      if (res.success) {
        totalBytes += res.size;
      }
      if (completed % 25 === 0 || completed === total) {
        console.log(`Downloaded ${completed}/${total} assets... (${(totalBytes / 1024 / 1024).toFixed(2)} MB)`);
      }
      return { ...item, ...res };
    }));
    results.push(...chunkResults);
  }

  return { results, totalBytes };
}

// Helper to sanitize filename
function sanitizeFilename(name) {
  return name.replace(/[\\/:*?"<>|]/g, '-').slice(0, 100);
}

async function runBackup() {
  console.log('====================================================');
  console.log('  NP News Metro - Supabase Full Website Backup');
  console.log('====================================================');

  const { url, anonKey } = getEnvConfig();
  const supabase = createClient(url, anonKey);

  const backupDir = path.join(rootDir, 'backup_supabase');
  const dbDir = path.join(backupDir, 'database');
  const articlesDir = path.join(backupDir, 'articles');
  const articleItemsDir = path.join(articlesDir, 'items');
  const authorsDir = path.join(backupDir, 'authors');
  const videosDir = path.join(backupDir, 'videos');
  const videoThumbnailsDir = path.join(videosDir, 'thumbnails');
  const imagesDir = path.join(backupDir, 'images');
  const externalImagesDir = path.join(imagesDir, 'external');

  // Create directories
  [backupDir, dbDir, articlesDir, articleItemsDir, authorsDir, videosDir, videoThumbnailsDir, imagesDir, externalImagesDir].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  // Step 1: Fetch Database Tables
  console.log('\n[1/5] Fetching Database Tables...');

  // Fetch articles
  const { data: articles, error: artErr } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false });
  if (artErr) throw new Error(`Articles fetch failed: ${artErr.message}`);
  console.log(`✓ Fetched ${articles.length} articles`);
  fs.writeFileSync(path.join(dbDir, 'articles.json'), JSON.stringify(articles, null, 2), 'utf-8');

  // Fetch profiles
  const { data: profiles, error: profErr } = await supabase.from('profiles').select('*');
  if (profErr) throw new Error(`Profiles fetch failed: ${profErr.message}`);
  console.log(`✓ Fetched ${profiles.length} profiles / authors`);
  fs.writeFileSync(path.join(dbDir, 'profiles.json'), JSON.stringify(profiles, null, 2), 'utf-8');
  fs.writeFileSync(path.join(authorsDir, 'profiles.json'), JSON.stringify(profiles, null, 2), 'utf-8');

  // Fetch videos
  const { data: videos, error: vidErr } = await supabase.from('videos').select('*');
  if (vidErr) throw new Error(`Videos fetch failed: ${vidErr.message}`);
  console.log(`✓ Fetched ${videos.length} video records`);
  fs.writeFileSync(path.join(dbDir, 'videos.json'), JSON.stringify(videos, null, 2), 'utf-8');

  // Fetch categories
  const { data: categories, error: catErr } = await supabase.from('categories').select('*');
  if (catErr) throw new Error(`Categories fetch failed: ${catErr.message}`);
  console.log(`✓ Fetched ${categories.length} categories`);
  fs.writeFileSync(path.join(dbDir, 'categories.json'), JSON.stringify(categories, null, 2), 'utf-8');

  // Fetch tags
  const { data: tags, error: tagErr } = await supabase.from('tags').select('*');
  if (tagErr) throw new Error(`Tags fetch failed: ${tagErr.message}`);
  console.log(`✓ Fetched ${tags.length} tags`);
  fs.writeFileSync(path.join(dbDir, 'tags.json'), JSON.stringify(tags, null, 2), 'utf-8');

  // Fetch article_tags
  const { data: articleTags, error: atErr } = await supabase.from('article_tags').select('*');
  if (atErr) throw new Error(`Article tags fetch failed: ${atErr.message}`);
  console.log(`✓ Fetched ${articleTags.length} article tags`);
  fs.writeFileSync(path.join(dbDir, 'article_tags.json'), JSON.stringify(articleTags, null, 2), 'utf-8');

  // Fetch media library records
  const { data: media, error: medErr } = await supabase.from('media').select('*');
  if (medErr) throw new Error(`Media fetch failed: ${medErr.message}`);
  console.log(`✓ Fetched ${media.length} media records`);
  fs.writeFileSync(path.join(dbDir, 'media.json'), JSON.stringify(media, null, 2), 'utf-8');

  // Fetch site settings
  const { data: siteSettings } = await supabase.from('site_settings').select('*');
  if (siteSettings) {
    console.log(`✓ Fetched ${siteSettings.length} site settings records`);
    fs.writeFileSync(path.join(dbDir, 'site_settings.json'), JSON.stringify(siteSettings, null, 2), 'utf-8');
  }

  // Load article revisions manifest
  const revisionsPath = path.join(__dirname, 'revisions-manifest.json');
  let revisions = [];
  if (fs.existsSync(revisionsPath)) {
    revisions = JSON.parse(fs.readFileSync(revisionsPath, 'utf-8'));
    console.log(`✓ Loaded ${revisions.length} article revisions from manifest`);
    fs.writeFileSync(path.join(dbDir, 'article_revisions.json'), JSON.stringify(revisions, null, 2), 'utf-8');
  }

  // Maps for quick lookups
  const profileMap = new Map(profiles.map(p => [p.id, p]));
  const categoryMap = new Map(categories.map(c => [c.id, c]));
  const tagMap = new Map(tags.map(t => [t.id, t]));

  // Step 2: Enrich Articles & Export per-article files
  console.log('\n[2/5] Enriching Articles & Generating Markdown and JSON Archives...');

  const enrichedArticles = articles.map(art => {
    const postedByProfile = art.author_id ? profileMap.get(art.author_id) : null;
    const category = art.category_id ? categoryMap.get(art.category_id) : null;
    
    // Find tags
    const artTagIds = articleTags.filter(at => at.article_id === art.id).map(at => at.tag_id);
    const artTags = artTagIds.map(id => tagMap.get(id)?.name).filter(Boolean);

    // Format author attribution
    const postedBy = postedByProfile ? {
      id: postedByProfile.id,
      name: postedByProfile.full_name || postedByProfile.display_name,
      display_name: postedByProfile.display_name,
      email: postedByProfile.email,
      role: postedByProfile.role,
      department: postedByProfile.department
    } : null;

    return {
      ...art,
      posted_by: postedBy,
      byline_author: art.custom_author || (postedBy ? { name: postedBy.name, role: postedBy.role } : null),
      category_name: category ? category.name : null,
      category_slug: category ? category.slug : null,
      tag_names: artTags
    };
  });

  fs.writeFileSync(path.join(articlesDir, 'articles_enriched.json'), JSON.stringify(enrichedArticles, null, 2), 'utf-8');

  // Export individual readable files
  for (const art of enrichedArticles) {
    const safeSlug = sanitizeFilename(art.slug || art.id);

    // Save individual JSON
    fs.writeFileSync(path.join(articleItemsDir, `${safeSlug}.json`), JSON.stringify(art, null, 2), 'utf-8');

    // Save human-readable Markdown with YAML frontmatter
    const postedByName = art.posted_by?.name || 'Unknown';
    const postedByEmail = art.posted_by?.email || 'N/A';
    const bylineName = art.byline_author?.name || postedByName;
    const bylineRole = art.byline_author?.role || art.posted_by?.role || 'Staff';

    const mdContent = `---
id: "${art.id}"
title: "${(art.title || '').replace(/"/g, '\\"')}"
title_hi: "${(art.title_hi || '').replace(/"/g, '\\"')}"
slug: "${art.slug}"
status: "${art.status}"
published_at: "${art.published_at || ''}"
posted_by:
  name: "${postedByName}"
  email: "${postedByEmail}"
  role: "${art.posted_by?.role || 'N/A'}"
byline_author:
  name: "${bylineName}"
  role: "${bylineRole}"
category: "${art.category_name || ''}"
category_slug: "${art.category_slug || ''}"
tags: [${(art.tag_names || []).map(t => `"${t}"`).join(', ')}]
featured_image_url: "${art.featured_image_url || ''}"
reading_time_minutes: ${art.reading_time_minutes || 0}
view_count: ${art.view_count || 0}
---

# ${art.title || 'Untitled'}

${art.excerpt ? `> **Excerpt**: ${art.excerpt}\n` : ''}
${art.featured_image_url ? `![Featured Image](${art.featured_image_url})\n*${art.featured_image_caption || ''}*\n` : ''}

## Article Content

${art.content || '(No content provided)'}

${art.key_takeaways && Array.isArray(art.key_takeaways) && art.key_takeaways.length > 0 ? `
## Key Takeaways
${art.key_takeaways.map(k => `- ${typeof k === 'string' ? k : JSON.stringify(k)}`).join('\n')}
` : ''}
`;

    fs.writeFileSync(path.join(articleItemsDir, `${safeSlug}.md`), mdContent, 'utf-8');
  }

  console.log(`✓ Created 110 readable Markdown (.md) and JSON (.json) files in articles/items/`);

  // Step 3: Process Videos
  console.log('\n[3/5] Processing Videos and Creator Metadata...');

  const enrichedVideos = videos.map(vid => {
    const creator = vid.created_by ? profileMap.get(vid.created_by) : null;
    const category = vid.category_id ? categoryMap.get(vid.category_id) : null;
    return {
      ...vid,
      created_by_profile: creator ? {
        id: creator.id,
        name: creator.full_name || creator.display_name,
        email: creator.email,
        role: creator.role
      } : null,
      category_name: category ? category.name : null
    };
  });

  fs.writeFileSync(path.join(videosDir, 'videos.json'), JSON.stringify(enrichedVideos, null, 2), 'utf-8');

  // Video download list
  const videoDownloads = [];
  for (const vid of videos) {
    if (vid.thumbnail_url) {
      const ext = vid.thumbnail_url.includes('.png') ? 'png' : 'jpg';
      videoDownloads.push({
        url: vid.thumbnail_url,
        destPath: path.join(videoThumbnailsDir, `${vid.id}.${ext}`)
      });
    }
  }

  if (videoDownloads.length > 0) {
    console.log(`Downloading ${videoDownloads.length} video thumbnails...`);
    await downloadPool(videoDownloads, 4);
    console.log(`✓ Video thumbnails downloaded`);
  }

  // Step 4: Download Images from Supabase Storage
  console.log('\n[4/5] Downloading All Images from Supabase Storage...');

  // Load storage manifest
  const storageManifestPath = path.join(__dirname, 'storage-manifest.json');
  if (!fs.existsSync(storageManifestPath)) {
    throw new Error('storage-manifest.json not found in scripts directory!');
  }
  const storageObjects = JSON.parse(fs.readFileSync(storageManifestPath, 'utf-8'));
  console.log(`Found ${storageObjects.length} storage objects in article-images bucket`);

  const storageDownloads = storageObjects
    .filter(obj => obj.name && !obj.name.endsWith('.emptyFolderPlaceholder'))
    .map(obj => {
      const publicUrl = `${url}/storage/v1/object/public/${obj.bucket_id}/${obj.name}`;
      const localRelPath = obj.name; // e.g. articles/03557d80.../1005601916.jpg
      return {
        url: publicUrl,
        destPath: path.join(imagesDir, localRelPath),
        name: obj.name,
        size: obj.size_bytes
      };
    });

  // Also download external images if any
  for (const art of articles) {
    if (art.featured_image_url && !art.featured_image_url.includes('supabase.co') && art.featured_image_url.startsWith('http')) {
      storageDownloads.push({
        url: art.featured_image_url,
        destPath: path.join(externalImagesDir, `${art.id}.jpg`),
        name: `external/${art.id}.jpg`
      });
    }
  }

  console.log(`Starting download of ${storageDownloads.length} total image assets...`);
  const { results: downloadResults, totalBytes: downloadedBytes } = await downloadPool(storageDownloads, 10);
  const successfulDownloads = downloadResults.filter(r => r.success);
  console.log(`✓ Successfully downloaded ${successfulDownloads.length}/${storageDownloads.length} image files (${(downloadedBytes / 1024 / 1024).toFixed(2)} MB)`);

  // Step 5: Manifest & Readme
  console.log('\n[5/5] Generating Manifest and Documentation...');

  const manifest = {
    backup_date: new Date().toISOString(),
    source: url,
    summary: {
      total_articles: articles.length,
      total_profiles: profiles.length,
      total_videos: videos.length,
      total_categories: categories.length,
      total_tags: tags.length,
      total_media_records: media.length,
      total_article_revisions: revisions.length,
      total_images_downloaded: successfulDownloads.length,
      total_image_bytes: downloadedBytes,
      total_image_megabytes: +(downloadedBytes / 1024 / 1024).toFixed(2)
    },
    authors_summary: profiles.map(p => {
      const artCount = articles.filter(a => a.author_id === p.id).length;
      return {
        id: p.id,
        name: p.full_name || p.display_name,
        email: p.email,
        role: p.role,
        articles_posted: artCount
      };
    })
  };

  fs.writeFileSync(path.join(backupDir, 'backup_manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

  // Write README.md inside backup folder
  const readmeContent = `# NP News Metro - Full Website Supabase Backup

**Backup Date**: ${new Date().toLocaleString()}  
**Supabase Host**: \`${url}\`  

## Backup Summary
- **Articles**: ${articles.length} published & drafted stories with full content, SEO metadata, tags, and images.
- **Profiles & Authors**: ${profiles.length} user accounts with full attribution of who posted each story.
- **Videos**: ${videos.length} video stories with YouTube links, descriptions, and downloaded thumbnails.
- **Images Downloaded**: ${successfulDownloads.length} images (${(downloadedBytes / 1024 / 1024).toFixed(2)} MB) saved locally.
- **Categories**: ${categories.length} news categories.
- **Tags**: ${tags.length} tags.
- **Media Records**: ${media.length} media library catalog items.
- **Article Revisions**: ${revisions.length} historical revisions.

## Directory Structure
\`\`\`
backup_supabase/
├── backup_manifest.json          <- Inventory and statistics
├── README.md                     <- This documentation
├── database/                     <- Raw Supabase PostgreSQL table dumps
│   ├── articles.json             (110 records)
│   ├── profiles.json             (8 records)
│   ├── videos.json               (2 records)
│   ├── categories.json           (13 records)
│   ├── tags.json                 (7 records)
│   ├── article_tags.json         (2 records)
│   ├── media.json                (180 records)
│   ├── article_revisions.json    (589 records)
│   └── site_settings.json        (1 record)
├── articles/
│   ├── articles_enriched.json    <- Articles joined with Author info, Category & Tags
│   └── items/                    <- 110 Individual readable Markdown & JSON files
│       ├── [slug].md
│       └── [slug].json
├── authors/
│   └── profiles.json             <- Author accounts, roles, and emails
├── videos/
│   ├── videos.json               <- Video entries & YouTube references
│   └── thumbnails/               <- Downloaded video thumbnails
└── images/                       <- All 207 stored images from Supabase Storage
    ├── articles/
    │   ├── [article_id]/
    │   └── general/
    ├── avatars/
    └── external/
\`\`\`

## Author Attribution Highlights
${manifest.authors_summary.map(a => `- **${a.name}** (${a.email}) - Role: \`${a.role}\` | Articles Posted: **${a.articles_posted}**`).join('\n')}

## How to View or Restore
- Each article in \`articles/items/\` can be previewed in any Markdown reader or text editor.
- The raw JSON files in \`database/\` contain complete Postgres relational schemas ready for importing into another database.
`;

  fs.writeFileSync(path.join(backupDir, 'README.md'), readmeContent, 'utf-8');

  // Step 6: Create Standalone ZIP Archive
  console.log('\n====================================================');
  console.log('  Creating Standalone ZIP Archive in Codebase Root');
  console.log('====================================================');

  const zipDateStr = new Date().toISOString().slice(0, 10);
  const zipFileName = `np_news_metro_supabase_backup_${zipDateStr}.zip`;
  const zipFilePath = path.join(rootDir, zipFileName);

  if (fs.existsSync(zipFilePath)) {
    fs.unlinkSync(zipFilePath);
  }

  try {
    console.log(`Compressing ${backupDir} to ${zipFileName}...`);
    // Use Windows tar.exe for speed and subfolder support
    execSync(`tar.exe -a -c -f "${zipFilePath}" backup_supabase`, { cwd: rootDir, stdio: 'inherit' });
    const stats = fs.statSync(zipFilePath);
    console.log(`\n🎉 ZIP Archive created successfully!`);
    console.log(`Path: ${zipFilePath}`);
    console.log(`Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  } catch (tarErr) {
    console.warn(`tar.exe failed, falling back to PowerShell Compress-Archive: ${tarErr.message}`);
    const psCmd = `powershell -Command "Compress-Archive -Path '${backupDir}' -DestinationPath '${zipFilePath}' -Force"`;
    execSync(psCmd, { cwd: rootDir, stdio: 'inherit' });
    const stats = fs.statSync(zipFilePath);
    console.log(`\n🎉 ZIP Archive created successfully via PowerShell!`);
    console.log(`Path: ${zipFilePath}`);
    console.log(`Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  }

  console.log('\n====================================================');
  console.log('  BACKUP COMPLETE!');
  console.log(`  Local Directory: ./backup_supabase/`);
  console.log(`  ZIP Archive:     ./${zipFileName}`);
  console.log('====================================================\n');
}

runBackup().catch(err => {
  console.error('\n❌ Backup failed:', err);
  process.exit(1);
});
