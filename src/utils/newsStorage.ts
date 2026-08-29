import { WpPost, WpVideo } from '../types/wordpress';
import { mockPosts as defaultMockPosts, mockVideos } from '../data/mockWpData';

const STORAGE_KEY = 'np_news_published_posts';
const BROADCAST_CHANNEL_NAME = 'np_news_feed_channel';

/**
 * Storage & Cache Engine
 * Mirrors published articles for instant cross-tab updates and offline resilient cache.
 */

export const getStoredPosts = (): WpPost[] => {
  if (typeof window === 'undefined') return defaultMockPosts;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMockPosts));
      return defaultMockPosts;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return defaultMockPosts;
  } catch (err) {
    console.error('Error reading stored posts from localStorage:', err);
    return defaultMockPosts;
  }
};

export interface AutoSaveSession {
  post: Partial<WpPost>;
  adminSection: 'new-article' | 'edit-article';
  isEdit: boolean;
  timestamp: number;
}

const AUTOSAVE_SESSION_KEY = 'np_news_editor_autosave_session';

export const saveAutoSaveSession = (session: AutoSaveSession): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTOSAVE_SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('Failed to save auto-save session:', err);
  }
};

export const getAutoSaveSession = (): AutoSaveSession | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTOSAVE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AutoSaveSession;
  } catch (err) {
    return null;
  }
};

export const clearAutoSaveSession = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTOSAVE_SESSION_KEY);
  } catch (err) {}
};

export interface RefreshSession {
  post: Partial<WpPost>;
  adminSection: 'new-article' | 'edit-article';
  isEdit: boolean;
  refreshedAt: number;
}

const REFRESH_SESSION_KEY = 'np_news_editor_refresh_restore';

export const setRefreshSession = (session: RefreshSession): void => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(REFRESH_SESSION_KEY, JSON.stringify(session));
  } catch (e) {}
};

export const popRefreshSession = (): RefreshSession | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(REFRESH_SESSION_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(REFRESH_SESSION_KEY);
    const parsed = JSON.parse(raw);
    if (parsed && parsed.refreshedAt && Date.now() - parsed.refreshedAt < 45000) {
      return parsed as RefreshSession;
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const savePublishedPost = (post: WpPost): WpPost[] => {
  if (typeof window === 'undefined') return [post, ...defaultMockPosts];
  try {
    const currentPosts = getStoredPosts();
    const existingIndex = currentPosts.findIndex(
      p => p.id === post.id || (p.slug && post.slug && p.slug === post.slug)
    );

    const isDraft = post.editorialStatus === 'draft' || (post as any).status === 'draft';

    let updated: WpPost[];
    if (isDraft) {
      // Drafts should preserve their own state without hijacking homepage lead
      if (existingIndex >= 0) {
        const existing = currentPosts[existingIndex];
        const mergedDraft: WpPost = {
          ...existing,
          ...post,
          updatedAt: new Date().toISOString(),
        };
        updated = [...currentPosts];
        updated[existingIndex] = mergedDraft;
      } else {
        const enrichedDraft: WpPost = {
          ...post,
          isLead: false,
          isFeatured: false,
          publishedAt: post.publishedAt || new Date().toISOString(),
          viewsCount: post.viewsCount || 0,
        };
        updated = [enrichedDraft, ...currentPosts];
      }
    } else if (existingIndex >= 0) {
      const existing = currentPosts[existingIndex];
      const mergedPost: WpPost = {
        ...existing,
        ...post,
        isLead: true,
        isFeatured: true,
        updatedAt: new Date().toISOString(),
      };
      updated = [
        mergedPost,
        ...currentPosts.filter((_, idx) => idx !== existingIndex).map(p => ({ ...p, isLead: false }))
      ];
    } else {
      const enrichedPost: WpPost = {
        ...post,
        isLead: true,
        isFeatured: true,
        publishedAt: post.publishedAt || new Date().toISOString(),
        viewsCount: post.viewsCount || 140,
      };
      updated = [
        enrichedPost,
        ...currentPosts.map(p => ({ ...p, isLead: false }))
      ];
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (storageErr) {
      try {
        const trimmed = updated.slice(0, 30);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      } catch (e) {}
    }

    // Broadcast across browser tabs
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        channel.postMessage({ type: 'NEWS_PUBLISHED', post });
        channel.close();
      }
    } catch (e) {}

    return updated;
  } catch (err) {
    console.error('Error saving post to cache:', err);
    return [post, ...defaultMockPosts];
  }
};

export const deleteStoredPost = (postId: string): WpPost[] => {
  if (typeof window === 'undefined') return defaultMockPosts;
  try {
    const currentPosts = getStoredPosts();
    const updated = currentPosts.filter(p => p.id !== postId && p.slug !== postId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    return defaultMockPosts;
  }
};

export const resetStoredPostsToDefault = (): WpPost[] => {
  if (typeof window === 'undefined') return defaultMockPosts;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMockPosts));
    return defaultMockPosts;
  } catch (err) {
    return defaultMockPosts;
  }
};

/**
 * Strips all hashtags (#tags) from text, cleans up empty brackets,
 * collapses redundant spaces/newlines, and trims.
 * Supports alphanumeric English, Hindi/Devanagari, and hyphen/underscore tags.
 */
export const cleanDescriptionHashtags = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/#[\w\u0900-\u097F-]+/g, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\[\s*\]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
};

const VIDEOS_STORAGE_KEY = 'np_news_stored_videos';

export const getStoredVideos = (): WpVideo[] => {
  if (typeof window === 'undefined') return mockVideos;
  try {
    const raw = localStorage.getItem(VIDEOS_STORAGE_KEY);
    if (!raw) return mockVideos;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return mockVideos;
  } catch (err) {
    return mockVideos;
  }
};

export const savePublishedVideo = (video: WpVideo): WpVideo[] => {
  if (typeof window === 'undefined') return [video, ...mockVideos];
  try {
    const current = getStoredVideos();
    const existingIdx = current.findIndex(v => v.id === video.id || v.slug === video.slug);
    let updated: WpVideo[];
    if (existingIdx !== -1) {
      updated = [...current];
      updated[existingIdx] = video;
    } else {
      updated = [video, ...current];
    }
    localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(updated));

    // Broadcast update across tabs
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('np_news_feed_channel');
        ch.postMessage({ type: 'VIDEOS_UPDATED', video });
        ch.close();
      }
    } catch (e) {}

    return updated;
  } catch (err) {
    return [video, ...mockVideos];
  }
};

export const deleteStoredVideo = (videoId: string): WpVideo[] => {
  if (typeof window === 'undefined') return mockVideos;
  try {
    const current = getStoredVideos();
    const updated = current.filter(v => v.id !== videoId && v.slug !== videoId);
    localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(updated));

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('np_news_feed_channel');
        ch.postMessage({ type: 'VIDEOS_UPDATED', videoId });
        ch.close();
      }
    } catch (e) {}

    return updated;
  } catch (err) {
    return mockVideos;
  }
};
