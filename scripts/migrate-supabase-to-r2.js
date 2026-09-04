// @ts-nocheck
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/(^['"]|['"]$)/g, '');
    envVars[key] = val;
  }
}

const supabaseUrl = envVars.VITE_SUPABASE_URL || 'https://bogjmdyolhazzvicjrjl.supabase.co';
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;
const accountId = envVars.CLOUDFLARE_ACCOUNT_ID || '1e80885b08497594fa4cfc98e5a3fdfc';
const bucketName = envVars.VITE_R2_BUCKET_NAME || 'np-news-metro-media';
const r2PublicUrl = envVars.VITE_R2_PUBLIC_URL || 'https://pub-a4495fe3c1c741f2a1c8d8cd43ce064f.r2.dev';

const accessKeyId = process.env.R2_ACCESS_KEY_ID || envVars.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || envVars.R2_SECRET_ACCESS_KEY;

if (!accessKeyId || !secretAccessKey) {
  console.error('ERROR: R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY must be provided in .env');
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('--- STARTING MIGRATION: SUPABASE STORAGE -> CLOUDFLARE R2 ---');
  console.log(`Target Bucket: ${bucketName}`);
  console.log(`Public Base URL: ${r2PublicUrl}`);

  const { data: mediaItems, error: mediaErr } = await supabase
    .from('media')
    .select('*');

  if (mediaErr) {
    console.error('Failed to fetch media records:', mediaErr);
    process.exit(1);
  }

  console.log(`Found ${mediaItems.length} media records in database.`);

  for (const item of mediaItems) {
    console.log(`\nProcessing media ID ${item.id} (${item.file_name})...`);
    const storagePath = item.storage_path || item.r2_key;
    const currentUrl = item.public_url;
    console.log(`Current Public URL: ${currentUrl}`);

    if (currentUrl && currentUrl.includes(r2PublicUrl)) {
      console.log('Already migrated to R2. Skipping.');
      continue;
    }

    try {
      let buffer;
      let contentType = item.mime_type || 'image/jpeg';

      if (currentUrl && currentUrl.startsWith('http')) {
        console.log(`Downloading file from: ${currentUrl}`);
        const resp = await fetch(currentUrl);
        if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
        const arrayBuf = await resp.arrayBuffer();
        buffer = Buffer.from(arrayBuf);
      } else {
        console.log(`Downloading from Supabase storage bucket 'article-images': ${storagePath}`);
        const { data: fileData, error: dlErr } = await supabase.storage
          .from('article-images')
          .download(storagePath);
        if (dlErr || !fileData) throw new Error(dlErr?.message || 'Download failed');
        const arrayBuf = await fileData.arrayBuffer();
        buffer = Buffer.from(arrayBuf);
      }

      console.log(`Downloaded ${buffer.length} bytes.`);

      const r2Key = item.r2_key || storagePath;
      console.log(`Uploading to R2 key: ${r2Key}...`);

      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: r2Key,
          Body: buffer,
          ContentType: contentType,
          CacheControl: 'public, max-age=31536000, immutable',
        })
      );

      const newPublicUrl = `${r2PublicUrl.replace(/\/$/, '')}/${r2Key.replace(/^\//, '')}`;
      console.log(`Upload complete! New R2 URL: ${newPublicUrl}`);

      await supabase
        .from('media')
        .update({
          public_url: newPublicUrl,
          r2_key: r2Key,
        })
        .eq('id', item.id);

      const { data: affectedArticles } = await supabase
        .from('articles')
        .select('id, title, featured_image_url')
        .eq('featured_image_url', currentUrl);

      if (affectedArticles && affectedArticles.length > 0) {
        console.log(`Updating ${affectedArticles.length} articles referencing this image...`);
        for (const art of affectedArticles) {
          await supabase
            .from('articles')
            .update({ featured_image_url: newPublicUrl })
            .eq('id', art.id);
          console.log(`Updated article: ${art.title} -> ${newPublicUrl}`);
        }
      }

      try {
        await supabase.storage.from('article-images').remove([storagePath]);
        console.log(`Cleaned up from Supabase storage: ${storagePath}`);
      } catch (delErr) {
        console.warn('Could not delete from Supabase storage (non-fatal):', delErr);
      }

      console.log(`Successfully migrated ${item.file_name} to Cloudflare R2!`);
    } catch (err) {
      console.error(`Failed to migrate ${item.file_name}:`, err.message);
    }
  }

  console.log('\n--- MIGRATION COMPLETED ---');
}

migrate();
