import { WpPost } from '../types/wordpress';
import { mockPosts as defaultMockPosts } from '../data/mockWpData';

const STORAGE_KEY = 'np_news_published_posts';
const BROADCAST_CHANNEL_NAME = 'np_news_feed_channel';

/**
 * Temporary In-Memory & LocalStorage Database Engine
 * Persists all published articles and ensures they show up across the site,
 * in homepage sliders, latest news feeds, categories, and persist across refreshes.
 */

export const getStoredPosts = (): WpPost[] => {
  if (typeof window === 'undefined') return defaultMockPosts;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial mock posts
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
    // Filter out existing instance if editing
    const filtered = currentPosts.filter(p => p.id !== post.id);
    
    // Ensure the newly published post is marked for lead & featured visibility on the homepage slider
    const enrichedPost: WpPost = {
      ...post,
      isLead: true,
      isFeatured: true,
      publishedAt: post.publishedAt || new Date().toISOString(),
      viewsCount: post.viewsCount || 1,
    };

    // Also mark older posts as non-lead if this new one is the primary lead
    const updated = [
      enrichedPost,
      ...filtered.map(p => ({ ...p, isLead: false }))
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Broadcast change across all browser tabs
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        channel.postMessage({ type: 'NEWS_PUBLISHED', post: enrichedPost });
        channel.close();
      }
    } catch (e) {}

    return updated;
  } catch (err) {
    console.error('Error saving published post:', err);
    return [post, ...defaultMockPosts];
  }
};

export const deleteStoredPost = (postId: string): WpPost[] => {
  if (typeof window === 'undefined') return defaultMockPosts;
  try {
    const currentPosts = getStoredPosts();
    const updated = currentPosts.filter(p => p.id !== postId);
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
