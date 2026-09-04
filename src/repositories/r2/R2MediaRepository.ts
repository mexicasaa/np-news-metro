import { supabase } from '../../lib/supabase';
import { MediaUploadMeta, MediaRecord, ArticleMediaRelation } from '../types';

export class R2MediaRepository {
  private static instance: R2MediaRepository;
  private readonly r2PublicBaseUrl: string;

  private constructor() {
    this.r2PublicBaseUrl = (typeof process !== 'undefined' && (process.env?.R2_PUBLIC_URL || process.env?.VITE_R2_PUBLIC_URL)) ||
      (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_R2_PUBLIC_URL) ||
      'https://pub-a4495fe3c1c741f2a1c8d8cd43ce064f.r2.dev';
  }

  public static getInstance(): R2MediaRepository {
    if (!R2MediaRepository.instance) {
      R2MediaRepository.instance = new R2MediaRepository();
    }
    return R2MediaRepository.instance;
  }

  /**
   * Compute stable SHA-256 content hash for deduplication
   */
  public async computeContentHash(data: ArrayBuffer | Uint8Array | Blob): Promise<string> {
    let buffer: ArrayBuffer;
    if (data instanceof Blob) {
      buffer = await data.arrayBuffer();
    } else if (data instanceof Uint8Array) {
      buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
    } else {
      buffer = data;
    }

    const subtle = typeof globalThis !== 'undefined' ? (globalThis.crypto?.subtle) : undefined;
    if (subtle) {
      const digest = await subtle.digest('SHA-256', buffer);
      return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }

    // Node.js server environment fallback
    if (typeof window === 'undefined') {
      try {
        const nodeCrypto = await (Function('return import("node:crypto")')());
        return nodeCrypto.createHash('sha256').update(Buffer.from(buffer)).digest('hex');
      } catch {}
    }

    // Fallback pseudo-hash
    let hash = 0;
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
      hash = (hash << 5) - hash + bytes[i];
      hash |= 0;
    }
    return `fallback-${Math.abs(hash).toString(16)}-${bytes.length}`;
  }

  /**
   * Check if a media asset with the exact content hash already exists
   */
  public async findByHash(contentHash: string): Promise<MediaRecord | null> {
    if (!contentHash) return null;

    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('content_hash', contentHash)
        .maybeSingle();

      if (error || !data) return null;

      return this.mapToRecord(data);
    } catch (err) {
      console.warn('Error checking media by content hash:', err);
      return null;
    }
  }

  /**
   * Get public CDN URL for an R2 key or storage path
   */
  public getUrl(r2Key: string): string {
    if (!r2Key) return '';
    if (r2Key.startsWith('http://') || r2Key.startsWith('https://')) {
      return r2Key;
    }
    return `${this.r2PublicBaseUrl.replace(/\/$/, '')}/${r2Key.replace(/^\//, '')}`;
  }

  /**
   * Upload media with SHA-256 deduplication.
   * If already present, returns existing record immediately.
   */
  public async upload(
    file: File | Blob,
    contentHash: string,
    meta: MediaUploadMeta
  ): Promise<{ media: MediaRecord; isDuplicate: boolean }> {
    // 1. Mandatory deduplication check
    const existing = await this.findByHash(contentHash);
    if (existing) {
      return { media: existing, isDuplicate: true };
    }

    const cleanName = meta.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const r2Key = `media/${contentHash}/${cleanName}`;
    const storagePath = `media/${contentHash}/${cleanName}`;
    let publicUrl = this.getUrl(r2Key);

    // 2. Primary: Upload directly to Cloudflare R2 via Serverless S3 API
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const base64Data = await base64Promise;

      const r2Resp = await fetch('/api/r2-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data,
          fileName: meta.fileName,
          mimeType: meta.mimeType,
          contentHash,
          altText: meta.altText,
          caption: meta.caption,
        }),
      });

      if (r2Resp.ok) {
        const result = await r2Resp.json();
        if (result.media) {
          return { media: this.mapToRecord(result.media), isDuplicate: !!result.isDuplicate };
        }
      }
    } catch (r2Err) {
      console.warn('Direct R2 serverless upload error, attempting fallback:', r2Err);
    }

    // 3. Fallback: Upload to Supabase storage if direct R2 upload fails
    try {
      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(storagePath, file, {
          cacheControl: '31536000', // 1 year immutable edge cache
          upsert: true,
          contentType: meta.mimeType || 'image/webp',
        });

      if (!uploadError) {
        const { data } = supabase.storage.from('article-images').getPublicUrl(storagePath);
        if (data?.publicUrl) {
          publicUrl = data.publicUrl;
        }
      }
    } catch (storageErr) {
      console.warn('Storage upload note (fallback in effect):', storageErr);
    }

    // 3. Insert single media record in Supabase with UNIQUE(content_hash)
    try {
      const { data, error } = await supabase
        .from('media')
        .insert({
          file_name: cleanName,
          storage_path: storagePath,
          r2_key: r2Key,
          content_hash: contentHash,
          public_url: publicUrl,
          mime_type: meta.mimeType,
          file_size: meta.fileSize,
          width: meta.width || 1280,
          height: meta.height || 720,
          alt_text: meta.altText || cleanName.replace(/\.[^/.]+$/, ''),
          caption: meta.caption || meta.credit || 'NP News Metro Media Desk',
          media_type: meta.mimeType.startsWith('image/') ? 'image' : 'document',
          uploaded_by: meta.uploadedBy || null,
        })
        .select()
        .single();

      if (error) {
        // If conflict on content_hash occurs due to concurrent upload race
        if (error.code === '23505') {
          const concurrent = await this.findByHash(contentHash);
          if (concurrent) {
            return { media: concurrent, isDuplicate: true };
          }
        }
        throw error;
      }

      return { media: this.mapToRecord(data), isDuplicate: false };
    } catch (err: any) {
      // Re-query in case of concurrent insert
      const fallbackRecord = await this.findByHash(contentHash);
      if (fallbackRecord) {
        return { media: fallbackRecord, isDuplicate: true };
      }
      throw err;
    }
  }

  /**
   * Link an existing or new media item to an article
   */
  public async linkArticleMedia(relation: ArticleMediaRelation): Promise<void> {
    try {
      await supabase.from('article_media').upsert({
        article_id: relation.articleId,
        media_id: relation.mediaId,
        usage_type: relation.usageType,
        sort_order: relation.sortOrder,
      });
    } catch (err) {
      console.warn('Could not link article_media:', err);
    }
  }

  /**
   * List all articles referencing this media record
   */
  public async listReferences(mediaId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('article_media')
        .select('article_id')
        .eq('media_id', mediaId);

      if (error || !data) return [];
      return data.map((d) => d.article_id);
    } catch {
      return [];
    }
  }

  /**
   * Delete media if references are 0 (or called by orphan cleanup)
   */
  public async delete(mediaId: string, r2Key?: string): Promise<boolean> {
    try {
      const refs = await this.listReferences(mediaId);
      if (refs.length > 0) {
        console.warn(`Cannot delete media ${mediaId}: still referenced by ${refs.length} articles`);
        return false;
      }

      if (r2Key) {
        await supabase.storage.from('article-images').remove([r2Key]);
      }

      const { error } = await supabase.from('media').delete().eq('id', mediaId);
      return !error;
    } catch {
      return false;
    }
  }

  private mapToRecord(row: any): MediaRecord {
    const hash = row.content_hash || row.id;
    return {
      id: row.id,
      fileName: row.file_name,
      storagePath: row.storage_path,
      r2Key: row.r2_key,
      contentHash: row.content_hash,
      publicUrl: row.public_url,
      mimeType: row.mime_type,
      fileSize: row.file_size,
      width: row.width,
      height: row.height,
      altText: row.alt_text,
      caption: row.caption,
      mediaType: row.media_type,
      createdAt: row.created_at,
      uploadedBy: row.uploaded_by,
      variantUrls: {
        w320: `${this.r2PublicBaseUrl}/media/${hash}/320.webp`,
        w640: `${this.r2PublicBaseUrl}/media/${hash}/640.webp`,
        w960: `${this.r2PublicBaseUrl}/media/${hash}/960.webp`,
        w1280: `${this.r2PublicBaseUrl}/media/${hash}/1280.webp`,
      },
    };
  }
}
