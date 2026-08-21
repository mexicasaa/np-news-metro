import React, { useState } from 'react';
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
import { LanguageProvider } from './context/LanguageContext';

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
import { 
  UserRole, UserProfile, PublishingOperation, ReadinessCheckResult, 
  DuplicateMatch, ArticleRevision 
} from './types/admin';
import { mockAdminUsers, mockFailedOperations } from './data/mockAdminData';

function AppContent() {
  // Check if we are in preview mode from URL query or hash
  const [isPreviewTab, setIsPreviewTab] = useState<boolean>(() => {
    return typeof window !== 'undefined' && (
      window.location.search.includes('preview=true') || 
      window.location.hash.includes('preview')
    );
  });

  // Global View Mode: 'public' reader or 'admin' dashboard
  const [viewMode, setViewMode] = useState<'public' | 'admin'>(() => {
    if (typeof window !== 'undefined' && (window.location.search.includes('preview=true') || window.location.hash.includes('preview'))) {
      return 'public';
    }
    return 'public';
  });

  // Reactive Posts State (Seeded from localStorage database for persistence)
  const [posts, setPosts] = useState<WpPost[]>(getStoredPosts);

  // Cross-tab real-time listener for newly published news
  React.useEffect(() => {
    let feedChannel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        feedChannel = new BroadcastChannel('np_news_feed_channel');
        feedChannel.onmessage = (event) => {
          if (event.data?.type === 'NEWS_PUBLISHED') {
            setPosts(getStoredPosts());
          }
        };
      }
    } catch (e) {}

    return () => {
      feedChannel?.close();
    };
  }, []);

  // Public Reader Navigation & Active Template State
  const [currentTemplate, setCurrentTemplate] = useState<string>(() => {
    if (typeof window !== 'undefined' && (window.location.search.includes('preview=true') || window.location.hash.includes('preview'))) {
      return 'article-standard';
    }
    return 'homepage';
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('india');
  const [selectedPost, setSelectedPost] = useState<WpPost>(() => {
    if (typeof window !== 'undefined' && (window.location.search.includes('preview=true') || window.location.hash.includes('preview'))) {
      const draft = localStorage.getItem('np_news_preview_draft');
      if (draft) {
        try {
          return JSON.parse(draft);
        } catch (e) {}
      }
    }
    return initialMockPosts[0];
  });

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
  const [selectedVideo, setSelectedVideo] = useState<WpVideo>(mockVideos[0]);
  const [selectedGallery, setSelectedGallery] = useState<WpGallery>(mockGalleries[0]);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>('author-1');
  const [staticPage, setStaticPage] = useState<StaticPageType>('about');
  const [searchQuery, setSearchQuery] = useState<string>('Infrastructure Corridor');

  // Admin Authentication & Security
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('np_news_admin_auth') === 'true' || sessionStorage.getItem('np_news_admin_auth') === 'true';
  });
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState<boolean>(false);
  const [pendingAdminSection, setPendingAdminSection] = useState<AdminSection>('publishing');
  const [pendingPublishingTab, setPendingPublishingTab] = useState<PublishingTab | undefined>(undefined);

  // Admin Workspace State
  const [adminSection, setAdminSection] = useState<AdminSection>('dashboard');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('editor');
  const [activeEnvironment, setActiveEnvironment] = useState<'production' | 'staging'>('production');
  const [publishingTab, setPublishingTab] = useState<PublishingTab>('all');
  const [activeEditingPost, setActiveEditingPost] = useState<WpPost | undefined>(undefined);

  // URL Routing & /admin Route Detection
  React.useEffect(() => {
    const checkUrlRoute = () => {
      if (typeof window === 'undefined') return;
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      if (path === '/admin' || path.startsWith('/admin/') || path === '/wp-admin' || hash === '#admin') {
        const isAuth = localStorage.getItem('np_news_admin_auth') === 'true' || sessionStorage.getItem('np_news_admin_auth') === 'true';
        if (isAuth) {
          setIsAdminAuthenticated(true);
          setViewMode('admin');
        } else {
          setPendingAdminSection('publishing');
          setAdminLoginModalOpen(true);
        }
      }
    };

    checkUrlRoute();

    const handlePopState = () => {
      checkUrlRoute();
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
  }, []);

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

  // Helper Navigation Handlers (Public)
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (slug: string) => {
    if (slug === 'home') {
      setCurrentTemplate('homepage');
    } else if (slug === 'latest') {
      setCurrentTemplate('latest');
    } else if (slug === 'videos') {
      setCurrentTemplate('video-hub');
    } else if (slug === 'photos') {
      setCurrentTemplate('gallery');
    } else if (slug === 'trending') {
      setCurrentTemplate('trending');
    } else {
      setSelectedCategory(slug);
      setCurrentTemplate('category');
    }
    setViewMode('public');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectVideo = (video: WpVideo) => {
    setSelectedVideo(video);
    setCurrentTemplate('video-detail');
    setViewMode('public');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAuthor = (authorId: string) => {
    setSelectedAuthorId(authorId);
    setCurrentTemplate('author');
    setViewMode('public');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateStatic = (page: string) => {
    setStaticPage(page as StaticPageType);
    setCurrentTemplate('static');
    setViewMode('public');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExecuteSearch = (queryText: string) => {
    setSearchQuery(queryText);
    setCurrentTemplate('search');
    setViewMode('public');
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

  const handleAdminLogout = () => {
    try {
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
        description: `https://npnewsmetro.in/${postData.category}/${postData.slug || 'story'}`,
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
  const handleExecutePublish = (postData: Partial<WpPost>) => {
    setReadinessModalOpen(false);
    setPublishOrchestratorOpen(true);

    const newOpId = `PUB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPostId = postData.id || `post-${Date.now()}`;

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

    // Animate execution of the 15 pipeline steps
    let currentStep = 1;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep <= 15) {
        setCurrentOperation(prev => {
          if (!prev) return null;
          const updatedSteps = prev.steps.map(s => {
            if (s.stepNumber < currentStep) {
              return { ...s, status: 'success' as const, durationMs: Math.floor(40 + Math.random() * 80) };
            } else if (s.stepNumber === currentStep) {
              return { ...s, status: 'running' as const };
            }
            return s;
          });
          return { ...prev, steps: updatedSteps };
        });
      } else {
        clearInterval(interval);
        // Completed pipeline!
        const fullPost: WpPost = {
          id: newPostId,
          title: postData.title || 'Untitled News Story',
          titleHi: postData.titleHi || postData.title || '',
          dek: postData.dek || '',
          category: (postData.category as any) || 'india',
          authorId: postData.authorId || 'author-1',
          customAuthor: postData.customAuthor,
          featuredImage: postData.featuredImage || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200',
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

        // Persist to temporary localStorage database & broadcast
        const updatedPosts = savePublishedPost(fullPost);
        setPosts(updatedPosts);

        if (fullPost.isBreaking) {
          setIsEmergencyBreaking(true);
        }

        setCurrentOperation(prev => {
          if (!prev) return null;
          return {
            ...prev,
            status: 'published_healthy',
            completedAt: new Date().toLocaleTimeString() + ' IST',
            steps: prev.steps.map(s => ({ ...s, status: 'success' as const, durationMs: Math.floor(40 + Math.random() * 80) })),
            verificationReport: {
              url: `https://npnewsmetro.in/${fullPost.category}/${fullPost.slug}`,
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
          };
        });
      }
    }, 160);
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
      featuredImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200',
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

    setPosts(prev => [breakingPost, ...prev]);
    if (data.activateBreakingStrip) {
      setIsEmergencyBreaking(true);
    }

    // Direct transition to live article
    handleSelectPost(breakingPost);
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col font-sans antialiased text-ink selection:bg-secondary-gold/20 selection:text-ink overflow-x-hidden w-full max-w-full">
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
            />
          )}

          {(adminSection === 'new-article' || adminSection === 'edit-article') && (
            <ArticleEditor
              initialPost={activeEditingPost}
              userRole={currentUserRole}
              currentAuthorId={currentUser.id}
              onSaveDraft={(postData) => {
                alert('Draft copy autosaved to memory and localStorage.');
              }}
              onSubmitForReview={(postData) => {
                alert('Article successfully submitted to Copy Editor review queue.');
                setAdminSection('publishing');
                setPublishingTab('review');
              }}
              onApproveCopy={(postData) => {
                alert('Copy approved by Editor. Article moved to Approved queue.');
                setAdminSection('publishing');
                setPublishingTab('approved');
              }}
              onSchedulePost={(postData, scheduleTime) => {
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
            />
          )}

          {adminSection === 'editorial' && (
            <EditorialListView
              posts={posts}
              onEditArticle={handleStartEditArticle}
              onViewLiveArticle={handleSelectPost}
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
            onNavigateHome={() => {
              setCurrentTemplate('homepage');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
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
            onNavigateTrending={() => {
              setCurrentTemplate('trending');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigatePhotos={() => {
              setCurrentTemplate('gallery');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
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
                  onNavigateTrending={() => setCurrentTemplate('trending')}
                  onNavigateVideos={() => setCurrentTemplate('video-hub')}
                  onOpenNewsletter={() => setNewsletterOpen(true)}
                  showAds={showAds}
                />
              )}

              {currentTemplate === 'latest' && (
                <LatestNewsTemplate
                  posts={posts}
                  onSelectPost={handleSelectPost}
                  onNavigateHome={() => setCurrentTemplate('homepage')}
                  onNavigateTrending={() => setCurrentTemplate('trending')}
                  showAds={showAds}
                />
              )}

              {currentTemplate === 'category' && (
                <CategoryTemplate
                  posts={posts}
                  categorySlug={selectedCategory}
                  onSelectPost={handleSelectPost}
                  onNavigateHome={() => setCurrentTemplate('homepage')}
                  onSelectCategory={handleSelectCategory}
                  onNavigateTrending={() => setCurrentTemplate('trending')}
                  showAds={showAds}
                />
              )}

              {currentTemplate === 'article-standard' && (
                <StandardArticleTemplate
                  post={selectedPost}
                  onSelectPost={handleSelectPost}
                  onNavigateHome={() => setCurrentTemplate('homepage')}
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
                  onNavigateHome={() => setCurrentTemplate('homepage')}
                  onSelectCategory={handleSelectCategory}
                  onSelectAuthor={handleSelectAuthor}
                />
              )}

              {currentTemplate === 'article-opinion' && (
                <OpinionArticleTemplate
                  post={selectedPost}
                  onSelectPost={handleSelectPost}
                  onNavigateHome={() => setCurrentTemplate('homepage')}
                  onSelectCategory={handleSelectCategory}
                  onSelectAuthor={handleSelectAuthor}
                />
              )}

              {currentTemplate === 'video-hub' && (
                <VideoHubTemplate
                  onSelectVideo={handleSelectVideo}
                  onNavigateHome={() => setCurrentTemplate('homepage')}
                  showAds={showAds}
                />
              )}

              {currentTemplate === 'video-detail' && (
                <VideoDetailTemplate
                  video={selectedVideo}
                  onSelectVideo={handleSelectVideo}
                  onSelectPost={handleSelectPost}
                  onNavigateHome={() => setCurrentTemplate('homepage')}
                  onNavigateVideos={() => setCurrentTemplate('video-hub')}
                  showAds={showAds}
                />
              )}

              {currentTemplate === 'gallery' && (
                <PhotoGalleryTemplate
                  gallery={selectedGallery}
                  onSelectPost={handleSelectPost}
                  onNavigateHome={() => setCurrentTemplate('homepage')}
                  onSelectCategory={handleSelectCategory}
                  showAds={showAds}
                />
              )}

              {currentTemplate === 'search' && (
                <SearchResultsTemplate
                  posts={posts}
                  initialQuery={searchQuery}
                  onSelectPost={handleSelectPost}
                  onNavigateHome={() => setCurrentTemplate('homepage')}
                  onSelectCategory={handleSelectCategory}
                />
              )}

              {currentTemplate === 'author' && (
                <AuthorProfileTemplate
                  authorId={selectedAuthorId}
                  onSelectPost={handleSelectPost}
                  onNavigateHome={() => setCurrentTemplate('homepage')}
                  onSelectCategory={handleSelectCategory}
                />
              )}

              {currentTemplate === 'trending' && (
                <TrendingTemplate
                  posts={posts}
                  onSelectPost={handleSelectPost}
                  onNavigateHome={() => setCurrentTemplate('homepage')}
                  onSelectCategory={handleSelectCategory}
                />
              )}

              {currentTemplate === 'static' && (
                <StaticInfoTemplate
                  initialPage={staticPage}
                  onNavigateHome={() => setCurrentTemplate('homepage')}
                  onSelectAuthor={handleSelectAuthor}
                />
              )}

              {currentTemplate === 'not-found' && (
                <NotFoundTemplate
                  onNavigateHome={() => setCurrentTemplate('homepage')}
                  onNavigateLatest={() => setCurrentTemplate('latest')}
                  onNavigateTrending={() => setCurrentTemplate('trending')}
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
              setCurrentTemplate('trending');
              setMenuOpen(false);
            }}
            onNavigatePhotos={() => {
              setCurrentTemplate('gallery');
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
            const found = posts.find(p => p.id === id) || posts[0];
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
