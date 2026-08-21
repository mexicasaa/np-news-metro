export type EditorialCategorySlug = 
  | 'latest'
  | 'india'
  | 'politics'
  | 'business'
  | 'economy'
  | 'world'
  | 'technology'
  | 'sports'
  | 'entertainment'
  | 'lifestyle'
  | 'opinion'
  | 'videos'
  | 'photos';

export interface WpAuthor {
  id: string;
  name: string;
  slug: string;
  role: string;
  avatar: string;
  bio: string;
  verified: boolean;
  beats: string[];
  social: {
    twitter?: string;
    linkedin?: string;
    email?: string;
  };
}

export interface WpCategory {
  id: string;
  name: string;
  nameHi?: string;
  slug: EditorialCategorySlug | string;
  description: string;
  count: number;
  subcategories?: string[];
  accentColor?: string;
}

export interface GutenbergBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'pullquote' | 'keypoints' | 'image' | 'table' | 'related_story' | 'ad_slot';
  level?: 2 | 3;
  content?: string;
  items?: string[];
  author?: string;
  citation?: string;
  imageUrl?: string;
  imageCaption?: string;
  imageCredit?: string;
  tableData?: { headers: string[]; rows: string[][] };
  relatedStoryId?: string;
  adZone?: 'A4' | 'A5';
}

export interface WpPost {
  id: string;
  title: string;
  titleHi?: string;
  slug: string;
  dek: string;
  dekHi?: string;
  category: EditorialCategorySlug;
  categoryHi?: string;
  tags: string[];
  authorId: string;
  customAuthor?: {
    name: string;
    role?: string;
    avatar?: string;
    organization?: string;
    isGuest?: boolean;
  };
  publishedAt: string;
  updatedAt?: string;
  readTime: string;
  featuredImage: string;
  imageCaption: string;
  imageCaptionHi?: string;
  imageCredit: string;
  imageAlt: string;
  isBreaking?: boolean;
  isLead?: boolean;
  isFeatured?: boolean;
  isOpinion?: boolean;
  isSponsored?: boolean;
  sponsorName?: string;
  correctionNote?: {
    date: string;
    text: string;
  };
  keyTakeaways?: string[];
  blocks: GutenbergBlock[];
  viewsCount: number;
  sharesCount: number;
  commentCount: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface WpVideo {
  id: string;
  title: string;
  titleHi?: string;
  slug: string;
  category: string;
  categoryHi?: string;
  videoUrl: string;
  posterUrl: string;
  duration: string;
  caption: string;
  captionHi?: string;
  transcript: { time: string; text: string }[];
  presenter: string;
  authorId: string;
  publishedAt: string;
  viewsCount: string;
  relatedPostIds?: string[];
}

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  captionHi?: string;
  credit: string;
  alt: string;
}

export interface WpGallery {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  featuredImage: string;
  publishedAt: string;
  authorId: string;
  items: GalleryItem[];
}

export interface LiveUpdate {
  id: string;
  timestamp: string;
  headline: string;
  content: string;
  author: string;
  isPinned?: boolean;
}

export interface WpLiveBlog {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: 'LIVE' | 'CONCLUDED';
  startedAt: string;
  lastUpdatedAt: string;
  summary: string;
  updates: LiveUpdate[];
}

export interface AdSlotConfig {
  zone: 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7';
  name: string;
  desktopDimensions: string;
  mobileDimensions: string;
  advertiserName: string;
  creativeUrl?: string;
  creativeText?: string;
  ctaUrl?: string;
  isEnabled: boolean;
}
