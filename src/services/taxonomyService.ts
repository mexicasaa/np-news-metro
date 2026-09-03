import { supabase } from '../lib/supabase';
import { WpCategory, WpVideo } from '../types/wordpress';
import { mockCategories, mockVideos } from '../data/mockWpData';

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  image_url: string | null;
  is_active: boolean | null;
  sort_order: number | null;
}

export interface DbTag {
  id: string;
  name: string;
  slug: string;
}

export interface DbSiteSettings {
  id: string;
  site_name: string | null;
  site_description: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  default_author_id: string | null;
  default_category_id: string | null;
  contact_email: string | null;
  timezone: string | null;
}

// Client-side in-memory cache to strictly protect Supabase DB and Egress limits
let cachedCategories: { data: WpCategory[]; timestamp: number } | null = null;
let cachedTags: { data: DbTag[]; timestamp: number } | null = null;
let cachedSiteSettings: { data: DbSiteSettings | null; timestamp: number } | null = null;
let cachedTaxonomyVideos: { data: WpVideo[]; timestamp: number } | null = null;

const TAXONOMY_TTL = 30 * 60 * 1000; // 30 minutes
const VIDEOS_TTL = 5 * 60 * 1000;    // 5 minutes

export const getCategories = async (): Promise<WpCategory[]> => {
  if (cachedCategories && Date.now() - cachedCategories.timestamp < TAXONOMY_TTL) {
    return cachedCategories.data;
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, sort_order, is_active')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.warn('Error fetching categories from Supabase, using mock fallback:', error.message);
      return mockCategories;
    }

    if (data && data.length > 0) {
      const mapped = data.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || '',
        count: 12,
      }));
      cachedCategories = { data: mapped, timestamp: Date.now() };
      return mapped;
    }

    return mockCategories;
  } catch (err) {
    console.error('Unexpected error fetching categories:', err);
    return mockCategories;
  }
};

export const getTags = async (): Promise<DbTag[]> => {
  if (cachedTags && Date.now() - cachedTags.timestamp < TAXONOMY_TTL) {
    return cachedTags.data;
  }

  try {
    const { data, error } = await supabase
      .from('tags')
      .select('id, name, slug')
      .order('name', { ascending: true });

    if (error) {
      console.warn('Error fetching tags:', error.message);
      return [];
    }

    const res = data || [];
    cachedTags = { data: res, timestamp: Date.now() };
    return res;
  } catch (err) {
    console.error('Unexpected error fetching tags:', err);
    return [];
  }
};

export const getSiteSettings = async (): Promise<DbSiteSettings | null> => {
  if (cachedSiteSettings && Date.now() - cachedSiteSettings.timestamp < TAXONOMY_TTL) {
    return cachedSiteSettings.data;
  }

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('id, site_name, site_description, logo_url, favicon_url, default_author_id, default_category_id, contact_email, timezone')
      .limit(1)
      .single();

    if (error) {
      console.warn('Error fetching site settings:', error.message);
      return null;
    }

    cachedSiteSettings = { data, timestamp: Date.now() };
    return data;
  } catch (err) {
    console.error('Unexpected error fetching site settings:', err);
    return null;
  }
};

export const getVideos = async (): Promise<WpVideo[]> => {
  if (cachedTaxonomyVideos && Date.now() - cachedTaxonomyVideos.timestamp < VIDEOS_TTL) {
    return cachedTaxonomyVideos.data;
  }

  try {
    const { data, error } = await supabase
      .from('videos')
      .select('id, title, slug, youtube_url, youtube_video_id, thumbnail_url, description, channel_name, duration_seconds, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return mockVideos;
    }

    const mapped = data.map((v) => ({
      id: v.id,
      title: v.title,
      slug: v.slug,
      category: 'technology',
      videoUrl: v.youtube_url || `https://www.youtube.com/watch?v=${v.youtube_video_id}`,
      posterUrl: v.thumbnail_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600',
      duration: v.duration_seconds ? `${Math.floor(v.duration_seconds / 60)}:${(v.duration_seconds % 60).toString().padStart(2, '0')}` : '4:30',
      caption: v.description || '',
      transcript: [],
      presenter: v.channel_name || 'NP News Metro Staff',
      authorId: 'author-1',
      publishedAt: v.published_at || new Date().toISOString(),
      viewsCount: '12.4K',
    }));

    cachedTaxonomyVideos = { data: mapped, timestamp: Date.now() };
    return mapped;
  } catch (err) {
    console.error('Error fetching videos:', err);
    return mockVideos;
  }
};
