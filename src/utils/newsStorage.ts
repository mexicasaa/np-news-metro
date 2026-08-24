import { WpPost } from '../types/wordpress';
import { mockPosts as defaultMockPosts } from '../data/mockWpData';

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

export const savePublishedPost = (post: WpPost): WpPost[] => {
  if (typeof window === 'undefined') return [post, ...defaultMockPosts];
  try {
    const currentPosts = getStoredPosts();
    const existingIndex = currentPosts.findIndex(
      p => p.id === post.id || (p.slug && post.slug && p.slug === post.slug)
    );

    let updated: WpPost[];
    if (existingIndex >= 0) {
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
    console.error('Error saving published post to cache:', err);
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
