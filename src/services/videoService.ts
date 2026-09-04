import { ensureAuthenticatedSession } from './authService';
import { supabase } from '../lib/supabase';
import { WpVideo } from '../types/wordpress';
import { mockVideos } from '../data/mockWpData';
import { 
  cleanDescriptionHashtags, 
  getStoredVideos, 
  savePublishedVideo, 
  deleteStoredVideo 
} from '../utils/newsStorage';

export interface YouTubeMetadata {
  videoId: string;
  youtubeUrl: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelName: string;
  channelId?: string;
  publishedAt: string;
  durationSeconds: number;
  durationFormatted: string;
}

export const extractYouTubeVideoId = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();

  // If it is already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }

  // Common YouTube URL regex patterns
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i,
    /^[a-zA-Z0-9_-]{11}$/
  ];

  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

export const fetchYouTubeMetadata = async (
  urlOrId: string
): Promise<{ metadata?: YouTubeMetadata; error?: string }> => {
  const videoId = extractYouTubeVideoId(urlOrId);

  if (!videoId) {
    return {
      error: 'Invalid YouTube URL or Video ID. Please provide a standard YouTube video link (e.g., https://www.youtube.com/watch?v=...)',
    };
  }

  const standardUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const apiKey = import.meta.env?.VITE_YOUTUBE_API_KEY;

  // 1. Try YouTube Data API v3 if key exists
  if (apiKey) {
    try {
      const apiEndpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;
      const response = await fetch(apiEndpoint);
      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          const item = data.items[0];
          const snippet = item.snippet;
          const contentDetails = item.contentDetails;

          // Parse ISO 8601 duration (PT4M30S)
          let durationSeconds = 240;
          if (contentDetails?.duration) {
            const match = contentDetails.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
            if (match) {
              const hours = parseInt(match[1] || '0', 10);
              const mins = parseInt(match[2] || '0', 10);
              const secs = parseInt(match[3] || '0', 10);
              durationSeconds = hours * 3600 + mins * 60 + secs;
            }
          }

          const mins = Math.floor(durationSeconds / 60);
          const secs = (durationSeconds % 60).toString().padStart(2, '0');

          return {
            metadata: {
              videoId,
              youtubeUrl: standardUrl,
              title: snippet.title || 'Untitled Video',
              description: cleanDescriptionHashtags(snippet.description || ''),
              thumbnailUrl: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
              channelName: snippet.channelTitle || 'NP News Metro Video Desk',
              channelId: snippet.channelId || undefined,
              publishedAt: snippet.publishedAt || new Date().toISOString(),
              durationSeconds,
              durationFormatted: `${mins}:${secs}`,
            },
          };
        }
      }
    } catch (apiErr) {
      console.warn('YouTube Data API lookup failed, falling back to oEmbed:', apiErr);
    }
  }

  // 2. Fallback: YouTube oEmbed API (Public & Zero Auth Required)
  try {
    const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(standardUrl)}&format=json`;
    const res = await fetch(oEmbedUrl);

    if (!res.ok) {
      if (res.status === 404) {
        return { error: 'YouTube video not found. It may be private, removed, or the ID is incorrect.' };
      }
      return { error: `Failed to retrieve YouTube metadata (HTTP ${res.status}).` };
    }

    const oEmbedData = await res.json();

    return {
      metadata: {
        videoId,
        youtubeUrl: standardUrl,
        title: oEmbedData.title || 'YouTube News Report',
        description: `Visual dispatch from ${oEmbedData.author_name || 'NP News Metro'}.`,
        thumbnailUrl: oEmbedData.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        channelName: oEmbedData.author_name || 'NP News Metro Prime',
        publishedAt: new Date().toISOString(),
        durationSeconds: 300,
        durationFormatted: '5:00',
      },
    };
  } catch (err: any) {
    // If offline/CORS blocked, build valid fallback metadata from Video ID
    return {
      metadata: {
        videoId,
        youtubeUrl: standardUrl,
        title: `YouTube News Dispatch (${videoId})`,
        description: 'Ground visual coverage and editorial analysis.',
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        channelName: 'NP News Metro',
        publishedAt: new Date().toISOString(),
        durationSeconds: 300,
        durationFormatted: '5:00',
      },
    };
  }
};

export const mapDbToWpVideo = (row: any): WpVideo => {
  const durationSec = row.duration_seconds || 240;
  const mins = Math.floor(durationSec / 60);
  const secs = (durationSec % 60).toString().padStart(2, '0');

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.categories?.name || 'Documentaries & Deep Dives',
    videoUrl: row.youtube_url || `https://www.youtube.com/watch?v=${row.youtube_video_id}`,
    posterUrl: row.thumbnail_url || `https://img.youtube.com/vi/${row.youtube_video_id}/hqdefault.jpg`,
    duration: `${mins}:${secs}`,
    caption: row.description || '',
    transcript: [],
    presenter: row.channel_name || 'NP News Metro Staff',
    authorId: row.created_by || 'author-1',
    publishedAt: row.published_at || row.created_at || new Date().toISOString(),
    viewsCount: '18.2K',
  };
};

const VIDEO_FIELDS = `
  id, slug, title, youtube_url, youtube_video_id, description,
  thumbnail_url, channel_name, published_at, duration_seconds,
  status, category_id,
  categories (id, name, slug)
`;

// Client-side in-memory cache to strictly protect Supabase DB and Egress limits
let cachedPublishedVideos: { data: WpVideo[]; timestamp: number } | null = null;
const cachedVideoBySlug = new Map<string, { data: WpVideo | null; timestamp: number }>();
const CLIENT_VIDEO_TTL = 3 * 60 * 1000; // 3 minutes

export const invalidateVideoClientCache = () => {
  cachedPublishedVideos = null;
  cachedVideoBySlug.clear();
};

export const getPublishedVideos = async (): Promise<WpVideo[]> => {
  if (cachedPublishedVideos && Date.now() - cachedPublishedVideos.timestamp < CLIENT_VIDEO_TTL) {
    return cachedPublishedVideos.data;
  }

  // 1. Try Vercel Edge cached API
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/videos');
      if (res.ok) {
        const json = await res.json();
        if (json?.videos && Array.isArray(json.videos) && json.videos.length > 0) {
          const liveVideos = json.videos.map(mapDbToWpVideo);
          const stored = getStoredVideos();
          const combined = [...liveVideos];
          for (const sv of stored) {
            if (!combined.some(c => c.id === sv.id || c.videoUrl === sv.videoUrl)) {
              combined.push(sv);
            }
          }
          cachedPublishedVideos = { data: combined, timestamp: Date.now() };
          return combined;
        }
      }
    }
  } catch (apiErr) {}

  // 2. Direct Supabase fallback
  try {
    const { data, error } = await supabase
      .from('videos')
      .select(VIDEO_FIELDS)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(50);

    const stored = getStoredVideos();
    if (error || !data || data.length === 0) {
      cachedPublishedVideos = { data: stored, timestamp: Date.now() };
      return stored;
    }

    const liveVideos = data.map(mapDbToWpVideo);
    const combined = [...liveVideos];
    for (const sv of stored) {
      if (!combined.some(c => c.id === sv.id || c.videoUrl === sv.videoUrl)) {
        combined.push(sv);
      }
    }
    cachedPublishedVideos = { data: combined, timestamp: Date.now() };
    return combined;
  } catch (err) {
    console.error('Error fetching videos from Supabase:', err);
    return getStoredVideos();
  }
};

export const getVideoBySlug = async (slug: string): Promise<WpVideo | null> => {
  const cached = cachedVideoBySlug.get(slug);
  if (cached && Date.now() - cached.timestamp < CLIENT_VIDEO_TTL) {
    return cached.data;
  }

  // 1. Try Vercel Edge cached API
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/videos?slug=${encodeURIComponent(slug)}`);
      if (res.ok) {
        const json = await res.json();
        if (json?.video) {
          const mapped = mapDbToWpVideo(json.video);
          cachedVideoBySlug.set(slug, { data: mapped, timestamp: Date.now() });
          return mapped;
        }
      }
    }
  } catch (apiErr) {}

  // 2. Direct Supabase fallback
  try {
    const { data, error } = await supabase
      .from('videos')
      .select(VIDEO_FIELDS)
      .eq('slug', slug)
      .single();

    if (error || !data) {
      const stored = getStoredVideos();
      const mock = stored.find(v => v.slug === slug) || mockVideos.find(v => v.slug === slug);
      const res = mock || null;
      cachedVideoBySlug.set(slug, { data: res, timestamp: Date.now() });
      return res;
    }

    const mapped = mapDbToWpVideo(data);
    cachedVideoBySlug.set(slug, { data: mapped, timestamp: Date.now() });
    return mapped;
  } catch (err) {
    return null;
  }
};

export const saveVideo = async (
  videoData: {
    id?: string;
    title: string;
    slug?: string;
    youtubeUrl: string;
    youtubeVideoId: string;
    description?: string;
    thumbnailUrl?: string;
    channelName?: string;
    channelId?: string;
    durationSeconds?: number;
    status?: 'draft' | 'published' | 'archived';
    categoryId?: string;
    categoryName?: string;
  }
): Promise<{ video?: WpVideo; error?: string }> => {
  const cleanTitle = videoData.title.trim();
  const cleanDesc = cleanDescriptionHashtags(videoData.description || '');
  const cleanSlug = videoData.slug?.trim() || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60);
  const durationSec = videoData.durationSeconds || 300;
  const mins = Math.floor(durationSec / 60);
  const secs = (durationSec % 60).toString().padStart(2, '0');

  const fallbackVideo: WpVideo = {
    id: videoData.id || `vid-${Date.now()}`,
    title: cleanTitle,
    slug: cleanSlug,
    category: videoData.categoryName || 'Documentaries & Deep Dives',
    videoUrl: videoData.youtubeUrl,
    posterUrl: videoData.thumbnailUrl || `https://img.youtube.com/vi/${videoData.youtubeVideoId}/hqdefault.jpg`,
    duration: `${mins}:${secs}`,
    caption: cleanDesc,
    transcript: [],
    presenter: videoData.channelName || 'NP Newsroom Video Desk',
    authorId: 'author-1',
    publishedAt: new Date().toISOString(),
    viewsCount: '1.2K',
  };

  const CATEGORY_NAME_TO_UUID: Record<string, string> = {
    'Documentaries & Deep Dives': '11111111-1111-1111-1111-111111110004',
    'Explainers & Analysis': '11111111-1111-1111-1111-111111110004',
    'Ground Report': '11111111-1111-1111-1111-111111110001',
    'Prime Interviews': '11111111-1111-1111-1111-111111110009',
    'Business & Economy': '11111111-1111-1111-1111-111111110003',
    'Politics & Governance': '11111111-1111-1111-1111-111111110002',
    'Technology & Future': '11111111-1111-1111-1111-111111110004',
    'Newsroom Shorts': '11111111-1111-1111-1111-111111110001',
  };

  const targetCategoryId = videoData.categoryId || 
    (videoData.categoryName ? CATEGORY_NAME_TO_UUID[videoData.categoryName] : undefined) || 
    '11111111-1111-1111-1111-111111110004';

  try {
    const authUserId = await ensureAuthenticatedSession().catch(() => null);

    const payload: any = {
      title: cleanTitle,
      slug: cleanSlug,
      youtube_url: videoData.youtubeUrl,
      youtube_video_id: videoData.youtubeVideoId,
      description: cleanDesc,
      thumbnail_url: videoData.thumbnailUrl || null,
      channel_name: videoData.channelName || 'NP News Metro',
      channel_id: videoData.channelId || null,
      duration_seconds: durationSec,
      status: videoData.status || 'published',
      category_id: targetCategoryId,
      published_at: new Date().toISOString(),
    };

    if (authUserId) {
      payload.created_by = authUserId;
    }

    let result: any = null;

    if (videoData.id && !videoData.id.startsWith('vid-')) {
      const { data, error } = await supabase
        .from('videos')
        .update(payload)
        .eq('id', videoData.id)
        .select(VIDEO_FIELDS)
        .single();

      if (!error && data) {
        result = data;
      }
    } else {
      const { data, error } = await supabase
        .from('videos')
        .insert(payload)
        .select(VIDEO_FIELDS)
        .single();

      if (!error && data) {
        result = data;
      }
    }

    const finalVideo = result ? mapDbToWpVideo(result) : fallbackVideo;
    savePublishedVideo(finalVideo);

    // Trigger edge cache invalidation
    try {
      fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: finalVideo.slug, type: 'video', category: 'videos' }),
      }).catch(() => {});
    } catch (e) {}

    return { video: finalVideo };
  } catch (err: any) {
    savePublishedVideo(fallbackVideo);
    return { video: fallbackVideo };
  }
};

export const deleteVideo = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await ensureAuthenticatedSession().catch(() => {});
    if (!id.startsWith('vid-')) {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) console.warn('Supabase video delete warning:', error.message);
    }
    deleteStoredVideo(id);

    // Trigger edge cache invalidation
    try {
      fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'video', category: 'videos' }),
      }).catch(() => {});
    } catch (e) {}

    return { success: true };
  } catch (err: any) {
    deleteStoredVideo(id);
    return { success: true };
  }
};
