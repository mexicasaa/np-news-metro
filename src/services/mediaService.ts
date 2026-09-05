import { supabase } from '../lib/supabase';
import { R2MediaRepository } from '../repositories/r2/R2MediaRepository';

export interface MediaAsset {
  id: string;
  title: string;
  url: string;
  dimensions: string;
  credit: string;
  alt: string;
  focal: string;
  mediaType: string;
  fileSize?: number;
  createdAt?: string;
  contentHash?: string;
  r2Key?: string;
  isDeduplicated?: boolean;
  referenceCount?: number;
  variantUrls?: {
    w320: string;
    w640: string;
    w960: string;
    w1280: string;
  };
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const sanitizeFileName = (fileName: string): string => {
  const parts = fileName.split('.');
  const ext = parts.pop()?.toLowerCase() || '';
  const base = parts.join('.').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 50);
  const unique = Date.now().toString(36);
  return `${base}-${unique}.${ext}`;
};

/**
 * Generate responsive srcset string for high-scale edge caching
 */
export const generateSrcSet = (url: string, contentHash?: string): string => {
  if (!url) return '';
  if (!contentHash) return `${url} 1x`;

  const baseUrl = url.split('?')[0];
  const domain = baseUrl.substring(0, baseUrl.lastIndexOf('/'));
  return `
    ${domain}/320.webp 320w,
    ${domain}/640.webp 640w,
    ${domain}/960.webp 960w,
    ${domain}/1280.webp 1280w
  `.trim();
};

/**
 * Upload an image with SHA-256 deduplication and relationship linking.
 * Never stores duplicate image files or duplicate media records.
 */
export const uploadArticleImage = async (
  file: File | Blob,
  articleId?: string,
  customFileName?: string
): Promise<{ url: string; path: string; mediaId?: string; isDuplicate?: boolean; error?: string }> => {
  const fileType = file.type || 'image/jpeg';
  if (!ALLOWED_IMAGE_TYPES.includes(fileType)) {
    return {
      url: '',
      path: '',
      error: `Invalid file type "${fileType}". Allowed: JPG, PNG, WEBP, AVIF, GIF.`,
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      url: '',
      path: '',
      error: 'File size exceeds maximum 10MB limit.',
    };
  }

  const fileName = customFileName || (file instanceof File ? file.name : `cropped-${Date.now()}.jpg`);
  const r2Repo = R2MediaRepository.getInstance();

  try {
    // 1. Calculate SHA-256 content hash
    const contentHash = await r2Repo.computeContentHash(file);

    // 2. Deduplicate or upload
    const { media, isDuplicate } = await r2Repo.upload(file, contentHash, {
      fileName,
      mimeType: fileType,
      fileSize: file.size,
      altText: fileName.replace(/\.[^/.]+$/, ''),
      caption: 'NP News Metro Media Desk',
    });

    // 3. Link relationship to article if articleId is provided
    if (articleId && articleId !== 'avatars') {
      await r2Repo.linkArticleMedia({
        articleId,
        mediaId: media.id,
        usageType: 'featured',
        sortOrder: 0,
      });

      // Update article.featured_media_id in articles table if article exists
      try {
        await supabase
          .from('articles')
          .update({ featured_media_id: media.id })
          .eq('id', articleId);
      } catch {}
    }

    return {
      url: media.publicUrl,
      path: media.storagePath,
      mediaId: media.id,
      isDuplicate,
    };
  } catch (err: any) {
    console.error('Unexpected error in uploadArticleImage:', err);
    return { url: '', path: '', error: err?.message || 'Upload failed' };
  }
};

/**
 * General media uploader for editorial desk with deduplication
 */
export const uploadMedia = async (
  file: File,
  altText?: string,
  credit?: string
): Promise<{ asset?: MediaAsset; error?: string }> => {
  if (file.size > 50 * 1024 * 1024) {
    return { error: 'File size exceeds 50MB limit.' };
  }

  const isImage = file.type.startsWith('image/');
  const r2Repo = R2MediaRepository.getInstance();

  try {
    const contentHash = await r2Repo.computeContentHash(file);
    const { media, isDuplicate } = await r2Repo.upload(file, contentHash, {
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      altText: altText || file.name.replace(/\.[^/.]+$/, ''),
      caption: credit || 'NP News Metro Media Desk',
    });

    return {
      asset: {
        id: media.id,
        title: media.fileName,
        url: media.publicUrl,
        dimensions: `${media.width || 1920} × ${media.height || 1080}`,
        credit: media.caption || credit || 'NP News Metro',
        alt: media.altText || altText || media.fileName,
        focal: 'Center (50%, 50%)',
        mediaType: isImage ? 'image' : 'document',
        fileSize: media.fileSize || undefined,
        createdAt: media.createdAt || undefined,
        contentHash: media.contentHash || undefined,
        r2Key: media.r2Key || undefined,
        isDeduplicated: isDuplicate,
        variantUrls: media.variantUrls,
      },
    };
  } catch (err: any) {
    return { error: err?.message || 'Media upload failed' };
  }
};

/**
 * Fetch media library with reference counts and deduplication metadata
 */
export const getMediaLibrary = async (): Promise<MediaAsset[]> => {
  try {
    const { data, error } = await supabase
      .from('media')
      .select(`
        id, file_name, storage_path, public_url, mime_type, file_size, width, height,
        alt_text, caption, media_type, created_at, content_hash, r2_key,
        article_media (count)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data || data.length === 0) {
      return [
        {
          id: 'med-1',
          title: 'Parliament House New Delhi Session',
          url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=600',
          dimensions: '1920 × 1080',
          credit: 'PTI / Vijay Verma',
          alt: 'Parliament building exterior during winter session',
          focal: 'Center (50%, 50%)',
          mediaType: 'image',
          referenceCount: 1,
        },
        {
          id: 'med-2',
          title: 'Western Port Maritime Corridor Freight Yard',
          url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=600',
          dimensions: '2400 × 1350',
          credit: 'Reuters / Amit Dave',
          alt: 'Container logistics and ship freight loading',
          focal: 'Top-Right (65%, 35%)',
          mediaType: 'image',
          referenceCount: 1,
        },
      ];
    }

    const r2Repo = R2MediaRepository.getInstance();

    return data.map((m: any) => {
      const refCount = Array.isArray(m.article_media) && m.article_media[0]?.count
        ? Number(m.article_media[0].count)
        : 0;

      return {
        id: m.id,
        title: m.file_name,
        url: m.public_url,
        dimensions: m.width && m.height ? `${m.width} × ${m.height}` : '1920 × 1080',
        credit: m.caption || 'NP News Desk',
        alt: m.alt_text || m.file_name,
        focal: 'Center (50%, 50%)',
        mediaType: m.media_type || 'image',
        fileSize: m.file_size || undefined,
        createdAt: m.created_at || undefined,
        contentHash: m.content_hash || undefined,
        r2Key: m.r2_key || undefined,
        referenceCount: refCount,
        variantUrls: {
          w320: r2Repo.getUrl(`media/${m.content_hash || m.id}/320.webp`),
          w640: r2Repo.getUrl(`media/${m.content_hash || m.id}/640.webp`),
          w960: r2Repo.getUrl(`media/${m.content_hash || m.id}/960.webp`),
          w1280: r2Repo.getUrl(`media/${m.content_hash || m.id}/1280.webp`),
        },
      };
    });
  } catch (err) {
    console.error('Error fetching media library:', err);
    return [];
  }
};
