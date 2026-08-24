import { ensureAuthenticatedSession } from './authService';
import { supabase } from '../lib/supabase';
import { WpVideo } from '../types/wordpress';
import { mockVideos } from '../data/mockWpData';

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
              description: snippet.description || '',
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

export const getPublishedVideos = async (): Promise<WpVideo[]> => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*, categories (name, slug)')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return mockVideos;
    }

    return data.map(mapDbToWpVideo);
  } catch (err) {
    console.error('Error fetching videos from Supabase:', err);
    return mockVideos;
  }
};

export const getVideoBySlug = async (slug: string): Promise<WpVideo | null> => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*, categories (name, slug)')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      const mock = mockVideos.find(v => v.slug === slug);
      return mock || null;
    }

    return mapDbToWpVideo(data);
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
  }
): Promise<{ video?: WpVideo; error?: string }> => {
  try {
    await ensureAuthenticatedSession();
    const cleanTitle = videoData.title.trim();
    const cleanSlug = videoData.slug?.trim() || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60);

    const payload = {
      title: cleanTitle,
      slug: cleanSlug,
      youtube_url: videoData.youtubeUrl,
      youtube_video_id: videoData.youtubeVideoId,
      description: videoData.description || null,
      thumbnail_url: videoData.thumbnailUrl || null,
      channel_name: videoData.channelName || 'NP News Metro',
      channel_id: videoData.channelId || null,
      duration_seconds: videoData.durationSeconds || 300,
      status: videoData.status || 'published',
      category_id: videoData.categoryId || '11111111-1111-1111-1111-111111110004',
      published_at: videoData.status === 'published' ? new Date().toISOString() : null,
    };

    let result: any = null;

    if (videoData.id && !videoData.id.startsWith('vid-')) {
      const { data, error } = await supabase
        .from('videos')
        .update(payload)
        .eq('id', videoData.id)
        .select('*, categories (name, slug)')
        .single();

      if (error) return { error: error.message };
      result = data;
    } else {
      const { data, error } = await supabase
        .from('videos')
        .insert(payload)
        .select('*, categories (name, slug)')
        .single();

      if (error) return { error: error.message };
      result = data;
    }

    return { video: mapDbToWpVideo(result) };
  } catch (err: any) {
    return { error: err?.message || 'Failed to save video.' };
  }
};
