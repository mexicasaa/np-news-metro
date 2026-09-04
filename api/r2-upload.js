// @ts-nocheck
import './_suppressWarnings.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bogjmdyolhazzvicjrjl.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '1e80885b08497594fa4cfc98e5a3fdfc';
const bucketName = process.env.VITE_R2_BUCKET_NAME || 'np-news-metro-media';
const r2PublicUrl = process.env.VITE_R2_PUBLIC_URL || 'https://pub-a4495fe3c1c741f2a1c8d8cd43ce064f.r2.dev';

const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = {};
  if (typeof req.body === 'string') {
    try {
      body = JSON.parse(req.body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }
  } else {
    body = req.body || {};
  }

  const {
    base64Data,
    fileName = 'image.jpeg',
    mimeType = 'image/jpeg',
    contentHash,
    altText = '',
    caption = '',
    articleId,
  } = body;

  if (!base64Data && !contentHash) {
    return res.status(400).json({ error: 'base64Data or contentHash required' });
  }

  try {
    // 1. Deduplication check via content hash
    if (contentHash) {
      const { data: existing } = await supabase
        .from('media')
        .select('*')
        .eq('content_hash', contentHash)
        .maybeSingle();

      if (existing) {
        if (articleId) {
          await supabase.from('article_media').upsert({
            article_id: articleId,
            media_id: existing.id,
            usage_type: 'featured',
            sort_order: 0,
          });
          await supabase
            .from('articles')
            .update({ featured_media_id: existing.id, featured_image_url: existing.public_url })
            .eq('id', articleId);
        }

        return res.status(200).json({
          isDuplicate: true,
          url: existing.public_url,
          mediaId: existing.id,
          media: existing,
          message: 'Reusing deduplicated media asset from Cloudflare R2.',
        });
      }
    }

    if (!base64Data) {
      return res.status(400).json({ error: 'base64Data required for new upload' });
    }

    if (!accessKeyId || !secretAccessKey) {
      return res.status(500).json({
        error: 'Cloudflare R2 API credentials not configured (R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY)',
      });
    }

    // Clean base64 prefix if present
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    const cleanName = (fileName || 'image.webp').replace(/[^a-zA-Z0-9._-]/g, '_');
    const hash = contentHash || Date.now().toString(36);
    const r2Key = `media/${hash}/${cleanName}`;

    // 2. Upload direct to Cloudflare R2 S3 API
    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: r2Key,
        Body: buffer,
        ContentType: mimeType,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    const publicUrl = `${r2PublicUrl.replace(/\/$/, '')}/${r2Key.replace(/^\//, '')}`;

    // 3. Register in Supabase media table
    const { data: mediaRecord, error: dbErr } = await supabase
      .from('media')
      .insert({
        file_name: cleanName,
        storage_path: r2Key,
        r2_key: r2Key,
        content_hash: hash,
        public_url: publicUrl,
        mime_type: mimeType,
        file_size: buffer.length,
        width: 1280,
        height: 720,
        alt_text: altText || cleanName.replace(/\.[^/.]+$/, ''),
        caption: caption || 'NP News Metro Media Desk',
        media_type: mimeType.startsWith('image/') ? 'image' : 'document',
      })
      .select()
      .single();

    if (dbErr) {
      console.warn('Media table record warning:', dbErr);
    }

    if (articleId && mediaRecord) {
      await supabase.from('article_media').upsert({
        article_id: articleId,
        media_id: mediaRecord.id,
        usage_type: 'featured',
        sort_order: 0,
      });
      await supabase
        .from('articles')
        .update({ featured_media_id: mediaRecord.id, featured_image_url: publicUrl })
        .eq('id', articleId);
    }

    return res.status(200).json({
      success: true,
      url: publicUrl,
      r2Key,
      mediaId: mediaRecord?.id,
      media: mediaRecord,
    });
  } catch (err) {
    console.error('R2 upload failure:', err);
    return res.status(500).json({ error: err.message });
  }
}
