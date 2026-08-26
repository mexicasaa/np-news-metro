import React, { useState } from 'react';
import { 
  TrendingUp, Video, Newspaper, ArrowRight, ShieldCheck, 
  ChevronRight, Sparkles, Flame, CheckCircle2, Clock 
} from 'lucide-react';
import { WpPost, WpVideo } from '../types/wordpress';
import { mockVideos, mockAuthors } from '../data/mockWpData';
import { getStoredPosts } from '../utils/newsStorage';
import { HeroStory } from '../components/cards/HeroStory';
import { LargeStoryCard } from '../components/cards/LargeStoryCard';
import { MediumStoryCard } from '../components/cards/MediumStoryCard';
import { CompactStoryCard } from '../components/cards/CompactStoryCard';
import { HorizontalStoryCard } from '../components/cards/HorizontalStoryCard';
import { LatestNewsRow } from '../components/cards/LatestNewsRow';
import { RankingItem } from '../components/cards/RankingItem';
import { VideoCard } from '../components/cards/VideoCard';
import { AdSlot } from '../components/commercial/AdSlot';
import { NewsletterModule } from '../components/common/NewsletterModule';
import { useLanguage } from '../context/LanguageContext';

interface HomepageProps {
  posts?: WpPost[];
  onSelectPost: (post: WpPost) => void;
  onSelectVideo: (video: WpVideo) => void;
  onSelectCategory: (category: string) => void;
  onSelectAuthor: (authorId: string) => void;
  onNavigateTrending: () => void;
  onNavigateVideos: () => void;
  onOpenNewsletter: () => void;
  showAds?: boolean;
}

export const Homepage: React.FC<HomepageProps> = ({
  posts: externalPosts,
  onSelectPost,
  onSelectVideo,
  onSelectCategory,
  onSelectAuthor,
  onNavigateTrending,
  onNavigateVideos,
  onOpenNewsletter,
  showAds = false,
}) => {
  const { t, isHindi } = useLanguage();
  const allPosts = externalPosts && externalPosts.length > 0 ? externalPosts : getStoredPosts();
  
  // Sort all posts by publishedAt (latest news first)
  const sortedPosts = [...allPosts].sort((a, b) => {
    const timeA = new Date(a.publishedAt || 0).getTime();
    const timeB = new Date(b.publishedAt || 0).getTime();
    return timeB - timeA;
  });

  const [visibleLatestCount, setVisibleLatestCount] = useState(4);

  // Hero Lead & Slider feeds (strictly latest 10 articles only)
  const latestTenPosts = sortedPosts.slice(0, 10);
  const leadPost = latestTenPosts.find((p) => p.isLead) || latestTenPosts[0] || sortedPosts[0];
  const featuredPosts = latestTenPosts;
  const supportingLeadPosts = sortedPosts.filter((p) => p.id !== leadPost?.id).slice(0, 6);
  const latestPosts = sortedPosts.slice(0, visibleLatestCount);
  const indiaPosts = sortedPosts.filter((p) => p.category === 'india' || p.category === 'politics');
  const businessPosts = sortedPosts.filter((p) => p.category === 'business' || p.category === 'economy');
  const techWorldPosts = sortedPosts.filter((p) => p.category === 'technology' || p.category === 'world');
  const trendingRanking = [...allPosts].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0)).slice(0, 6);

  return (
    <main className="max-w-site mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8">
      {/* 1. Top Interstitial Billboard Ad (A1/A2) */}
      {showAds && <AdSlot zone="A2" />}

      {/* 2. Grand Hero Showcase & Supporting Cluster */}
      <section aria-label="Lead Story and Top Headlines">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
          {/* Main Hero Card (Large 16:9 Slider + Info) */}
          <div className="lg:col-span-8">
            <HeroStory
              post={leadPost}
              featuredPosts={featuredPosts}
              onSelect={onSelectPost}
              onSelectAuthor={onSelectAuthor}
              onSelectCategory={onSelectCategory}
            />
          </div>

          {/* Right Column: Key Supporting News Cluster */}
          <div className="lg:col-span-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-2 border-b-2 border-primary">
              <span className="font-serif text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-secondary" />
                <span>{isHindi ? 'संपादक की पसंद' : 'Editor’s Picks'}</span>
              </span>
              <span className="text-[11px] font-mono text-ink-muted uppercase font-semibold">
                {isHindi ? 'विशेष चयन' : 'Curated'}
              </span>
            </div>

            <div className="space-y-3">
              {supportingLeadPosts.map((post) => (
                <div key={post.id} className="bg-surface-lowest rounded-sm border border-border-subtle shadow-subtle hover:border-border-strong transition-all overflow-hidden">
                  <CompactStoryCard
                    post={post}
                    onSelect={onSelectPost}
                    showThumbnail={true}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Latest News Chronological Stream & Editorial Wire */}
      <section aria-label="Latest News Stream" className="pt-2 sm:pt-4">

        {/* 2-Column Split: Latest News Stream (7 cols) + Most Read Ranking (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Latest News Feed */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b-2 border-primary">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-editorial-red animate-ping"></span>
                <h2 className="font-serif text-xl font-bold text-ink">
                  {t.latestNewsWire}
                </h2>
              </div>
              <button
                onClick={() => onSelectCategory('latest')}
                className="text-xs font-bold uppercase tracking-wider text-primary hover:text-secondary flex items-center gap-1 transition-colors"
              >
                <span>{t.viewAllUpdates}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {latestPosts.map((post) => (
                <LatestNewsRow
                  key={post.id}
                  post={post}
                  onSelect={onSelectPost}
                  showThumbnail={true}
                />
              ))}
            </div>

            {sortedPosts.length > visibleLatestCount && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setVisibleLatestCount((prev: number) => prev + 4)}
                  className="px-4 py-2 bg-surface-lowest border border-border-subtle hover:border-primary text-xs font-bold uppercase tracking-wider text-primary hover:text-secondary rounded-sm transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>{isHindi ? `और ताज़ा खबरें देखें (${sortedPosts.length - visibleLatestCount} बाकी)` : `Load More Stories (${sortedPosts.length - visibleLatestCount} remaining)`}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Most Read Ranking (Single Unified Card, No Numbers) */}
          <div className="lg:col-span-5 space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b-2 border-secondary">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-secondary" />
                <h2 className="font-serif text-lg sm:text-xl font-bold text-ink">
                  {t.mostReadAcrossIndia}
                </h2>
              </div>
              <button
                onClick={onNavigateTrending}
                className="text-xs font-bold uppercase tracking-wider text-secondary hover:text-primary flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>{t.top10List}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Single Unified Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {trendingRanking.map((post) => (
                <RankingItem
                  key={post.id}
                  post={post}
                  onSelect={onSelectPost}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section Module: National Affairs & Politics */}
      <section aria-label="National & Politics Section" className="pt-2 sm:pt-4">
        <div className="flex items-center justify-between pb-2 border-b-2 border-primary mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-primary rotate-45 inline-block"></span>
            <h2 className="font-serif text-2xl font-bold text-ink">
              {t.indiaPolitics}
            </h2>
          </div>
          <button
            onClick={() => onSelectCategory('politics')}
            className="text-xs font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1"
          >
            <span>{t.viewAllPolitics}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {indiaPosts.slice(0, 3).map((post) => (
            <LargeStoryCard
              key={post.id}
              post={post}
              onSelect={onSelectPost}
              onSelectCategory={onSelectCategory}
            />
          ))}
        </div>
      </section>

      {/* 5. Mid-page Interstitial Advertisement (A7) */}
      {showAds && <AdSlot zone="A7" />}

      {/* 6. Section Module: Business, Economy & Markets */}
      <section aria-label="Business & Economy Section" className="pt-2 sm:pt-4">
        <div className="flex items-center justify-between pb-2 border-b-2 border-secondary mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-secondary rotate-45 inline-block"></span>
            <h2 className="font-serif text-2xl font-bold text-ink">
              {t.businessMarketsEconomy}
            </h2>
          </div>
          <button
            onClick={() => onSelectCategory('business')}
            className="text-xs font-bold uppercase tracking-wider text-secondary hover:text-primary flex items-center gap-1 cursor-pointer"
          >
            <span>{t.viewAllBusiness}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Balanced 3-Column Business Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businessPosts.slice(0, 3).map((post) => (
            <LargeStoryCard
              key={post.id}
              post={post}
              onSelect={onSelectPost}
              onSelectCategory={onSelectCategory}
            />
          ))}
        </div>
      </section>

      {/* 7. Dedicated Multimedia / Video Section (Cinematic Dark Theater) */}
      <section aria-label="NP Newsroom Video Section" className="bg-slate-950 border border-slate-850 text-white p-4 sm:p-7 rounded-lg shadow-2xl mt-8 sm:mt-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-editorial-red text-white flex items-center justify-center flex-shrink-0 shadow-lg">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
                {t.videoExplainers}
              </h2>
              <p className="text-xs text-slate-400">
                {t.videoExplainerSubhead}
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateVideos}
            className="self-start sm:self-auto bg-slate-900 hover:bg-editorial-red text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-sm border border-slate-700 transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-sm"
          >
            <span>{t.videoHub}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockVideos.slice(0, 4).map((vid) => (
            <VideoCard
              key={vid.id}
              video={vid}
              onSelect={onSelectVideo}
            />
          ))}
        </div>
      </section>

      {/* 8. Split 2-Column: Technology & World Affairs */}
      <section aria-label="Technology and World News" className="pt-2 sm:pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tech Desk */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b-2 border-primary mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <h2 className="font-serif text-xl font-bold text-ink">
                  {t.techDeepTech}
                </h2>
              </div>
              <button
                onClick={() => onSelectCategory('technology')}
                className="text-xs font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{t.moreTech}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-4">
              {techWorldPosts.filter((p) => p.category === 'technology').slice(0, 2).map((post) => (
                <HorizontalStoryCard
                  key={post.id}
                  post={post}
                  onSelect={onSelectPost}
                  onSelectCategory={onSelectCategory}
                />
              ))}
            </div>
          </div>

          {/* World Desk */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b-2 border-secondary mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <h2 className="font-serif text-xl font-bold text-ink">
                  {t.worldDiplomacy}
                </h2>
              </div>
              <button
                onClick={() => onSelectCategory('world')}
                className="text-xs font-bold uppercase tracking-wider text-secondary hover:text-primary flex items-center gap-1 cursor-pointer"
              >
                <span>{t.moreWorld}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-4">
              {techWorldPosts.filter((p) => p.category === 'world').slice(0, 2).map((post) => (
                <HorizontalStoryCard
                  key={post.id}
                  post={post}
                  onSelect={onSelectPost}
                  onSelectCategory={onSelectCategory}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 9. Inline Newsletter Subscription Module */}
      <section aria-label="Newsletter Box" className="pt-4">
        <NewsletterModule inline={true} />
      </section>
    </main>
  );
};
