import { WpPost, WpAuthor, WpCategory } from './wordpress';

export type UserRole = 
  | 'reporter' 
  | 'copy_editor' 
  | 'editor' 
  | 'seo_manager' 
  | 'ad_manager' 
  | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
}

export interface RolePermission {
  canCreate: boolean;
  canEditOwn: boolean;
  canEditAny: boolean;
  canReview: boolean;
  canApprove: boolean;
  canPublish: boolean;
  canSchedule: boolean;
  canPublishBreaking: boolean;
  canManageHomepage: boolean;
  canEditSeo: boolean;
  canManageAds: boolean;
  canManageUsers: boolean;
  canManageSystem: boolean;
  canCorrect: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermission> = {
  reporter: {
    canCreate: true,
    canEditOwn: true,
    canEditAny: false,
    canReview: false,
    canApprove: false,
    canPublish: false,
    canSchedule: false,
    canPublishBreaking: false,
    canManageHomepage: false,
    canEditSeo: false,
    canManageAds: false,
    canManageUsers: false,
    canManageSystem: false,
    canCorrect: false,
  },
  copy_editor: {
    canCreate: true,
    canEditOwn: true,
    canEditAny: true,
    canReview: true,
    canApprove: true,
    canPublish: false,
    canSchedule: true,
    canPublishBreaking: false,
    canManageHomepage: false,
    canEditSeo: true,
    canManageAds: false,
    canManageUsers: false,
    canManageSystem: false,
    canCorrect: true,
  },
  editor: {
    canCreate: true,
    canEditOwn: true,
    canEditAny: true,
    canReview: true,
    canApprove: true,
    canPublish: true,
    canSchedule: true,
    canPublishBreaking: true,
    canManageHomepage: true,
    canEditSeo: true,
    canManageAds: true,
    canManageUsers: false,
    canManageSystem: false,
    canCorrect: true,
  },
  seo_manager: {
    canCreate: false,
    canEditOwn: false,
    canEditAny: true,
    canReview: true,
    canApprove: false,
    canPublish: false,
    canSchedule: false,
    canPublishBreaking: false,
    canManageHomepage: false,
    canEditSeo: true,
    canManageAds: false,
    canManageUsers: false,
    canManageSystem: false,
    canCorrect: false,
  },
  ad_manager: {
    canCreate: false,
    canEditOwn: false,
    canEditAny: false,
    canReview: false,
    canApprove: false,
    canPublish: false,
    canSchedule: false,
    canPublishBreaking: false,
    canManageHomepage: false,
    canEditSeo: false,
    canManageAds: true,
    canManageUsers: false,
    canManageSystem: false,
    canCorrect: false,
  },
  admin: {
    canCreate: true,
    canEditOwn: true,
    canEditAny: true,
    canReview: true,
    canApprove: true,
    canPublish: true,
    canSchedule: true,
    canPublishBreaking: true,
    canManageHomepage: true,
    canEditSeo: true,
    canManageAds: true,
    canManageUsers: true,
    canManageSystem: true,
    canCorrect: true,
  },
};

export type EditorialStatus = 
  | 'draft' 
  | 'review' 
  | 'approved' 
  | 'scheduled' 
  | 'published' 
  | 'updated' 
  | 'corrected' 
  | 'failed' 
  | 'archived';

export type HomepagePlacement = 
  | 'none'
  | 'latest' 
  | 'featured_grid' 
  | 'lead_hero' 
  | 'section_featured' 
  | 'breaking_strip' 
  | 'pinned';

export type AdProfile = 
  | 'standard_article' 
  | 'breaking_minimal' 
  | 'longform_editorial' 
  | 'sponsored_post' 
  | 'no_ads';

export interface ArticleBlock {
  id: string;
  type: 'lead' | 'paragraph' | 'heading2' | 'heading3' | 'quote' | 'pullquote' | 'link' | 'image' | 'video' | 'gallery' | 'embed' | 'table' | 'keypoints' | 'related' | 'correction';
  content: string;
  meta?: {
    caption?: string;
    credit?: string;
    alt?: string;
    url?: string;
    provider?: string;
    focalPoint?: { x: number; y: number };
    items?: string[];
    author?: string;
    linkTitle?: string;
    linkUrl?: string;
    embedCode?: string;
    relatedStoryTitles?: string[];
  };
}

export interface ArticleRevision {
  id: string;
  version: number;
  timestamp: string;
  editorName: string;
  editorRole: string;
  headline: string;
  summaryOfChanges: string;
}

export interface DuplicateMatch {
  id: string;
  title: string;
  category: string;
  publishDate: string;
  similarityScore: number;
  slug: string;
  status: EditorialStatus;
}

export interface ReadinessCheckResult {
  category: 'required' | 'recommended' | 'warning';
  title: string;
  description: string;
  passed: boolean;
  code: string;
}

export interface PublishingStepStatus {
  stepNumber: number;
  name: string;
  status: 'idle' | 'running' | 'success' | 'warning' | 'failed' | 'skipped';
  isCritical: boolean;
  message?: string;
  durationMs?: number;
  retryable?: boolean;
}

export interface PublishingOperation {
  operationId: string; // e.g. PUB-20260821-001248
  articleId: string;
  articleTitle: string;
  initiatedBy: string;
  userRole: UserRole;
  startedAt: string;
  completedAt?: string;
  status: 'in_progress' | 'published_healthy' | 'published_warnings' | 'failed';
  steps: PublishingStepStatus[];
  verificationReport?: PostPublishVerification;
  errorLog?: string[];
}

export interface PostPublishVerification {
  url: string;
  httpStatus: number;
  headlineMatch: boolean;
  heroImageLoaded: boolean;
  canonicalValid: boolean;
  schemaValid: boolean;
  authorVerified: boolean;
  categoryVerified: boolean;
  mobileRenderPassed: boolean;
  distribution: {
    homepage: boolean;
    category: boolean;
    latest: boolean;
    search: boolean;
    sitemap: boolean;
    rss: boolean;
    analytics: boolean;
    cache: boolean;
    social: 'success' | 'pending' | 'failed' | 'skipped';
  };
}

export interface HomepageSlotConfig {
  slotNumber: number;
  type: 'pinned' | 'auto';
  articleId?: string;
  customHeadline?: string;
  label?: string;
}

export interface SectionModuleConfig {
  id: string;
  sectionSlug: string;
  title: string;
  slots: HomepageSlotConfig[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  details?: string;
  badgeType?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}
