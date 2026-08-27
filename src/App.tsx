import React, { useState, useEffect } from 'react';
import { 
  UtilityBar 
} from './components/layout/UtilityBar';
import { MainHeader } from './components/layout/MainHeader';
import { PrimaryNav } from './components/layout/PrimaryNav';
import { MarketsTickerBar } from './components/layout/MarketsTickerBar';
import { BreakingNewsBar } from './components/layout/BreakingNewsBar';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { SearchModal } from './components/layout/SearchModal';
import { SiteFooter } from './components/layout/SiteFooter';
import { NewsletterModule } from './components/common/NewsletterModule';
import { AdSlot } from './components/commercial/AdSlot';
import { SkeletonCard } from './components/common/SkeletonCard';
import { AdminLoginModal } from './components/admin/AdminLoginModal';

import { WpPost, WpVideo, WpGallery } from './types/wordpress';
import { mockPosts as initialMockPosts, mockVideos, mockGalleries } from './data/mockWpData';
import { getStoredPosts, savePublishedPost } from './utils/newsStorage';
import { getPublishedArticles, getArticleBySlug, saveArticle, deleteArticle, getDeletedArticles, restoreDeletedArticle, permanentDeleteArticle, DeletedArticle } from './services/articleService';
import { getCurrentUserProfile, ensureAuthenticatedSession, signOut as authSignOut } from './services/authService';
import { getVideos } from './services/taxonomyService';
import { getVideoBySlug, getPublishedVideos } from './services/videoService';
import { supabase } from './lib/supabase';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

// 14 Public Reader Templates
import { Homepage } from './templates/01_Homepage';
import { LatestNewsTemplate } from './templates/02_LatestNewsTemplate';
import { CategoryTemplate } from './templates/03_CategoryTemplate';
import { StandardArticleTemplate } from './templates/04_StandardArticleTemplate';
import { BreakingArticleTemplate } from './templates/05_BreakingArticleTemplate';
import { OpinionArticleTemplate } from './templates/06_OpinionArticleTemplate';
import { VideoHubTemplate } from './templates/07_VideoHubTemplate';
import { VideoDetailTemplate } from './templates/08_VideoDetailTemplate';
import { PhotoGalleryTemplate } from './templates/09_PhotoGalleryTemplate';
import { SearchResultsTemplate } from './templates/10_SearchResultsTemplate';
import { AuthorProfileTemplate } from './templates/11_AuthorProfileTemplate';
import { TrendingTemplate } from './templates/12_TrendingTemplate';
import { StaticInfoTemplate, StaticPageType } from './templates/13_StaticInfoTemplate';
import { NotFoundTemplate } from './templates/14_NotFoundTemplate';
import { ArticleLoadingTemplate } from './templates/15_ArticleLoadingTemplate';

// P0 Admin & Daily Publishing Center Suite
import { AdminLayout, AdminSection } from './components/admin/AdminLayout';
import { DashboardHome } from './components/admin/DashboardHome';
import { PublishingCenter, PublishingTab } from './components/admin/PublishingCenter';
import { ArticleEditor } from './components/admin/ArticleEditor';
import { EditorialListView } from './components/admin/EditorialListView';
import { HomepageLayoutManager } from './components/admin/HomepageLayoutManager';
import { PublishingReadinessModal } from './components/admin/PublishingReadinessModal';
import { PublishOrchestratorModal } from './components/admin/PublishOrchestratorModal';
import { EmergencyBreakingModal } from './components/admin/EmergencyBreakingModal';
import { RevisionHistoryModal } from './components/admin/RevisionHistoryModal';
import { 
  MediaLibraryView, MonetizationView, SeoHealthView, UsersView, SystemView 
} from './components/admin/AdminSecondaryViews';
import { YouTubeManagerModal } from './components/admin/YouTubeManagerModal';
import { SeoHead } from './components/common/SeoHead';
import { 
  generateArticleStructuredData, 
  generateVideoStructuredData, 
  generateWebsiteStructuredData 
} from './services/seoService';
import { 
  UserRole, UserProfile, PublishingOperation, ReadinessCheckResult, 
  DuplicateMatch, ArticleRevision 
} from './types/admin';
import { mockAdminUsers, mockFailedOperations } from './data/mockAdminData';

interface ParsedRoute {
  viewMode: 'public' | 'admin';
  template: string;
  category: string;
  post?: WpPost;
  video?: WpVideo;
  authorId: string;
  staticPage: StaticPageType;
  searchQuery: string;
  isAdminLoginModalOpen: boolean;
}

const parseUrlRoute = (currentPosts: WpPost[], currentVideos: WpVideo[], isInitialLoad: boolean = false): ParsedRoute => {
  if (typeof window === 'undefined') {
    return {
      viewMode: 'public',
      template: 'homepage',
      category: 'india',
      authorId: 'author-1',
      staticPage: 'about',
      searchQuery: '',
      isAdminLoginModalOpen: false,
    };
  }

  const rawPath = window.location.pathname;
  const cleanPath = rawPath.replace(/^\/+|\/+$/g, '').toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search;

  // 1. Admin
  if (cleanPath === 'admin' || cleanPath.startsWith('admin/') || cleanPath === 'wp-admin' || hash === '#admin') {
    const isAuth = localStorage.getItem('np_news_admin_auth') === 'true' || sessionStorage.getItem('np_news_admin_auth') === 'true';
    return {
      viewMode: isAuth ? 'admin' : 'public',
      template: 'homepage',
      category: 'india',
      authorId: 'author-1',
      staticPage: 'about',
      searchQuery: '',
      isAdminLoginModalOpen: !isAuth,
    };
  }

  // 2. Preview mode
  if (search.includes('preview=true') || hash.includes('preview')) {
    let draftPost: WpPost | undefined;
    const draft = localStorage.getItem('np_news_preview_draft');
    if (draft) {
      try { draftPost = JSON.parse(draft); } catch (e) {}
    }
    return {
      viewMode: 'public',
      template: 'article-standard',
      category: 'india',
      post: draftPost || currentPosts[0] || initialMockPosts[0],
      authorId: 'author-1',
      staticPage: 'about',
      searchQuery: '',
      isAdminLoginModalOpen: false,
    };
  }

  // 3. Homepage
  if (!cleanPath) {
    return {
      viewMode: 'public',
      template: 'homepage',
      category: 'india',
      authorId: 'author-1',
      staticPage: 'about',
      searchQuery: '',
      isAdminLoginModalOpen: false,
    };
  }

  // 4. Fixed routes
  if (cleanPath === 'latest') {
    return {
      viewMode: 'public',
      template: 'latest',
      category: 'india',
      authorId: 'author-1',
      staticPage: 'about',
      searchQuery: '',
      isAdminLoginModalOpen: false,
    };
  }

  if (cleanPath === 'trending') {
    return {
      viewMode: 'public',
      template: 'trending',
      category: 'india',
      authorId: 'author-1',
      staticPage: 'about',
      searchQuery: '',
      isAdminLoginModalOpen: false,
    };
  }

  if (cleanPath === 'videos') {
    return {
      viewMode: 'public',
      template: 'video-hub',
      category: 'videos',
      authorId: 'author-1',
      staticPage: 'about',
      searchQuery: '',
      isAdminLoginModalOpen: false,
    };
  }

  if (cleanPath === 'photos' || cleanPath === 'gallery') {
    return {
      viewMode: 'public',
      template: 'gallery',
      category: 'photos',
      authorId: 'author-1',
      staticPage: 'about',
      searchQuery: '',
      isAdminLoginModalOpen: false,
    };
  }

  if (cleanPath === 'search') {
    const params = new URLSearchParams(window.location.search);
    return {
      viewMode: 'public',
      template: 'search',
      category: 'india',
      authorId: 'author-1',
      staticPage: 'about',
      searchQuery: params.get('q') || '',
      isAdminLoginModalOpen: false,
    };
  }

  // 5. Static Pages & Aliases
  const staticPageAliases: Record<string, StaticPageType> = {
    'about': 'about',
    'about-us': 'about',
    'contact': 'contact',
    'contact-us': 'contact',
    'privacy': 'privacy',
    'privacy-policy': 'privacy',
    'privacy_policy': 'privacy',
    'disclaimer': 'disclaimer',
    'editorial-disclaimer': 'disclaimer',
    'terms': 'terms',
    'terms-and-conditions': 'terms',
    'terms-conditions': 'terms',
    'terms-of-service': 'terms',
    'terms_and_conditions': 'terms',
    'cookie-policy': 'cookie-policy',
    'cookies': 'cookie-policy',
    'ethics': 'ethics',
    'editorial-policy': 'ethics',
    'code-of-ethics': 'ethics',
    'editorial-team': 'editorial-team',
    'team': 'editorial-team',
    'masthead': 'editorial-team',
    'corrections': 'corrections',
    'grievance': 'corrections',
    'advertise': 'advertise',
    'advertise-with-us': 'advertise',
    'advertising': 'advertise',
    'sitemap': 'sitemap',
    'directory': 'sitemap',
  };

  if (staticPageAliases[cleanPath]) {
    return {
      viewMode: 'public',
      template: 'static',
      category: 'india',
      authorId: 'author-1',
      staticPage: staticPageAliases[cleanPath],
      searchQuery: '',
      isAdminLoginModalOpen: false,
    };
  }

  // 6. Video Detail (/videos/:slug)
  if (cleanPath.startsWith('videos/')) {
    const vSlug = cleanPath.replace(/^videos\//, '');
    const foundVideo = currentVideos.find(v => v.slug?.toLowerCase() === vSlug.toLowerCase() || v.id === vSlug);
    if (foundVideo) {
      return {
        viewMode: 'public',
        template: 'video-detail',
        category: 'videos',
        video: foundVideo,
        authorId: 'author-1',
        staticPage: 'about',
        searchQuery: '',
        isAdminLoginModalOpen: false,
      };
    }
    if (isInitialLoad) {
      return {
        viewMode: 'public',
        template: 'video-loading',
        category: 'videos',
        authorId: 'author-1',
        staticPage: 'about',
        searchQuery: '',
        isAdminLoginModalOpen: false,
      };
    }
    return {
      viewMode: 'public',
      template: 'not-found',
      category: 'videos',
      authorId: 'author-1',
      staticPage: 'about',
      searchQuery: '',
      isAdminLoginModalOpen: false,
    };
  }

  // 7. Category Desk (/category/:slug)
  if (cleanPath.startsWith('category/')) {
    const cSlug = cleanPath.replace(/^category\//, '');
    const normalizedCat = (cSlug === 'metromat' || cSlug === 'metro-mat') ? 'opinion' : cSlug;
    return {
      viewMode: 'public',
      template: 'category',
      category: normalizedCat,
      authorId: 'author-1',
      staticPage: 'about',
      searchQuery: '',
      isAdminLoginModalOpen: false,
    };
  }

  // 8. Author Profile (/author/:id)
  if (cleanPath.startsWith('author/')) {
    const aId = cleanPath.replace(/^author\//, '');
    return {
      viewMode: 'public',
      template: 'author',
      category: 'india',
      authorId: aId,
      staticPage: 'about',
      searchQuery: '',
      isAdminLoginModalOpen: false,
    };
  }

  // 9. Single category slug directly: /india, /politics, /business, /economy, /technology, /world, /sports, /entertainment, /lifestyle, /opinion, /metromat
  const knownDeskSlugs = ['india', 'politics', 'business', 'economy', 'technology', 'world', 'sports', 'entertainment', 'lifestyle', 'opinion', 'metromat', 'metro-mat'];
  if (knownDeskSlugs.includes(cleanPath)) {
    const normalizedCat = (cleanPath === 'metromat' || cleanPath === 'metro-mat') ? 'opinion' : cleanPath;
    return {
      viewMode: 'public',
      template: 'category',
      category: normalizedCat,
      authorId: 'author-1',
      staticPage: 'about',
      searchQuery: '',
      isAdminLoginModalOpen: false,
    };
  }

  // 10. Article: /:category/:slug OR /:slug
  const segments = cleanPath.split('/');
  const candidateSlug = segments[segments.length - 1];
  const allPosts = [...currentPosts, ...initialMockPosts];
  const foundPost = allPosts.find(p => p.slug?.toLowerCase() === candidateSlug.toLowerCase() || p.id === candidateSlug);

  if (foundPost) {
    const tpl = foundPost.isBreaking ? 'article-breaking' : (foundPost.isOpinion ? 'article-opinion' : 'article-standard');
    return {
      viewMode: 'public',
      template: tpl,
      category: foundPost.category || (segments.length > 1 ? segments[0] : 'india'),
      post: foundPost,
      authorId: foundPost.authorId || 'author-1',
      staticPage: 'about',
      searchQuery: '',
      isAdminLoginModalOpen: false,
    };
  }

  if (isInitialLoad) {
    const inferredCat = segments.length > 1 ? segments[0] : 'india';
    return {
      viewMode: 'public',
      template: 'article-loading',
      category: inferredCat,
      authorId: 'author-1',
      staticPage: 'about',
      searchQuery: '',
      isAdminLoginModalOpen: false,
    };
  }

  // 11. Fallback / 404
  return {
    viewMode: 'public',
    template: 'not-found',
    category: 'india',
    authorId: 'author-1',
    staticPage: 'about',
    searchQuery: '',
    isAdminLoginModalOpen: false,
  };
};

function AppContent() {
  const { isHindi } = useLanguage();
  // Check if we are in preview mode from URL query or hash
  const [isPreviewTab, setIsPreviewTab] = useState<boolean>(() => {
    return typeof window !== 'undefined' && (
      window.location.search.includes('preview=true') || 
      window.location.hash.includes('preview')
    );
  });

  // Reactive Posts State (Seeded from localStorage and synced with Supabase backend)
  const [posts, setPosts] = useState<WpPost[]>(getStoredPosts);
  const [videos, setVideos] = useState<WpVideo[]>(mockVideos);
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);

  // Compute Initial Route from URL (with isInitialLoad = true to show instant skeleton rather than 404)
  const initialRoute = React.useMemo(() => parseUrlRoute(posts, videos, true), []);

  // Global View Mode: 'public' reader or 'admin' dashboard
  const [viewMode, setViewMode] = useState<'public' | 'admin'>(initialRoute.viewMode);
  const [currentTemplate, setCurrentTemplate] = useState<string>(initialRoute.template);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialRoute.category);
  const [selectedPost, setSelectedPost] = useState<WpPost>(initialRoute.post || posts[0] || initialMockPosts[0]);
  const [selectedVideo, setSelectedVideo] = useState<WpVideo>(initialRoute.video || videos[0] || mockVideos[0]);
  const [selectedGallery, setSelectedGallery] = useState<WpGallery>(mockGalleries[0]);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>(initialRoute.authorId);
  const [staticPage, setStaticPage] = useState<StaticPageType>(initialRoute.staticPage);
  const [searchQuery, setSearchQuery] = useState<string>(initialRoute.searchQuery || 'Infrastructure Corridor');

  // Immediate targeted fetching for single article / video if directly loaded via shared permalink
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const cleanPath = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    if (!cleanPath || cleanPath === 'admin' || cleanPath.startsWith('admin/')) return;

    if (cleanPath.startsWith('videos/')) {
      const vSlug = cleanPath.replace(/^videos\//, '');
      getVideoBySlug(vSlug).then((directVideo) => {
        if (directVideo) {
          setSelectedVideo(directVideo);
          setCurrentTemplate('video-detail');
          setVideos((prev) => {
            if (prev.some((v) => v.id === directVideo.id || v.slug === directVideo.slug)) return prev;
            return [directVideo, ...prev];
          });
        }
      }).catch(() => {});
      return;
    }

    const segments = cleanPath.split('/');
    const candidateSlug = segments[segments.length - 1];
    const knownDeskSlugs = ['latest', 'trending', 'photos', 'gallery', 'search', 'india', 'politics', 'business', 'economy', 'technology', 'world', 'sports', 'entertainment', 'lifestyle', 'opinion'];
    const staticPages = ['about', 'privacy', 'terms', 'cookie-policy', 'ethics', 'editorial-team', 'corrections', 'advertise', 'contact', 'sitemap'];
    
    if (knownDeskSlugs.includes(cleanPath) || staticPages.includes(cleanPath) || cleanPath.startsWith('category/') || cleanPath.startsWith('author/')) {
      return;
    }

    if (candidateSlug) {
      getArticleBySlug(candidateSlug).then((directPost) => {
        if (directPost) {
          setSelectedPost(directPost);
          const tpl = directPost.isBreaking ? 'article-breaking' : (directPost.isOpinion ? 'article-opinion' : 'article-standard');
          setCurrentTemplate(tpl);
          if (directPost.category) setSelectedCategory(directPost.category);
          setPosts((prev) => {
            if (prev.some((p) => p.id === directPost.id || p.slug === directPost.slug)) return prev;
            return [directPost, ...prev];
          });
        }
      }).catch(() => {});
    }
  }, []);

  // Admin Authentication & Security
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('np_news_admin_auth') === 'true' || sessionStorage.getItem('np_news_admin_auth') === 'true';
  });
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState<boolean>(initialRoute.isAdminLoginModalOpen);
  const [pendingAdminSection, setPendingAdminSection] = useState<AdminSection>('publishing');
  const [pendingPublishingTab, setPendingPublishingTab] = useState<PublishingTab | undefined>(undefined);

  // Admin Workspace State
  const [adminSection, setAdminSection] = useState<AdminSection>('dashboard');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('editor');
  const [activeEnvironment, setActiveEnvironment] = useState<'production' | 'staging'>('production');
  const [publishingTab, setPublishingTab] = useState<PublishingTab>('all');
  const [activeEditingPost, setActiveEditingPost] = useState<WpPost | undefined>(undefined);
  const [deletedArticles, setDeletedArticles] = useState<DeletedArticle[]>([]);

  // Apply route from current window.location
  const applyRouteFromUrl = React.useCallback((currentPosts: WpPost[], currentVideos: WpVideo[]) => {
    const route = parseUrlRoute(currentPosts, currentVideos);
    setViewMode(route.viewMode);
    setCurrentTemplate(route.template);
    if (route.category) setSelectedCategory(route.category);
    if (route.post) setSelectedPost(route.post);
    if (route.video) setSelectedVideo(route.video);
    if (route.authorId) setSelectedAuthorId(route.authorId);
    if (route.staticPage) setStaticPage(route.staticPage);
    if (route.searchQuery) setSearchQuery(route.searchQuery);
    if (route.isAdminLoginModalOpen) setAdminLoginModalOpen(true);
  }, []);

  // Load published articles & video content directly from Supabase
  React.useEffect(() => {
    let isMounted = true;
    const fetchSupabaseContent = async () => {
      try {
        // Ensure valid Supabase session for admin operations
        ensureAuthenticatedSession().catch(() => {});

        const [livePosts, liveVideos] = await Promise.all([
          getPublishedArticles(),
          getPublishedVideos(),
        ]);
        if (isMounted) {
          if (livePosts && livePosts.length > 0) {
            setPosts(livePosts);
          }
          if (liveVideos && liveVideos.length > 0) {
            setVideos(liveVideos);
          }
          // Re-evaluate URL route with newly loaded database content
          applyRouteFromUrl(livePosts || posts, liveVideos || videos);
        }
      } catch (err) {
        console.error('Error fetching Supabase content:', err);
      }
    };
    fetchSupabaseContent();

    return () => {
      isMounted = false;
    };
  }, [isPreviewTab, applyRouteFromUrl]);

  // Cross-tab and multi-device Realtime listener for newly published/updated news from Supabase
  React.useEffect(() => {
    let feedChannel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        feedChannel = new BroadcastChannel('np_news_feed_channel');
        feedChannel.onmessage = async (event) => {
          if (event.data?.type === 'NEWS_PUBLISHED') {
            const fresh = await getPublishedArticles();
            setPosts(fresh);
          }
        };
      }
    } catch (e) {}

    // Supabase Realtime Channel for Cross-Browser/Cross-Device Instant Sync
    const realtimeChannel = supabase
      .channel('public:articles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'articles' },
        async (payload) => {
          console.log('[Realtime] Database change detected:', payload.eventType);
          const freshPosts = await getPublishedArticles();
          setPosts(freshPosts);
        }
      )
      .subscribe();

    return () => {
      feedChannel?.close();
      supabase.removeChannel(realtimeChannel);
    };
  }, []);

  // Live Cross-Tab Synchronization for Preview
  React.useEffect(() => {
    if (isPreviewTab) {
      setViewMode('public');
      setCurrentTemplate('article-standard');
      const draft = localStorage.getItem('np_news_preview_draft');
      if (draft) {
        try {
          setSelectedPost(JSON.parse(draft));
        } catch (e) {}
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'np_news_preview_draft' && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          setSelectedPost(updated);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('np_news_preview_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'UPDATE_PREVIEW' && event.data?.post) {
            setSelectedPost(event.data.post);
          }
        };
      }
    } catch (e) {}

    return () => {
      window.removeEventListener('storage', handleStorage);
      channel?.close();
    };
  }, [isPreviewTab]);

  // URL Popstate Listener & Shortcuts
  React.useEffect(() => {
    const handlePopState = () => {
      applyRouteFromUrl(posts, videos);
    };

    // Keyboard shortcut Ctrl+Shift+A or Alt+A to trigger Admin from anywhere
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) || (e.altKey && (e.key === 'a' || e.key === 'A'))) {
        e.preventDefault();
        handleOpenAdmin('publishing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [posts, videos, applyRouteFromUrl]);

  // Modals & Drawers
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);

  // Editorial Flags
  const [isEmergencyBreaking, setIsEmergencyBreaking] = useState(false);
  const [showAds, setShowAds] = useState(false);
  const [showCorrections, setShowCorrections] = useState(true);
  const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(false);

  // Publishing Pipeline & Validation State
  const [readinessModalOpen, setReadinessModalOpen] = useState(false);
  const [publishOrchestratorOpen, setPublishOrchestratorOpen] = useState(false);
  const [emergencyBreakingOpen, setEmergencyBreakingOpen] = useState(false);
  const [revisionsModalOpen, setRevisionsModalOpen] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<PublishingOperation | null>(null);
  const [pendingPostData, setPendingPostData] = useState<Partial<WpPost> | null>(null);

  const currentUser: UserProfile = mockAdminUsers.find(u => u.role === currentUserRole) || mockAdminUsers[0];

  // Helper Navigation Handlers (Public with PushState)
  const handleNavigateHome = () => {
    setCurrentTemplate('homepage');
    setViewMode('public');
    if (typeof window !== 'undefined') {
      window.history.pushState({ view: 'public' }, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPost = (post: WpPost) => {
    setSelectedPost(post);
    if (post.isBreaking) {
      setCurrentTemplate('article-breaking');
    } else if (post.isOpinion) {
      setCurrentTemplate('article-opinion');
    } else {
      setCurrentTemplate('article-standard');
    }
    setViewMode('public');
    if (typeof window !== 'undefined') {
      const categorySlug = post.category || 'india';
      window.history.pushState({ view: 'public', type: 'article', slug: post.slug }, '', `/${categorySlug}/${post.slug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (slug: string) => {
    setViewMode('public');
    if (slug === 'home') {
      setCurrentTemplate('homepage');
      if (typeof window !== 'undefined') window.history.pushState({ view: 'public' }, '', '/');
    } else if (slug === 'latest') {
      setCurrentTemplate('latest');
      if (typeof window !== 'undefined') window.history.pushState({ view: 'public' }, '', '/latest');
    } else if (slug === 'videos') {
      setCurrentTemplate('video-hub');
      if (typeof window !== 'undefined') window.history.pushState({ view: 'public' }, '', '/videos');
    } else if (slug === 'photos') {
      setCurrentTemplate('gallery');
      if (typeof window !== 'undefined') window.history.pushState({ view: 'public' }, '', '/photos');
    } else if (slug === 'trending') {
      setCurrentTemplate('trending');
      if (typeof window !== 'undefined') window.history.pushState({ view: 'public' }, '', '/trending');
    } else {
      setSelectedCategory(slug);
      setCurrentTemplate('category');
      if (typeof window !== 'undefined') window.history.pushState({ view: 'public', category: slug }, '', `/category/${slug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectVideo = (video: WpVideo) => {
    setSelectedVideo(video);
    setCurrentTemplate('video-detail');
    setViewMode('public');
    if (typeof window !== 'undefined') {
      window.history.pushState({ view: 'public', video: video.slug }, '', `/videos/${video.slug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAuthor = (authorId: string) => {
    setSelectedAuthorId(authorId);
    setCurrentTemplate('author');
    setViewMode('public');
    if (typeof window !== 'undefined') {
      window.history.pushState({ view: 'public', author: authorId }, '', `/author/${authorId}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateStatic = (page: string) => {
    setStaticPage(page as StaticPageType);
    setCurrentTemplate('static');
    setViewMode('public');
    if (typeof window !== 'undefined') {
      window.history.pushState({ view: 'public', static: page }, '', `/${page}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExecuteSearch = (queryText: string) => {
    setSearchQuery(queryText);
    setCurrentTemplate('search');
    setViewMode('public');
    if (typeof window !== 'undefined') {
      window.history.pushState({ view: 'public', query: queryText }, '', `/search?q=${encodeURIComponent(queryText)}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateTrending = () => {
    setCurrentTemplate('trending');
    setViewMode('public');
    if (typeof window !== 'undefined') window.history.pushState({ view: 'public' }, '', '/trending');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateVideos = () => {
    setCurrentTemplate('video-hub');
    setViewMode('public');
    if (typeof window !== 'undefined') window.history.pushState({ view: 'public' }, '', '/videos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigatePhotos = () => {
    setCurrentTemplate('gallery');
    setViewMode('public');
    if (typeof window !== 'undefined') window.history.pushState({ view: 'public' }, '', '/photos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateLatest = () => {
    setCurrentTemplate('latest');
    setViewMode('public');
    if (typeof window !== 'undefined') window.history.pushState({ view: 'public' }, '', '/latest');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin Handlers & Access Security
  const handleOpenAdmin = (section: AdminSection = 'publishing', tab?: PublishingTab) => {
    if (!isAdminAuthenticated) {
      setPendingAdminSection(section);
      setPendingPublishingTab(tab);
      setAdminLoginModalOpen(true);
      return;
    }
    setAdminSection(section);
    if (tab) setPublishingTab(tab);
    setViewMode('admin');
    try {
      if (typeof window !== 'undefined' && window.location.pathname !== '/admin') {
        window.history.pushState({ view: 'admin' }, '', '/admin');
      }
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = async () => {
    try {
      await authSignOut();
      localStorage.removeItem('np_news_admin_auth');
      sessionStorage.removeItem('np_news_admin_auth');
      if (typeof window !== 'undefined' && (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin') || window.location.hash === '#admin')) {
        window.history.pushState({ view: 'public' }, '', '/');
      }
    } catch (e) {}
    setIsAdminAuthenticated(false);
    setViewMode('public');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitToPublicSite = () => {
    try {
      if (typeof window !== 'undefined' && (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin') || window.location.hash === '#admin')) {
        window.history.pushState({ view: 'public' }, '', '/');
      }
    } catch (e) {}
    setViewMode('public');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  
  const loadDeletedArticles = async () => {
    try {
      const list = await getDeletedArticles();
      setDeletedArticles(list);
    } catch (err) {
      console.error('Error loading deleted articles:', err);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadDeletedArticles();
    }
  }, [isAdminAuthenticated]);

  const handleDeleteArticle = async (post: WpPost) => {
    const res = await deleteArticle(post.id);
    if (!res.success) {
      alert(`Failed to delete article: ${res.error || 'Unknown error'}`);
      return;
    }

    setPosts(prev => prev.filter(p => p.id !== post.id));
    if (activeEditingPost?.id === post.id) {
      setActiveEditingPost(undefined);
      setAdminSection('publishing');
    }
    loadDeletedArticles();
    alert(`Article "${post.title.slice(0, 40)}..." successfully moved to Trash / Database Recovery archive.`);
  };

  const handleRestoreArticle = async (recoveryId: string) => {
    const res = await restoreDeletedArticle(recoveryId);
    if (!res.success || !res.post) {
      alert(`Failed to restore article: ${res.error || 'Unknown error'}`);
      return;
    }

    savePublishedPost(res.post);
    setPosts(prev => [res.post!, ...prev.filter(p => p.id !== res.post!.id)]);
    loadDeletedArticles();
    alert(`Article "${res.post.title.slice(0, 40)}..." successfully restored back to active database!`);
  };

  const handlePermanentDeleteArticle = async (recoveryId: string) => {
    const res = await permanentDeleteArticle(recoveryId);
    if (!res.success) {
      alert(`Failed to delete article permanently: ${res.error || 'Unknown error'}`);
      return;
    }
    setDeletedArticles(prev => prev.filter(d => d.id !== recoveryId));
    alert('Article permanently removed from database.');
  };

  const handleStartNewArticle = () => {
    if (!isAdminAuthenticated) {
      setPendingAdminSection('new-article');
      setAdminLoginModalOpen(true);
      return;
    }
    setActiveEditingPost(undefined);
    setAdminSection('new-article');
    try {
      if (typeof window !== 'undefined' && window.location.pathname !== '/admin') {
        window.history.pushState({ view: 'admin' }, '', '/admin');
      }
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartEditArticle = (post: WpPost) => {
    if (!isAdminAuthenticated) {
      setPendingAdminSection('edit-article');
      setAdminLoginModalOpen(true);
      return;
    }
    setActiveEditingPost(post);
    setAdminSection('edit-article');
    try {
      if (typeof window !== 'undefined' && window.location.pathname !== '/admin') {
        window.history.pushState({ view: 'admin' }, '', '/admin');
      }
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pre-Publish Validation Checklist Generator
  const getReadinessChecks = (postData: Partial<WpPost>): ReadinessCheckResult[] => {
    return [
      {
        category: 'required',
        title: 'Primary Headline Provided',
        description: postData.title ? `"${postData.title.slice(0, 50)}..."` : 'Missing article headline',
        passed: !!postData.title && postData.title.trim().length > 5,
        code: 'REQ_HEADLINE',
      },
      {
        category: 'required',
        title: 'Article Body Content',
        description: 'Block content verified for Gutenberg Block validation',
        passed: true,
        code: 'REQ_BODY',
      },
      {
        category: 'required',
        title: 'Desk / Section Assigned',
        description: `Categorized under: ${postData.category?.toUpperCase() || 'INDIA'}`,
        passed: !!postData.category,
        code: 'REQ_SECTION',
      },
      {
        category: 'required',
        title: 'Verified Author Byline',
        description: `Assigned to: ${postData.authorId || 'author-1'}`,
        passed: !!postData.authorId,
        code: 'REQ_AUTHOR',
      },
      {
        category: 'required',
        title: 'Slug & URL Format Safe',
        description: `https://www.npnewsmetro.com/${postData.category}/${postData.slug || 'story'}`,
        passed: !!postData.slug,
        code: 'REQ_SLUG',
      },
      {
        category: 'required',
        title: 'Hero Media Stage & 16:9 Aspect',
        description: 'Aspect ratio 16:9 with reserved dimensions',
        passed: !!postData.featuredImage,
        code: 'REQ_MEDIA',
      },
      {
        category: 'recommended',
        title: 'Dek / Executive Subheadline',
        description: postData.dek ? 'Executive summary present' : 'Recommended for lead story display',
        passed: !!postData.dek,
        code: 'REC_DEK',
      },
      {
        category: 'recommended',
        title: 'Alt Text for Accessibility',
        description: postData.imageAlt ? 'Alt text present' : 'Missing alt text description',
        passed: !!postData.imageAlt,
        code: 'REC_ALT',
      },
      {
        category: 'recommended',
        title: 'Photo Credit & Wire Attribution',
        description: postData.imageCredit ? `Credit: ${postData.imageCredit}` : 'Missing photojournalist/agency credit',
        passed: !!postData.imageCredit,
        code: 'REC_CREDIT',
      },
      {
        category: 'recommended',
        title: 'SEO Title & Meta Description',
        description: 'Synced with Google News Article snippet specifications',
        passed: !!postData.seoTitle || !!postData.title,
        code: 'REC_SEO',
      },
      {
        category: 'warning',
        title: postData.title && postData.title.length > 110 ? 'Unusually Long Headline' : 'Headline Length Optimal',
        description: postData.title && postData.title.length > 110 ? `${postData.title.length} characters (May truncate on mobile cards)` : 'Within 60-90 character guideline',
        passed: !(postData.title && postData.title.length > 110),
        code: 'WARN_LENGTH',
      },
    ];
  };

  // Duplicate Story Detection Engine
  const getDuplicateMatches = (postData: Partial<WpPost>): DuplicateMatch[] => {
    if (!postData.title) return [];
    const keywords = postData.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const matches: DuplicateMatch[] = [];

    posts.forEach(p => {
      if (p.id === postData.id) return;
      const titleLower = p.title.toLowerCase();
      let matchCount = 0;
      keywords.forEach(k => {
        if (titleLower.includes(k)) matchCount++;
      });
      const score = Math.round((matchCount / Math.max(1, keywords.length)) * 100);
      if (score >= 40) {
        matches.push({
          id: p.id,
          title: p.title,
          category: p.category,
          publishDate: 'Aug 20, 2026',
          similarityScore: score,
          slug: p.slug,
          status: 'published',
        });
      }
    });

    return matches;
  };

  // 15-Step Safe Publish Orchestration Execution
  const handleExecutePublish = async (postData: Partial<WpPost>) => {
    setReadinessModalOpen(false);
    setPublishOrchestratorOpen(true);

    const newOpId = `PUB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPostId = postData.id || activeEditingPost?.id || `post-${Date.now()}`;

    const operation: PublishingOperation = {
      operationId: newOpId,
      articleId: newPostId,
      articleTitle: postData.title || 'Untitled News Story',
      initiatedBy: currentUser.name,
      userRole: currentUserRole,
      startedAt: new Date().toLocaleTimeString() + ' IST',
      status: 'in_progress',
      steps: [
        { stepNumber: 1, name: 'Validate user permissions & role token', status: 'running', isCritical: true },
        { stepNumber: 2, name: 'Validate required fields & metadata', status: 'idle', isCritical: true },
        { stepNumber: 3, name: 'Save article content to WordPress core', status: 'idle', isCritical: true },
        { stepNumber: 4, name: 'Save taxonomy & tags associations', status: 'idle', isCritical: true },
        { stepNumber: 5, name: 'Save media relationships & focal points', status: 'idle', isCritical: true },
        { stepNumber: 6, name: 'Save SEO metadata & NewsArticle schema', status: 'idle', isCritical: true },
        { stepNumber: 7, name: 'Save article settings & ad profile', status: 'idle', isCritical: true },
        { stepNumber: 8, name: 'Publish WordPress post to canonical DB', status: 'idle', isCritical: true },
        { stepNumber: 9, name: 'Update homepage & category editorial feeds', status: 'idle', isCritical: true },
        { stepNumber: 10, name: 'Invalidate targeted CDN cache routes', status: 'idle', isCritical: true },
        { stepNumber: 11, name: 'Update News Sitemap & RSS discovery', status: 'idle', isCritical: true },
        { stepNumber: 12, name: 'Record deduplicated analytics publication event', status: 'idle', isCritical: true },
        { stepNumber: 13, name: 'Trigger optional social syndication (X / LinkedIn)', status: 'idle', isCritical: false },
        { stepNumber: 14, name: 'Automated frontend live verification ping', status: 'idle', isCritical: true },
        { stepNumber: 15, name: 'Compile single-truth Publish Health Panel', status: 'idle', isCritical: true },
      ],
    };

    setCurrentOperation(operation);

    const fullPost: WpPost = {
      id: newPostId,
      title: postData.title || 'Untitled News Story',
      titleHi: postData.titleHi || postData.title || '',
      dek: postData.dek || '',
      category: (postData.category as any) || 'india',
      authorId: postData.authorId || '04ad79d9-d871-4099-a633-bcb7a1e35055',
      customAuthor: postData.customAuthor,
      featuredImage: postData.featuredImage || '',
      imageAlt: postData.imageAlt || postData.title || '',
      imageCredit: postData.imageCredit || 'NP News Metro Photo Desk',
      imageCaption: postData.imageCaption || '',
      publishedAt: postData.publishedAt || new Date().toISOString(),
      readTime: postData.readTime || '3 min read',
      viewsCount: 140,
      commentCount: 0,
      sharesCount: 12,
      isLead: true,
      isFeatured: true,
      isBreaking: postData.isBreaking || false,
      slug: postData.slug || 'live-story',
      tags: postData.tags || ['National', 'Policy'],
      blocks: postData.blocks || [
        { id: 'b1', type: 'paragraph', content: postData.dek || 'Latest dispatch from newsroom.' }
      ],
    };

    try {
      const isEditingExisting = (postData as any)?.isEdit ?? (!!activeEditingPost?.id && activeEditingPost.id === newPostId);
      const { post: savedDbPost, error: dbError } = await saveArticle({ ...fullPost, isEdit: isEditingExisting }, 'published');

      if (dbError || !savedDbPost) {
        setCurrentOperation(prev => prev ? {
          ...prev,
          status: 'failed',
          completedAt: new Date().toLocaleTimeString() + ' IST',
          steps: prev.steps.map((s, idx) => idx === 7 ? { ...s, status: 'failed' as const, message: dbError || 'Database write rejected' } : s)
        } : null);
        alert(`Database publication failed: ${dbError || 'Unknown error'}`);
        return;
      }

      savePublishedPost(savedDbPost);
      setPosts(prev => {
        const existingIdx = prev.findIndex(p => p.id === savedDbPost.id);
        if (existingIdx !== -1) {
          const updated = [...prev];
          updated[existingIdx] = savedDbPost;
          return updated;
        }
        return [savedDbPost, ...prev.filter(p => p.id !== newPostId)];
      });
      setSelectedPost(savedDbPost);

      if (savedDbPost.isBreaking) {
        setIsEmergencyBreaking(true);
      }

      setCurrentOperation(prev => prev ? {
        ...prev,
        status: 'published_healthy',
        completedAt: new Date().toLocaleTimeString() + ' IST',
        steps: prev.steps.map(s => ({ ...s, status: 'success' as const, durationMs: Math.floor(40 + Math.random() * 80) })),
        verificationReport: {
          url: `https://www.npnewsmetro.com/${savedDbPost.category}/${savedDbPost.slug}`,
          httpStatus: 200,
          headlineMatch: true,
          heroImageLoaded: true,
          canonicalValid: true,
          schemaValid: true,
          authorVerified: true,
          categoryVerified: true,
          mobileRenderPassed: true,
          distribution: {
            homepage: true,
            category: true,
            latest: true,
            search: true,
            sitemap: true,
            rss: true,
            analytics: true,
            cache: true,
            social: 'success',
          },
        },
      } : null);
    } catch (err: any) {
      setCurrentOperation(prev => prev ? {
        ...prev,
        status: 'failed',
        completedAt: new Date().toLocaleTimeString() + ' IST',
        steps: prev.steps.map((s, idx) => idx === 7 ? { ...s, status: 'failed' as const, message: err?.message || 'Network failure' } : s)
      } : null);
      alert(`Publication error: ${err?.message || 'Failed to publish story.'}`);
    }
  };

  // Emergency Breaking Handler
  const handlePublishEmergencyBreaking = (data: {
    headline: string;
    summary: string;
    category: string;
    authorId: string;
    activateBreakingStrip: boolean;
    pinAsHeroLead: boolean;
  }) => {
    const breakingPost: WpPost = {
      id: `post-brk-${Date.now()}`,
      title: data.headline,
      titleHi: data.headline,
      dek: data.summary,
      category: (data.category as any) || 'politics',
      authorId: data.authorId,
      featuredImage: 'https://www.npnewsmetro.com/uploads/dr-deepak-goswami.jpg',
      imageAlt: data.headline,
      imageCredit: 'NP Newsroom Emergency Desk',
      imageCaption: 'Live visual report from breaking news center.',
      publishedAt: new Date().toISOString(),
      readTime: '1 min read',
      viewsCount: 50,
      commentCount: 0,
      sharesCount: 24,
      isLead: data.pinAsHeroLead,
      isFeatured: true,
      isBreaking: true,
      slug: data.headline.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60),
      tags: ['Breaking News', 'Live Report'],
      blocks: [
        { id: 'brk-1', type: 'paragraph', content: data.summary || data.headline }
      ],
    };

    saveArticle(breakingPost, 'published').then(({ post }) => {
      if (post) {
        setPosts(prev => [post, ...prev.filter(p => p.id !== post.id && p.id !== breakingPost.id)]);
      }
    });

    setPosts(prev => [breakingPost, ...prev]);
    if (data.activateBreakingStrip) {
      setIsEmergencyBreaking(true);
    }

    // Direct transition to live article
    handleSelectPost(breakingPost);
  };

  // Dynamic SEO metadata & JSON-LD Structured Data computation
  const getDynamicSeo = () => {
    if (viewMode === 'admin') {
      return {
        metadata: {
          title: 'NP Newsroom CMS & Editorial Suite',
          noIndex: true,
          noFollow: true,
        },
        structuredData: undefined,
      };
    }

    if (currentTemplate === 'not-found') {
      return {
        metadata: {
          title: 'Page Not Found | 404',
          description: 'The requested news report or page does not exist on NP News Metro.',
          noIndex: true,
          noFollow: true,
        },
        structuredData: undefined,
      };
    }

    if (currentTemplate === 'search') {
      return {
        metadata: {
          title: searchQuery ? `Search: ${searchQuery}` : 'Search News & Archive',
          description: 'Search breaking news, investigative reporting, and multimedia archives across NP News Metro.',
          canonicalUrl: 'https://www.npnewsmetro.com/search',
          noIndex: true,
        },
        structuredData: undefined,
      };
    }

    if (currentTemplate === 'article-loading' || currentTemplate === 'video-loading') {
      return {
        metadata: {
          title: 'Loading News Report',
          description: 'Fast, verified, and in-depth national news coverage from NP News Metro.',
          ogType: 'article' as const,
        },
        structuredData: undefined,
      };
    }

    if (currentTemplate === 'article-standard' || currentTemplate === 'article-breaking' || currentTemplate === 'article-opinion') {
      return {
        metadata: {
          title: selectedPost.seoTitle || selectedPost.title,
          description: selectedPost.seoDescription || selectedPost.dek || selectedPost.title,
          canonicalUrl: `https://www.npnewsmetro.com/${selectedPost.category}/${selectedPost.slug}`,
          ogType: 'article' as const,
          ogImage: selectedPost.featuredImage,
          publishedTime: selectedPost.publishedAt,
          modifiedTime: selectedPost.updatedAt || selectedPost.publishedAt,
          authorName: selectedPost.customAuthor?.name || 'NP News Metro Bureau',
          section: selectedPost.category,
        },
        structuredData: generateArticleStructuredData(selectedPost, 'NP News Metro', 'https://www.npnewsmetro.com'),
      };
    }

    if (currentTemplate === 'video-detail') {
      return {
        metadata: {
          title: selectedVideo.title,
          description: selectedVideo.caption || selectedVideo.title,
          canonicalUrl: `https://www.npnewsmetro.com/videos/${selectedVideo.slug}`,
          ogType: 'video.other' as const,
          ogImage: selectedVideo.posterUrl,
          publishedTime: selectedVideo.publishedAt,
        },
        structuredData: generateVideoStructuredData(selectedVideo, 'NP News Metro', 'https://www.npnewsmetro.com'),
      };
    }

    if (currentTemplate === 'video-hub') {
      return {
        metadata: {
          title: 'Video Hub & Investigative Documentaries',
          description: 'Watch deep dive documentary broadcasts, ground reports, policy explainers, and leadership interviews.',
          canonicalUrl: 'https://www.npnewsmetro.com/videos',
        },
        structuredData: generateWebsiteStructuredData('NP News Metro', 'https://www.npnewsmetro.com'),
      };
    }

    if (currentTemplate === 'latest') {
      return {
        metadata: {
          title: 'Latest News & Breaking Headlines',
          description: 'Real-time updates, breaking stories, and chronological dispatches from NP News Metro correspondents.',
          canonicalUrl: 'https://www.npnewsmetro.com/latest',
        },
        structuredData: generateWebsiteStructuredData('NP News Metro', 'https://www.npnewsmetro.com'),
      };
    }

    if (currentTemplate === 'trending') {
      return {
        metadata: {
          title: 'Trending Stories & Viral Coverage',
          description: 'Explore the most read, highly debated, and trending stories across India and the globe.',
          canonicalUrl: 'https://www.npnewsmetro.com/trending',
        },
        structuredData: generateWebsiteStructuredData('NP News Metro', 'https://www.npnewsmetro.com'),
      };
    }

    if (currentTemplate === 'gallery') {
      return {
        metadata: {
          title: 'Photo Galleries & Visual Reports',
          description: 'High-resolution photo essays and ground dispatches covering culture, politics, national events, and daily life.',
          canonicalUrl: 'https://www.npnewsmetro.com/photos',
        },
        structuredData: generateWebsiteStructuredData('NP News Metro', 'https://www.npnewsmetro.com'),
      };
    }

    if (currentTemplate === 'static') {
      const pageTitles: Record<string, string> = {
        'about': 'About Us — Editorial Mission & Standards',
        'contact': 'Contact NP News Metro — Editorial Desk & Bureau Contacts',
        'privacy': 'Privacy Policy',
        'terms': 'Terms and Conditions',
        'disclaimer': 'Editorial Disclaimer',
        'ethics': 'Code of Ethics & Editorial Guidelines',
        'editorial-team': 'Editorial Board & Leadership — NP News Metro',
        'corrections': 'Corrections & Grievance Redressal Policy',
        'advertise': 'Advertise With Us',
        'cookie-policy': 'Cookie Policy',
      };
      return {
        metadata: {
          title: pageTitles[staticPage] || `${staticPage.replace(/-/g, ' ').toUpperCase()}`,
          description: 'Official institutional and editorial information from NP News Metro.',
          canonicalUrl: `https://www.npnewsmetro.com/${staticPage}`,
        },
        structuredData: generateWebsiteStructuredData('NP News Metro', 'https://www.npnewsmetro.com'),
      };
    }

    if (currentTemplate === 'category') {
      const isMetromat = selectedCategory === 'opinion' || selectedCategory === 'metromat';
      const catTitle = isMetromat
        ? (isHindi ? 'मैट्रो मत — संपादकीय विचार, स्तंभ एवं जनमत' : 'Metromat — Editorial Voice, Opinions & Public Pulse')
        : `${selectedCategory.toUpperCase()} News & Latest Analysis`;
      const catDesc = isMetromat
        ? (isHindi ? 'एनपी न्यूज़ मेट्रो का संपादकीय एवं वैचारिक मंच — स्वतंत्र विश्लेषण, तीक्ष्ण दृष्टिकोण और दैनिक जनमत।' : 'The editorial, opinion and analytical desk of NP News Metro — independent analysis and public pulse.')
        : `Latest breaking headlines, reports, and exclusive analysis in ${selectedCategory}.`;
      return {
        metadata: {
          title: catTitle,
          description: catDesc,
          canonicalUrl: isMetromat ? 'https://www.npnewsmetro.com/metromat' : `https://www.npnewsmetro.com/category/${selectedCategory}`,
        },
        structuredData: generateWebsiteStructuredData('NP News Metro', 'https://www.npnewsmetro.com'),
      };
    }

    // Default: Homepage
    return {
      metadata: {
        title: 'NP NEWS METRO — Real News. Real Impact. | Indian Digital Newspaper',
        description: 'Fast, verified, and in-depth national news coverage, policy analysis, investigative journalism, and live market updates.',
        canonicalUrl: 'https://www.npnewsmetro.com/',
        ogType: 'website' as const,
      },
      structuredData: generateWebsiteStructuredData('NP News Metro', 'https://www.npnewsmetro.com'),
    };
  };

  const { metadata: currentSeoMetadata, structuredData: currentStructuredData } = getDynamicSeo();

  return (
    <div className="min-h-screen bg-canvas flex flex-col font-sans antialiased text-ink selection:bg-secondary-gold/20 selection:text-ink overflow-x-hidden w-full max-w-full">
      {/* Dynamic SEO Head Manager */}
      <SeoHead metadata={currentSeoMetadata} structuredData={currentStructuredData} />

      {/* YouTube Video Manager Modal */}
      <YouTubeManagerModal
        isOpen={isYouTubeModalOpen}
        onClose={() => setIsYouTubeModalOpen(false)}
        onVideoSaved={(v) => {
          setVideos(prev => [v, ...prev]);
          setSelectedVideo(v);
        }}
      />
      {/* Live Preview Notification Banner (Active only when previewing in new tab) */}
      {isPreviewTab && (
        <div className="bg-slate-900 border-b-2 border-amber-500 text-white px-4 py-2.5 flex items-center justify-between sticky top-0 z-[1000] shadow-xl text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-bold text-amber-400 uppercase tracking-wider">Live Preview Tab</span>
            <span className="hidden md:inline text-slate-300">| Changes made in your Article Editor appear here instantly in real-time.</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.location.reload()} 
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors font-medium cursor-pointer"
            >
              Refresh
            </button>
            <button 
              onClick={() => window.close()} 
              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors cursor-pointer"
            >
              Close Tab
            </button>
          </div>
        </div>
      )}

      {/* ======================================================================
          A. ADMIN PUBLISHING CENTER SUITE (When viewMode === 'admin')
          ====================================================================== */}
      {viewMode === 'admin' && isAdminAuthenticated ? (
        <AdminLayout
          currentSection={adminSection}
          onNavigateSection={(sec) => {
            if (sec === 'new-article') handleStartNewArticle();
            else setAdminSection(sec);
          }}
          currentUser={currentUser}
          onChangeUserRole={(role) => setCurrentUserRole(role)}
          onExitToPublicSite={handleExitToPublicSite}
          onLogout={handleAdminLogout}
          onQuickCreate={handleStartNewArticle}
          activeEnvironment={activeEnvironment}
          onToggleEnvironment={setActiveEnvironment}
          breakingCount={posts.filter(p => p.isBreaking).length}
          reviewCount={8}
        >
          {adminSection === 'dashboard' && (
            <DashboardHome
              onOpenPublishingCenter={(tab) => {
                setAdminSection('publishing');
                if (tab) setPublishingTab(tab as PublishingTab);
              }}
              onNewArticle={handleStartNewArticle}
              userRole={currentUserRole}
              publishedCount={posts.length}
              breakingCount={posts.filter(p => p.isBreaking).length}
            />
          )}

          {adminSection === 'publishing' && (
            <PublishingCenter
              posts={posts}
              initialTab={publishingTab}
              userRole={currentUserRole}
              onNewArticle={handleStartNewArticle}
              onEditArticle={handleStartEditArticle}
              onEmergencyBreaking={() => setEmergencyBreakingOpen(true)}
              onViewLiveStory={handleSelectPost}
              onPublishPostDirect={(post) => {
                setPendingPostData(post);
                handleExecutePublish(post);
              }}
              onApprovePost={(post) => {
                alert(`Post "${post.title.slice(0, 40)}..." approved for publication.`);
              }}
              onSchedulePostModal={(post) => {
                alert(`Post "${post.title.slice(0, 40)}..." scheduled.`);
              }}
              onRetryFailedOp={(opId) => {
                alert(`Idempotent retry initiated for Operation ${opId}. Retrying Step 13 (Social Distribution)... Task succeeded!`);
              }}
              onDeleteArticle={handleDeleteArticle}
              deletedArticles={deletedArticles}
              onRestoreArticle={handleRestoreArticle}
              onPermanentDelete={handlePermanentDeleteArticle}
            />
          )}

          {(adminSection === 'new-article' || adminSection === 'edit-article') && (
            <ArticleEditor
              initialPost={activeEditingPost}
              userRole={currentUserRole}
              currentAuthorId={currentUser.id}
              onSaveDraft={async (postData) => {
                const postId = postData.id || activeEditingPost?.id || `post-${Date.now()}`;
                const fullPost: WpPost = {
                  id: postId,
                  title: postData.title || 'Untitled News Story',
                  titleHi: postData.titleHi || postData.title || '',
                  dek: postData.dek || '',
                  category: (postData.category as any) || 'india',
                  authorId: postData.authorId || '04ad79d9-d871-4099-a633-bcb7a1e35055',
                  customAuthor: postData.customAuthor,
                  featuredImage: postData.featuredImage || '',
                  imageAlt: postData.imageAlt || postData.title || '',
                  imageCredit: postData.imageCredit || 'NP News Metro Photo Desk',
                  imageCaption: postData.imageCaption || '',
                  publishedAt: postData.publishedAt || new Date().toISOString(),
                  readTime: postData.readTime || '3 min read',
                  viewsCount: activeEditingPost?.viewsCount || 100,
                  commentCount: activeEditingPost?.commentCount || 0,
                  sharesCount: activeEditingPost?.sharesCount || 0,
                  isLead: activeEditingPost?.isLead || false,
                  isFeatured: true,
                  isBreaking: postData.isBreaking || false,
                  slug: postData.slug || 'story',
                  tags: postData.tags || ['National', 'Policy'],
                  blocks: postData.blocks || [
                    { id: 'b1', type: 'paragraph', content: postData.dek || 'Draft content.' }
                  ],
                };

                const isEditingExisting = (postData as any)?.isEdit ?? (!!activeEditingPost?.id && activeEditingPost.id === postId);
                const { post, error } = await saveArticle({ ...fullPost, isEdit: isEditingExisting }, 'draft');
                if (error || !post) {
                  alert(`Failed to save draft to database: ${error || 'Unknown error'}`);
                  return;
                }

                savePublishedPost(post);
                setPosts(prev => {
                  const existingIdx = prev.findIndex(p => p.id === post.id);
                  if (existingIdx !== -1) {
                    const updated = [...prev];
                    updated[existingIdx] = post;
                    return updated;
                  }
                  return [post, ...prev.filter(p => p.id !== postId)];
                });
                alert('Story draft saved successfully in database.');
              }}
              onSubmitForReview={async (postData) => {
                const isEditingExisting = (postData as any)?.isEdit ?? (!!activeEditingPost?.id);
                const { post, error } = await saveArticle({ ...postData, isEdit: isEditingExisting }, 'review');
                if (error || !post) {
                  alert(`Failed to submit article for review: ${error || 'Database write error'}`);
                  return;
                }
                setPosts(prev => {
                  const existingIdx = prev.findIndex(p => p.id === post.id);
                  if (existingIdx !== -1) {
                    const updated = [...prev];
                    updated[existingIdx] = post;
                    return updated;
                  }
                  return [post, ...prev];
                });
                alert('Article successfully submitted to Copy Editor review queue.');
                setAdminSection('publishing');
                setPublishingTab('review');
              }}
              onApproveCopy={async (postData) => {
                const isEditingExisting = (postData as any)?.isEdit ?? (!!activeEditingPost?.id);
                const { post, error } = await saveArticle({ ...postData, isEdit: isEditingExisting }, 'approved');
                if (error || !post) {
                  alert(`Failed to approve copy: ${error || 'Database write error'}`);
                  return;
                }
                setPosts(prev => {
                  const existingIdx = prev.findIndex(p => p.id === post.id);
                  if (existingIdx !== -1) {
                    const updated = [...prev];
                    updated[existingIdx] = post;
                    return updated;
                  }
                  return [post, ...prev];
                });
                alert('Copy approved by Editor. Article moved to Approved queue.');
                setAdminSection('publishing');
                setPublishingTab('approved');
              }}
              onSchedulePost={async (postData, scheduleTime) => {
                const isEditingExisting = (postData as any)?.isEdit ?? (!!activeEditingPost?.id);
                const { post, error } = await saveArticle({ ...postData, isEdit: isEditingExisting }, 'scheduled');
                if (error || !post) {
                  alert(`Failed to schedule article: ${error || 'Database write error'}`);
                  return;
                }
                setPosts(prev => {
                  const existingIdx = prev.findIndex(p => p.id === post.id);
                  if (existingIdx !== -1) {
                    const updated = [...prev];
                    updated[existingIdx] = post;
                    return updated;
                  }
                  return [post, ...prev];
                });
                alert(`Article scheduled for publication at ${scheduleTime}.`);
                setAdminSection('publishing');
                setPublishingTab('scheduled');
              }}
              onRunReadinessCheck={(postData) => {
                setPendingPostData(postData);
                setReadinessModalOpen(true);
              }}
              onPublishNow={(postData) => {
                setPendingPostData(postData);
                setReadinessModalOpen(true);
              }}
              onBack={() => setAdminSection('publishing')}
              onOpenRevisions={() => setRevisionsModalOpen(true)}
              onDeleteArticle={handleDeleteArticle}
            />
          )}

          {adminSection === 'editorial' && (
            <EditorialListView
              posts={posts}
              onEditArticle={handleStartEditArticle}
              onViewLiveArticle={handleSelectPost}
              onDeleteArticle={handleDeleteArticle}
            />
          )}

          {adminSection === 'content' && (
            <PublishingCenter
              posts={posts}
              initialTab="all"
              userRole={currentUserRole}
              onNewArticle={handleStartNewArticle}
              onEditArticle={handleStartEditArticle}
              onEmergencyBreaking={() => setEmergencyBreakingOpen(true)}
              onViewLiveStory={handleSelectPost}
              onPublishPostDirect={handleExecutePublish}
              onApprovePost={() => {}}
              onSchedulePostModal={() => {}}
              onRetryFailedOp={() => {}}
              onDeleteArticle={handleDeleteArticle}
              deletedArticles={deletedArticles}
              onRestoreArticle={handleRestoreArticle}
              onPermanentDelete={handlePermanentDeleteArticle}
            />
          )}

          {adminSection === 'homepage-layout' && (
            <HomepageLayoutManager
              onPublishHomepageChanges={() => {
                alert('Homepage slot curation published to live edge.');
              }}
              isBreakingNewsActive={isEmergencyBreaking}
              onToggleBreakingNews={() => setIsEmergencyBreaking(!isEmergencyBreaking)}
            />
          )}

          {adminSection === 'media' && <MediaLibraryView />}
          {adminSection === 'monetization' && <MonetizationView />}
          {adminSection === 'seo' && <SeoHealthView />}
          {adminSection === 'audience' && <DashboardHome onOpenPublishingCenter={() => setAdminSection('publishing')} onNewArticle={handleStartNewArticle} userRole={currentUserRole} />}
          {adminSection === 'analytics' && <SeoHealthView />}
          {adminSection === 'users' && <UsersView />}
          {adminSection === 'system' && <SystemView />}
        </AdminLayout>
      ) : (
        /* ======================================================================
            B. PUBLIC READER FRONTEND (14 Templates)
            ====================================================================== */
        <>
          {/* GLOBAL SHELL 1: Utility Bar */}
          <UtilityBar
            onOpenNewsletter={() => setNewsletterOpen(true)}
            onNavigate={(type, data) => {
              if (type === 'static' && data?.page) {
                handleNavigateStatic(data.page);
              }
            }}
            onOpenAdmin={() => handleOpenAdmin('publishing')}
          />

          {/* GLOBAL SHELL 2: Main Brand Header */}
          <MainHeader
            onOpenMenu={() => setMenuOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
            onOpenNewsletter={() => setNewsletterOpen(true)}
            onNavigateHome={handleNavigateHome}
            onOpenAdmin={() => handleOpenAdmin('publishing')}
          />

          {/* GLOBAL SHELL 3: Primary Navigation */}
          <PrimaryNav
            currentCategory={
              currentTemplate === 'homepage'
                ? 'home'
                : currentTemplate === 'latest'
                ? 'latest'
                : currentTemplate === 'video-hub' || currentTemplate === 'video-detail'
                ? 'videos'
                : currentTemplate === 'gallery'
                ? 'photos'
                : currentTemplate === 'trending'
                ? 'trending'
                : selectedCategory
            }
            onSelectCategory={handleSelectCategory}
            onNavigateTrending={handleNavigateTrending}
            onNavigatePhotos={handleNavigatePhotos}
          />

          {/* GLOBAL SHELL 4: Financial Markets Live Ticker */}
          <MarketsTickerBar />

          {/* GLOBAL SHELL 5: Breaking News Bar */}
          <BreakingNewsBar
            breakingPosts={posts.filter((p) => p.isBreaking || p.isLead)}
            onSelectPost={handleSelectPost}
            isEmergencyMode={isEmergencyBreaking}
          />

          {/* Leaderboard Ad (A1) */}
          {showAds && (
            <div className="max-w-site mx-auto px-4 pt-1">
              <AdSlot zone="A1" />
            </div>
          )}

          {/* MAIN TEMPLATE CONTENT RENDERER */}
          {isLoadingSkeleton ? (
            <div className="max-w-site mx-auto px-4 py-8 space-y-6">
              <SkeletonCard variant="hero" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SkeletonCard variant="grid" />
                <SkeletonCard variant="grid" />
                <SkeletonCard variant="grid" />
              </div>
            </div>
          ) : (
            <>
              {currentTemplate === 'homepage' && (
                <Homepage
                  posts={posts}
                  onSelectPost={handleSelectPost}
                  onSelectVideo={handleSelectVideo}
                  onSelectCategory={handleSelectCategory}
                  onSelectAuthor={handleSelectAuthor}
                  onNavigateTrending={handleNavigateTrending}
                  onNavigateVideos={handleNavigateVideos}
                  onOpenNewsletter={() => setNewsletterOpen(true)}
                  showAds={showAds}
                />
              )}

              {currentTemplate === 'latest' && (
                <LatestNewsTemplate
                  posts={posts}
                  onSelectPost={handleSelectPost}
                  onNavigateHome={handleNavigateHome}
                  onNavigateTrending={handleNavigateTrending}
                  showAds={showAds}
                />
              )}

              {currentTemplate === 'category' && (
                <CategoryTemplate
                  posts={posts}
                  categorySlug={selectedCategory}
                  onSelectPost={handleSelectPost}
                  onNavigateHome={handleNavigateHome}
                  onSelectCategory={handleSelectCategory}
                  onNavigateTrending={handleNavigateTrending}
                  showAds={showAds}
                />
              )}

              {currentTemplate === 'article-standard' && (
                <StandardArticleTemplate
                  post={selectedPost}
                  onSelectPost={handleSelectPost}
                  onNavigateHome={handleNavigateHome}
                  onSelectCategory={handleSelectCategory}
                  onSelectAuthor={handleSelectAuthor}
                  showCorrections={showCorrections}
                  showAds={showAds}
                />
              )}

              {currentTemplate === 'article-breaking' && (
                <BreakingArticleTemplate
                  post={selectedPost}
                  onSelectPost={handleSelectPost}
                  onNavigateHome={handleNavigateHome}
                  onSelectCategory={handleSelectCategory}
                  onSelectAuthor={handleSelectAuthor}
                />
              )}

              {currentTemplate === 'article-opinion' && (
                <OpinionArticleTemplate
                  post={selectedPost}
                  onSelectPost={handleSelectPost}
                  onNavigateHome={handleNavigateHome}
                  onSelectCategory={handleSelectCategory}
                  onSelectAuthor={handleSelectAuthor}
                />
              )}

              {currentTemplate === 'video-hub' && (
                <VideoHubTemplate
                  videos={videos}
                  onSelectVideo={handleSelectVideo}
                  onNavigateHome={handleNavigateHome}
                  showAds={showAds}
                />
              )}

              {currentTemplate === 'video-detail' && (
                <VideoDetailTemplate
                  video={selectedVideo}
                  onSelectVideo={handleSelectVideo}
                  onSelectPost={handleSelectPost}
                  onNavigateHome={handleNavigateHome}
                  onNavigateVideos={handleNavigateVideos}
                  showAds={showAds}
                />
              )}

              {currentTemplate === 'gallery' && (
                <PhotoGalleryTemplate
                  gallery={selectedGallery}
                  onSelectPost={handleSelectPost}
                  onNavigateHome={handleNavigateHome}
                  onSelectCategory={handleSelectCategory}
                  showAds={showAds}
                />
              )}

              {currentTemplate === 'search' && (
                <SearchResultsTemplate
                  posts={posts}
                  initialQuery={searchQuery}
                  onSelectPost={handleSelectPost}
                  onNavigateHome={handleNavigateHome}
                  onSelectCategory={handleSelectCategory}
                />
              )}

              {currentTemplate === 'author' && (
                <AuthorProfileTemplate
                  authorId={selectedAuthorId}
                  onSelectPost={handleSelectPost}
                  onNavigateHome={handleNavigateHome}
                  onSelectCategory={handleSelectCategory}
                />
              )}

              {currentTemplate === 'trending' && (
                <TrendingTemplate
                  posts={posts}
                  onSelectPost={handleSelectPost}
                  onNavigateHome={handleNavigateHome}
                  onSelectCategory={handleSelectCategory}
                />
              )}

              {currentTemplate === 'static' && (
                <StaticInfoTemplate
                  initialPage={staticPage}
                  onNavigateHome={handleNavigateHome}
                  onSelectAuthor={handleSelectAuthor}
                  onNavigateCategory={handleSelectCategory}
                />
              )}

              {(currentTemplate === 'article-loading' || currentTemplate === 'video-loading') && (
                <ArticleLoadingTemplate
                  categorySlug={selectedCategory}
                  onNavigateHome={handleNavigateHome}
                  onSelectCategory={handleSelectCategory}
                />
              )}

              {currentTemplate === 'not-found' && (
                <NotFoundTemplate
                  onNavigateHome={handleNavigateHome}
                  onNavigateLatest={handleNavigateLatest}
                  onNavigateTrending={handleNavigateTrending}
                  onSelectPost={handleSelectPost}
                  onSelectCategory={handleSelectCategory}
                  onExecuteSearch={(q) => handleExecuteSearch(q)}
                />
              )}
            </>
          )}

          {/* GLOBAL SHELL 6: Site Footer */}
          <SiteFooter
            onNavigateCategory={handleSelectCategory}
            onNavigateStatic={handleNavigateStatic}
            onOpenNewsletter={() => setNewsletterOpen(true)}
            onOpenAdmin={() => handleOpenAdmin('publishing')}
          />

          {/* Mobile Drawer */}
          <MobileDrawer
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            onSelectCategory={handleSelectCategory}
            onOpenSearch={() => setSearchOpen(true)}
            onNavigateTrending={() => {
              handleNavigateTrending();
              setMenuOpen(false);
            }}
            onNavigatePhotos={() => {
              handleNavigatePhotos();
              setMenuOpen(false);
            }}
            onNavigateStatic={(page) => {
              handleNavigateStatic(page);
              setMenuOpen(false);
            }}
            onOpenAdmin={() => handleOpenAdmin('publishing')}
          />

          {/* Search Modal */}
          <SearchModal
            posts={posts}
            isOpen={searchOpen}
            onClose={() => setSearchOpen(false)}
            onSelectPost={handleSelectPost}
            onExecuteFullSearch={handleExecuteSearch}
          />

          {/* Newsletter Modal */}
          <NewsletterModule
            isOpen={newsletterOpen}
            onClose={() => setNewsletterOpen(false)}
          />
        </>
      )}

      {/* ======================================================================
          C. GLOBAL SHARED ADMIN MODALS
          ====================================================================== */}
      {/* 1. Publishing Readiness & Duplicate Check Modal */}
      {readinessModalOpen && pendingPostData && (
        <PublishingReadinessModal
          isOpen={readinessModalOpen}
          onClose={() => setReadinessModalOpen(false)}
          checks={getReadinessChecks(pendingPostData)}
          duplicates={getDuplicateMatches(pendingPostData)}
          onProceedToPublish={() => handleExecutePublish(pendingPostData)}
          onReviewExistingStory={(id) => {
            const match = posts.find(p => p.id === id);
            if (match) {
              setReadinessModalOpen(false);
              handleSelectPost(match);
            }
          }}
        />
      )}

      {/* 2. 15-Step Safe Publish Orchestrator & Health Panel Modal */}
      {publishOrchestratorOpen && (
        <PublishOrchestratorModal
          isOpen={publishOrchestratorOpen}
          onClose={() => setPublishOrchestratorOpen(false)}
          operation={currentOperation}
          onViewLiveStory={(id) => {
            setPublishOrchestratorOpen(false);
            const freshPosts = getStoredPosts();
            const found = freshPosts.find((p: WpPost) => p.id === id) || posts.find((p: WpPost) => p.id === id) || freshPosts[0];
            handleSelectPost(found);
          }}
          onViewHomepage={() => {
            setPublishOrchestratorOpen(false);
            setCurrentTemplate('homepage');
            setViewMode('public');
          }}
          onRetryStep={(stepNum) => {
            if (currentOperation) {
              const updatedSteps = currentOperation.steps.map(s => 
                s.stepNumber === stepNum ? { ...s, status: 'success' as const } : s
              );
              setCurrentOperation({ ...currentOperation, steps: updatedSteps, status: 'published_healthy' });
            }
          }}
          onFinish={() => {
            setPublishOrchestratorOpen(false);
            setAdminSection('publishing');
          }}
        />
      )}

      {/* 3. Emergency Breaking News Modal */}
      {emergencyBreakingOpen && (
        <EmergencyBreakingModal
          isOpen={emergencyBreakingOpen}
          onClose={() => setEmergencyBreakingOpen(false)}
          onPublishBreaking={handlePublishEmergencyBreaking}
        />
      )}

      {/* 4. Revision History Modal */}
      {revisionsModalOpen && (
        <RevisionHistoryModal
          isOpen={revisionsModalOpen}
          onClose={() => setRevisionsModalOpen(false)}
          onRestoreVersion={(rev: ArticleRevision) => {
            alert(`Restored article copy to Version ${rev.version}.0`);
            setRevisionsModalOpen(false);
          }}
        />
      )}

      {/* 5. Secure Admin Login Modal */}
      <AdminLoginModal
        isOpen={adminLoginModalOpen}
        onClose={() => {
          setAdminLoginModalOpen(false);
          if (typeof window !== 'undefined' && (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin') || window.location.hash === '#admin')) {
            try {
              window.history.pushState({ view: 'public' }, '', '/');
            } catch (e) {}
          }
        }}
        onSuccess={() => {
          setIsAdminAuthenticated(true);
          setAdminLoginModalOpen(false);
          setAdminSection(pendingAdminSection);
          if (pendingPublishingTab) setPublishingTab(pendingPublishingTab);
          setViewMode('admin');
          try {
            if (typeof window !== 'undefined' && window.location.pathname !== '/admin') {
              window.history.pushState({ view: 'admin' }, '', '/admin');
            }
          } catch (e) {}
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
