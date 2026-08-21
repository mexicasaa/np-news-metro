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

import { WpPost, WpVideo, WpGallery } from './types/wordpress';
import { mockPosts, mockVideos, mockGalleries } from './data/mockWpData';
import { LanguageProvider } from './context/LanguageContext';

// 14 Templates
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

function AppContent() {
  // Navigation & Active Template State
  const [currentTemplate, setCurrentTemplate] = useState<string>('homepage');
  const [selectedCategory, setSelectedCategory] = useState<string>('india');
  const [selectedPost, setSelectedPost] = useState<WpPost>(mockPosts[0]);
  const [selectedVideo, setSelectedVideo] = useState<WpVideo>(mockVideos[0]);
  const [selectedGallery, setSelectedGallery] = useState<WpGallery>(mockGalleries[0]);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>('author-1');
  const [staticPage, setStaticPage] = useState<StaticPageType>('about');
  const [searchQuery, setSearchQuery] = useState<string>('Infrastructure Corridor');

  // Modals & Drawers
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);

  // Editorial Flags
  const [isEmergencyBreaking, setIsEmergencyBreaking] = useState(false);
  const [showAds, setShowAds] = useState(false);
  const [showCorrections, setShowCorrections] = useState(true);
  const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(false);

  // Helper Navigation Handlers
  const handleSelectPost = (post: WpPost) => {
    setSelectedPost(post);
    if (post.isBreaking) {
      setCurrentTemplate('article-breaking');
    } else if (post.isOpinion) {
      setCurrentTemplate('article-opinion');
    } else {
      setCurrentTemplate('article-standard');
    }
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectVideo = (video: WpVideo) => {
    setSelectedVideo(video);
    setCurrentTemplate('video-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAuthor = (authorId: string) => {
    setSelectedAuthorId(authorId);
    setCurrentTemplate('author');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateStatic = (page: string) => {
    setStaticPage(page as StaticPageType);
    setCurrentTemplate('static');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExecuteSearch = (queryText: string) => {
    setSearchQuery(queryText);
    setCurrentTemplate('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col font-sans antialiased text-ink selection:bg-secondary-gold/20 selection:text-ink overflow-x-hidden w-full max-w-full">
      {/* GLOBAL SHELL 1: Utility Bar */}
        <UtilityBar
          onOpenNewsletter={() => setNewsletterOpen(true)}
          onNavigate={(type, data) => {
            if (type === 'static' && data?.page) {
              handleNavigateStatic(data.page);
            }
          }}
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
          breakingPosts={mockPosts.filter((p) => p.isBreaking || p.isLead)}
          onSelectPost={handleSelectPost}
          isEmergencyMode={isEmergencyBreaking}
        />

        {/* GLOBAL SHELL 5: Top Header Leaderboard Ad (A1) */}
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
                onSelectPost={handleSelectPost}
                onNavigateHome={() => setCurrentTemplate('homepage')}
                onNavigateTrending={() => setCurrentTemplate('trending')}
                showAds={showAds}
              />
            )}

            {currentTemplate === 'category' && (
              <CategoryTemplate
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
        />

      {/* OVERLAYS & MODALS */}
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
      />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectPost={handleSelectPost}
        onExecuteFullSearch={handleExecuteSearch}
      />

      <NewsletterModule
        isOpen={newsletterOpen}
        onClose={() => setNewsletterOpen(false)}
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
