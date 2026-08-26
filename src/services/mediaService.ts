import { supabase } from '../lib/supabase';

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

export const uploadArticleImage = async (
  file: File,
  articleId?: string
): Promise<{ url: string; path: string; error?: string }> => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      url: '',
      path: '',
      error: `Invalid file type "${file.type}". Allowed: JPG, PNG, WEBP, AVIF, GIF.`,
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      url: '',
      path: '',
      error: 'File size exceeds maximum 10MB limit.',
    };
  }

  const cleanName = sanitizeFileName(file.name);
  const folder = articleId ? `articles/${articleId}` : 'articles/general';
  const filePath = `${folder}/${cleanName}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from('article-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return { url: '', path: '', error: uploadError.message };
    }

    const { data } = supabase.storage.from('article-images').getPublicUrl(filePath);

    // Also register in media table for cataloging
    try {
      await supabase.from('media').insert({
        file_name: cleanName,
        storage_path: filePath,
        public_url: data.publicUrl,
        mime_type: file.type,
        file_size: file.size,
        media_type: 'image',
        alt_text: file.name.replace(/\.[^/.]+$/, ''),
      });
    } catch (dbErr) {
      console.warn('Could not record media metadata in database:', dbErr);
    }

    return { url: data.publicUrl, path: filePath };
  } catch (err: any) {
    console.error('Unexpected error in uploadArticleImage:', err);
    return { url: '', path: '', error: err?.message || 'Upload failed' };
  }
};

export const uploadMedia = async (
  file: File,
  altText?: string,
  credit?: string
): Promise<{ asset?: MediaAsset; error?: string }> => {
  if (file.size > 50 * 1024 * 1024) {
    return { error: 'File size exceeds 50MB limit.' };
  }

  const isImage = file.type.startsWith('image/');
  const cleanName = sanitizeFileName(file.name);
  const filePath = `uploads/${new Date().getFullYear()}/${cleanName}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { error: uploadError.message };
    }

    const { data } = supabase.storage.from('media').getPublicUrl(filePath);

    const { data: dbData, error: dbError } = await supabase
      .from('media')
      .insert({
        file_name: cleanName,
        storage_path: filePath,
        public_url: data.publicUrl,
        mime_type: file.type,
        file_size: file.size,
        media_type: isImage ? 'image' : 'document',
        alt_text: altText || file.name.replace(/\.[^/.]+$/, ''),
        caption: credit || 'NP News Metro Media Desk',
      })
      .select()
      .single();

    if (dbError) {
      return {
        asset: {
          id: `med-${Date.now()}`,
          title: cleanName,
          url: data.publicUrl,
          dimensions: '1920 � 1080',
          credit: credit || 'NP News Metro',
          alt: altText || cleanName,
          focal: 'Center (50%, 50%)',
          mediaType: isImage ? 'image' : 'document',
        },
      };
    }

    return {
      asset: {
        id: dbData.id,
        title: dbData.file_name,
        url: dbData.public_url,
        dimensions: `${dbData.width || 1920} � ${dbData.height || 1080}`,
        credit: dbData.caption || 'NP News Metro',
        alt: dbData.alt_text || dbData.file_name,
        focal: 'Center (50%, 50%)',
        mediaType: dbData.media_type,
        fileSize: dbData.file_size || undefined,
        createdAt: dbData.created_at || undefined,
      },
    };
  } catch (err: any) {
    return { error: err?.message || 'Media upload failed' };
  }
};

export const getMediaLibrary = async (): Promise<MediaAsset[]> => {
  try {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return [
        {
          id: 'med-1',
          title: 'Parliament House New Delhi Session',
          url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=600',
          dimensions: '1920 � 1080',
          credit: 'PTI / Vijay Verma',
          alt: 'Parliament building exterior during winter session',
          focal: 'Center (50%, 50%)',
          mediaType: 'image',
        },
        {
          id: 'med-2',
          title: 'Western Port Maritime Corridor Freight Yard',
          url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=600',
          dimensions: '2400 � 1350',
          credit: 'Reuters / Amit Dave',
          alt: 'Container logistics and ship freight loading',
          focal: 'Top-Right (65%, 35%)',
          mediaType: 'image',
        },
        {
          id: 'med-3',
          title: 'Dal Lake Srinagar Ecological Drone Panorama',
          url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600',
          dimensions: '1920 � 1080',
          credit: 'Meera Iyer / NP News',
          alt: 'Aerial perspective of Dal Lake and houseboats',
          focal: 'Center (50%, 50%)',
          mediaType: 'image',
        },
      ];
    }

    return data.map((m) => ({
      id: m.id,
      title: m.file_name,
      url: m.public_url,
      dimensions: m.width && m.height ? `${m.width} � ${m.height}` : '1920 � 1080',
      credit: m.caption || 'NP News Desk',
      alt: m.alt_text || m.file_name,
      focal: 'Center (50%, 50%)',
      mediaType: m.media_type,
      fileSize: m.file_size || undefined,
      createdAt: m.created_at || undefined,
    }));
  } catch (err) {
    console.error('Error fetching media library:', err);
    return [];
  }
};
