export interface MediaUploadMeta {
  fileName: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
  credit?: string;
  uploadedBy?: string;
}

export interface MediaRecord {
  id: string;
  fileName: string;
  storagePath: string;
  publicUrl: string;
  contentHash?: string | null;
  r2Key?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  caption?: string | null;
  mediaType?: string | null;
  createdAt?: string | null;
  uploadedBy?: string | null;
  variantUrls?: {
    w320: string;
    w640: string;
    w960: string;
    w1280: string;
  };
}

export interface ArticleMediaRelation {
  articleId: string;
  mediaId: string;
  usageType: 'featured' | 'inline' | 'gallery' | 'ad';
  sortOrder: number;
  createdAt?: string;
}

export interface CommentRecord {
  id: string;
  articleId: string;
  userId?: string | null;
  authorName: string;
  authorEmail: string;
  parentId?: string | null;
  body: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

export interface SubscriberRecord {
  id: string;
  email: string;
  status: 'pending' | 'confirmed' | 'unsubscribed';
  confirmedAt?: string | null;
  unsubscribedAt?: string | null;
  createdAt: string;
  preferences?: string[];
}

export interface AdvertiserRecord {
  id: string;
  name: string;
  company: string;
  contactEmail?: string | null;
  status: string;
  createdAt?: string;
}

export interface AdCampaignRecord {
  id: string;
  advertiserId: string;
  name: string;
  startAt?: string | null;
  endAt?: string | null;
  status: string;
  createdAt?: string;
  creatives?: AdCreativeRecord[];
}

export interface AdCreativeRecord {
  id: string;
  campaignId: string;
  type: string;
  mediaId?: string | null;
  destinationUrl: string;
  altText?: string | null;
  headline?: string | null;
  mediaUrl?: string;
  createdAt?: string;
}

export interface AdPlacementRecord {
  id: string;
  campaignId: string;
  zone: string;
  isActive: boolean;
  createdAt?: string;
}

export interface DailyMetricsRecord {
  articleId: string;
  date: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
}

export interface TrendingArticleItem {
  articleId: string;
  slug: string;
  title: string;
  titleHi?: string;
  category: string;
  imageUrl?: string;
  score: number;
  views: number;
  likes: number;
  comments: number;
  shares?: number;
  publishedAt: string;
}

export interface AuditLogRecord {
  id: string;
  actorUserId: string;
  actorEmail?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details?: string | null;
  createdAt: string;
}
