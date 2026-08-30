import { WpPost, WpVideo } from '../types/wordpress';
import { mockPosts as defaultMockPosts, mockVideos } from '../data/mockWpData';

const STORAGE_KEY = 'np_news_published_posts';
const BROADCAST_CHANNEL_NAME = 'np_news_feed_channel';

/**
 * Storage & Cache Engine
 * Mirrors published articles for instant cross-tab updates and offline resilient cache.
 */

/**
 * Strict validator to check if an article is officially published.
 * Drafts, articles in writing mode, in-review, approved, scheduled, or archived articles
 * return FALSE and must NEVER be displayed on the live website.
 */
export const isPostPublished = (post: Partial<WpPost> | null | undefined): boolean => {
  if (!post) return false;

  // 1. If slug indicates draft
  if (post.slug === 'auto-draft' || post.slug?.startsWith('auto-draft') || post.slug === 'draft') {
    return false;
  }

  const rawStatus = (post.status || '').toLowerCase().trim();
  const rawEditorialStatus = (post.editorialStatus || '').toLowerCase().trim();

  // 2. Explicitly published statuses (takes precedence when officially published)
  const publishedStatuses = ['published', 'updated', 'corrected'];
  if (publishedStatuses.includes(rawStatus) || publishedStatuses.includes(rawEditorialStatus)) {
    return true;
  }

  // 3. Explicitly unpublished statuses
  const unpublishedStatuses = ['draft', 'review', 'approved', 'scheduled', 'archived', 'failed'];
  if (unpublishedStatuses.includes(rawStatus) || unpublishedStatuses.includes(rawEditorialStatus)) {
    return false;
  }

  // 4. Fallback for static mock posts where status might be omitted
  if (!rawStatus && !rawEditorialStatus && post.publishedAt) {
    return true;
  }

  return false;
};

export const getStoredPosts = (): WpPost[] => {
  if (typeof window === 'undefined') return defaultMockPosts.filter(isPostPublished);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = defaultMockPosts.filter(isPostPublished);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Strictly enforce that only published posts are returned
      return parsed.filter(isPostPublished);
    }
    return defaultMockPosts.filter(isPostPublished);
  } catch (err) {
    console.error('Error reading stored posts from localStorage:', err);
    return defaultMockPosts.filter(isPostPublished);
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

const DRAFT_STORAGE_KEY = 'np_news_editorial_drafts';

export const getStoredDraftPosts = (): WpPost[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Filter out any draft that is already published
    const published = getStoredPosts();
    const publishedTitles = new Set(published.map(p => (p.title || '').trim().toLowerCase()));
    const publishedIds = new Set(published.map(p => p.id));
    const publishedSlugs = new Set(published.map(p => p.slug));

    const cleanDrafts = parsed.filter((p: WpPost) => {
      if (isPostPublished(p) || p.status === 'published' || p.editorialStatus === 'published') return false;
      if (publishedIds.has(p.id)) return false;
      if (p.slug && publishedSlugs.has(p.slug)) return false;
      if (p.title && publishedTitles.has(p.title.trim().toLowerCase())) return false;
      return true;
    });

    if (cleanDrafts.length !== parsed.length) {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(cleanDrafts));
    }

    return cleanDrafts;
  } catch (e) {
    return [];
  }
};

export const saveDraftPost = (post: WpPost): void => {
  if (typeof window === 'undefined') return;
  try {
    // If the post is already published, NEVER save it as a draft!
    if (isPostPublished(post) || post.status === 'published' || post.editorialStatus === 'published') {
      removeStoredDraft(post.id, post.title);
      return;
    }

    // Check against published posts storage
    const published = getStoredPosts();
    const isAlreadyPublished = published.some(p => 
      p.id === post.id || 
      (p.slug && post.slug && p.slug === post.slug) ||
      (p.title && post.title && p.title.trim().toLowerCase() === post.title.trim().toLowerCase())
    );
    if (isAlreadyPublished) {
      removeStoredDraft(post.id, post.title);
      return;
    }

    const drafts = getStoredDraftPosts();
    const idx = drafts.findIndex(p => p.id === post.id || (p.slug && post.slug && p.slug === post.slug));
    const draftPost: WpPost = {
      ...post,
      editorialStatus: 'draft',
      status: 'draft',
      updatedAt: new Date().toISOString(),
    };
    let updatedDrafts: WpPost[];
    if (idx >= 0) {
      updatedDrafts = [...drafts];
      updatedDrafts[idx] = draftPost;
    } else {
      updatedDrafts = [draftPost, ...drafts];
    }
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updatedDrafts.slice(0, 50)));
  } catch (e) {}
};

export const removeStoredDraft = (postId: string, title?: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const drafts = getStoredDraftPosts().filter(p => {
      if (p.id === postId || (p.slug && p.slug === postId)) return false;
      if (title && p.title && p.title.trim().toLowerCase() === title.trim().toLowerCase()) return false;
      return true;
    });
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
  } catch (e) {}
};

export const savePublishedPost = (post: WpPost): WpPost[] => {
  if (typeof window === 'undefined') return [post, ...defaultMockPosts].filter(isPostPublished);
  try {
    const currentPosts = getStoredPosts();
    const isPublished = isPostPublished(post);

    // If the post is NOT published (draft, in-review, etc.), DO NOT put it into published posts!
    // If it already existed in published storage, remove it (e.g. unpublishing or reverting to draft)
    if (!isPublished) {
      const filtered = currentPosts.filter(
        p => p.id !== post.id && (!post.slug || p.slug !== post.slug)
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      // Save to drafts cache instead
      saveDraftPost(post);
      return filtered;
    }

    // Since it is officially published, ensure it's removed from local drafts
    removeStoredDraft(post.id, post.title);
    if (post.slug) removeStoredDraft(post.slug, post.title);

    const existingIndex = currentPosts.findIndex(
      p => p.id === post.id || (p.slug && post.slug && p.slug === post.slug)
    );

    let updated: WpPost[];
    if (existingIndex >= 0) {
      const existing = currentPosts[existingIndex];
      const mergedPost: WpPost = {
        ...existing,
        ...post,
        editorialStatus: 'published',
        status: 'published',
        isLead: post.isLead !== undefined ? post.isLead : existing.isLead,
        isFeatured: post.isFeatured !== undefined ? post.isFeatured : existing.isFeatured,
        updatedAt: new Date().toISOString(),
      };
      updated = [
        mergedPost,
        ...currentPosts.filter((_, idx) => idx !== existingIndex)
      ];
    } else {
      const enrichedPost: WpPost = {
        ...post,
        editorialStatus: 'published',
        status: 'published',
        isLead: post.isLead !== undefined ? post.isLead : true,
        isFeatured: post.isFeatured !== undefined ? post.isFeatured : true,
        publishedAt: post.publishedAt || new Date().toISOString(),
        viewsCount: post.viewsCount || 140,
      };
      updated = [
        enrichedPost,
        ...currentPosts
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
    return [post, ...defaultMockPosts].filter(isPostPublished);
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
