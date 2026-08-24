import React, { useState } from 'react';
import { Clock, Filter, Radio, Calendar, Flame, ArrowUpDown, ChevronRight } from 'lucide-react';
import { WpPost } from '../types/wordpress';
import { mockCategories } from '../data/mockWpData';
import { getStoredPosts } from '../utils/newsStorage';
import { LatestNewsRow } from '../components/cards/LatestNewsRow';
import { LargeStoryCard } from '../components/cards/LargeStoryCard';
import { RankingItem } from '../components/cards/RankingItem';
import { AdSlot } from '../components/commercial/AdSlot';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { Pagination } from '../components/common/Pagination';
import { useLanguage } from '../context/LanguageContext';

interface LatestNewsTemplateProps {
  posts?: WpPost[];
  onSelectPost: (post: WpPost) => void;
  onNavigateHome: () => void;
  onNavigateTrending: () => void;
  showAds?: boolean;
}

export const LatestNewsTemplate: React.FC<LatestNewsTemplateProps> = ({
  posts: externalPosts,
  onSelectPost,
  onNavigateHome,
  onNavigateTrending,
  showAds = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { t, isHindi } = useLanguage();

  const itemsPerPage = 10;
  const allPosts = externalPosts && externalPosts.length > 0 ? externalPosts : getStoredPosts();
  
  // Sort all posts chronologically
  const sortedPosts = [...allPosts].sort((a, b) => {
    const timeA = new Date(a.publishedAt || 0).getTime();
    const timeB = new Date(b.publishedAt || 0).getTime();
    return timeB - timeA;
  });

  const filteredPosts = sortedPosts.filter(
    (p) => selectedCategory === 'all' || p.category === selectedCategory
  );

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / itemsPerPage));
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const featuredLatest = currentPage === 1 ? paginatedPosts[0] : null;
  const streamPosts = currentPage === 1 ? paginatedPosts.slice(1) : paginatedPosts;
  const trendingRanking = [...allPosts].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0)).slice(0, 5);

  return (
    <div className="bg-canvas min-h-screen">
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: onNavigateHome },
          { label: isHindi ? 'ताज़ा समाचार स्ट्रीम' : 'Latest News Stream', isActive: true },
        ]}
      />

      <main className="max-w-site mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="border-b-2 border-primary pb-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 bg-editorial-red rounded-full animate-ping"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-editorial-red">
              {isHindi ? 'रीयल-टाइम संपादकीय फ़ीड' : 'Real-Time Editorial Feed'}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
            {isHindi ? 'ताज़ा समाचार एवं वायर बुलेटिन' : 'Latest News & Wire Dispatches'}
          </h1>

          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            {isHindi
              ? 'एनपी न्यूज़ मेट्रो राष्ट्रीय न्यूज़रूम नेटवर्क द्वारा संचालित रीयल-टाइम प्रकाशन फ़ीड।'
              : 'Chronological real-time publishing feed powered by the NP News Metro national newsroom network.'}
          </p>
        </div>

        {/* Filter Pills Bar */}
        <div className="bg-surface-lowest border border-border-subtle p-3 rounded-sm mb-8 flex items-center justify-between gap-3 overflow-x-auto hide-scrollbar text-xs">
          <div className="flex items-center gap-1.5 flex-shrink-0 font-bold uppercase text-ink text-[11px]">
            <Filter className="w-3.5 h-3.5 text-primary" />
            <span>{isHindi ? 'अनुभाग फ़िल्टर:' : 'Filter Section:'}</span>
          </div>

          <div className="flex items-center gap-1.5 flex-nowrap">
            <button
              onClick={() => { setSelectedCategory('all'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-sm font-semibold transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-surface-container text-ink hover:bg-surface-high'
              }`}
            >
              {isHindi ? 'सभी अनुभाग' : 'All Sections'}
            </button>
            {mockCategories.slice(0, 8).map((cat) => {
              const catLabel = isHindi && cat.nameHi ? cat.nameHi : cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.slug); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.slug
                      ? 'bg-primary text-white font-semibold'
                      : 'bg-surface-container text-ink hover:bg-surface-high'
                  }`}
                >
                  {catLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* 12-Column Grid: Main Feed (8 cols) + Sidebar (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-6">
            {/* Featured latest story above stream */}
            {featuredLatest && (
              <div className="mb-6">
                <LargeStoryCard
                  post={featuredLatest}
                  onSelect={onSelectPost}
                />
              </div>
            )}

            {/* Chronological Stream */}
            <div className="bg-surface-lowest border border-border-subtle rounded-sm p-3 divide-y divide-border-subtle shadow-subtle">
              <div className="p-2 text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center justify-between">
                <span>{isHindi ? 'आज के समय-चिह्नित समाचार' : "Today's Time-stamped Stories"}</span>
                <span>{isHindi ? 'भारतीय मानक समय' : 'IST Timezone'}</span>
              </div>
              {streamPosts.map((post) => (
                <LatestNewsRow
                  key={post.id}
                  post={post}
                  onSelect={onSelectPost}
                  showThumbnail={true}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>

          {/* Right Rail Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Ad Slot A3 */}
            {showAds && <AdSlot zone="A3" />}

            {/* Most Read Ranking */}
            <div className="bg-surface-lowest border border-border-subtle p-4 rounded-sm shadow-subtle">
              <div className="flex items-center justify-between pb-2 border-b-2 border-secondary mb-3">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-secondary" />
                  <h3 className="font-serif text-base font-bold text-ink">
                    {isHindi ? 'आज सर्वाधिक पढ़े गए' : 'Most Read Today'}
                  </h3>
                </div>
                <button
                  onClick={onNavigateTrending}
                  className="text-[11px] font-bold uppercase text-secondary hover:underline"
                >
                  {isHindi ? 'सभी देखें' : 'View All'}
                </button>
              </div>

              <div className="divide-y divide-border-subtle">
                {trendingRanking.map((post, idx) => (
                  <RankingItem
                    key={post.id}
                    rank={idx + 1}
                    post={post}
                    onSelect={onSelectPost}
                  />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
