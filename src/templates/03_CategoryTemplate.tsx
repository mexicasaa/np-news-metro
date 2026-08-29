import React, { useState } from 'react';
import { Filter, Flame, ChevronRight, Newspaper, ArrowRight } from 'lucide-react';
import { WpCategory, WpPost } from '../types/wordpress';
import { mockCategories } from '../data/mockWpData';
import { getStoredPosts, isPostPublished } from '../utils/newsStorage';
import { HeroStory } from '../components/cards/HeroStory';
import { LargeStoryCard } from '../components/cards/LargeStoryCard';
import { MediumStoryCard } from '../components/cards/MediumStoryCard';
import { CompactStoryCard } from '../components/cards/CompactStoryCard';
import { HorizontalStoryCard } from '../components/cards/HorizontalStoryCard';
import { RankingItem } from '../components/cards/RankingItem';
import { AdSlot } from '../components/commercial/AdSlot';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { Pagination } from '../components/common/Pagination';
import { MetromatPoll } from '../components/common/MetromatPoll';
import { useLanguage } from '../context/LanguageContext';

interface CategoryTemplateProps {
  posts?: WpPost[];
  categorySlug: string;
  onSelectPost: (post: WpPost) => void;
  onNavigateHome: () => void;
  onSelectCategory: (categorySlug: string) => void;
  onNavigateTrending: () => void;
  showAds?: boolean;
}

export const CategoryTemplate: React.FC<CategoryTemplateProps> = ({
  posts: externalPosts,
  categorySlug,
  onSelectPost,
  onNavigateHome,
  onSelectCategory,
  onNavigateTrending,
  showAds = false,
}) => {
  const [activeSubcategory, setActiveSubcategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const { t, isHindi } = useLanguage();

  const allPosts = (externalPosts && externalPosts.length > 0 ? externalPosts : getStoredPosts()).filter(isPostPublished);
  const foundCategory = mockCategories.find((c) => c.slug === categorySlug);
  const categoryName = isHindi && foundCategory?.nameHi ? foundCategory.nameHi : (foundCategory?.name || (categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)));

  const category = foundCategory || {
    id: 'cat-default',
    name: categoryName,
    slug: categorySlug,
    description: `In-depth reporting, investigative news, policy analysis, and expert perspectives on ${categorySlug}.`,
    count: 24,
    subcategories: ['All', 'National', 'Analysis', 'Interviews', 'Special Reports'],
  };

  const subcategories = isHindi ? [
    'सभी', 'राष्ट्रीय', 'विश्लेषण', 'साक्षात्कार', 'विशेष रिपोर्ट'
  ] : (category.subcategories || ['All', 'National', 'Analysis', 'Interviews', 'Special Reports']);

  const categoryPosts = allPosts.filter((p) => p.category === categorySlug);
  const displayPosts = categoryPosts.length > 0 ? categoryPosts : allPosts;
  const heroPost = displayPosts[0] || allPosts[0];
  const topGridPosts = displayPosts.slice(1, 4);
  const feedPosts = displayPosts.slice(4);
  const trendingRanking = [...allPosts].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0)).slice(0, 5);

  return (
    <div className="bg-canvas min-h-screen">
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: onNavigateHome },
          { label: categoryName, isActive: true },
        ]}
      />

      <main className="max-w-site mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="border-b-2 border-primary pb-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 bg-secondary rotate-45 inline-block"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-secondary">
              {isHindi ? 'संपादकीय अनुभाग डेस्क' : 'Editorial Section Desk'}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-ink tracking-tight mb-2">
            {categoryName}
          </h1>

          <p className="text-sm sm:text-base text-ink-secondary max-w-3xl leading-relaxed">
            {isHindi
              ? `${categoryName} से संबंधित गहन रिपोर्टिंग, खोजी पत्रकारिता, नीतिगत विश्लेषण और विशेषज्ञ दृष्टिकोण।`
              : category.description}
          </p>

          {(categorySlug === 'opinion' || categorySlug === 'metromat') && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-xs text-ink">
              <span className="font-bold text-amber-900">RNI Reg. No:</span>
              <span className="font-mono font-bold text-ink">DEL HIN/2010/31544</span>
              <span className="text-ink-secondary">({isHindi ? 'मैट्रो मत दिल्ली' : 'by Metromat Delhi'})</span>
            </div>
          )}

          {/* Subcategory Filter Tabs */}
          {subcategories.length > 0 && (
            <div className="flex items-center gap-2 mt-4 overflow-x-auto hide-scrollbar text-xs font-semibold">
              <span className="text-ink-muted text-[11px] uppercase font-bold mr-1">
                {isHindi ? 'उप-विषय:' : 'Beats:'}
              </span>
              {subcategories.map((sub, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSubcategory(sub)}
                  className={`px-3 py-1.5 rounded-sm transition-colors whitespace-nowrap ${
                    activeSubcategory === sub || (idx === 0 && (activeSubcategory === 'All' || activeSubcategory === 'सभी'))
                      ? 'bg-primary text-white font-bold'
                      : 'bg-surface-container text-ink hover:bg-surface-high border border-border-subtle'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Metromat Signature Interactive Poll */}
        {(categorySlug === 'opinion' || categorySlug === 'metromat') && (
          <div className="mb-10">
            <MetromatPoll />
          </div>
        )}

        {/* Top Featured Hero of Category */}
        {heroPost && (
          <div className="mb-10">
            <HeroStory
              post={heroPost}
              onSelect={onSelectPost}
            />
          </div>
        )}

        {/* Top Stories 3-Col Grid */}
        {topGridPosts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between pb-2 border-b-2 border-primary mb-6">
              <h2 className="font-serif text-xl font-bold text-ink">
                {isHindi ? `प्रमुख ${categoryName} विश्लेषण` : `Featured ${category.name} Analysis`}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topGridPosts.map((post) => (
                <LargeStoryCard
                  key={post.id}
                  post={post}
                  onSelect={onSelectPost}
                />
              ))}
            </div>
          </section>
        )}

        {/* 12-Col Layout: Category Feed (8 cols) + Right Rail (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6 border-t border-border-subtle">
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b-2 border-primary">
              <h3 className="font-serif text-xl font-bold text-ink">
                {isHindi ? `सभी ${categoryName} ख़बरें एवं अभिलेखागार` : `All ${category.name} Stories & Archives`}
              </h3>
              <span className="text-xs text-ink-muted">
                {isHindi ? `पृष्ठ ${currentPage} / 4` : `Page ${currentPage} of 4`}
              </span>
            </div>

            <div className="space-y-4">
              {(feedPosts.length > 0 ? feedPosts : allPosts.slice(0, 4)).map((post: WpPost) => (
                <HorizontalStoryCard
                  key={post.id}
                  post={post}
                  onSelect={onSelectPost}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={4}
              onPageChange={setCurrentPage}
            />
          </div>

          {/* Right Rail Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Sidebar Ad (A3) */}
            {showAds && <AdSlot zone="A3" />}

            {/* Most Read in Category / Overall */}
            <div className="bg-surface-lowest border border-border-subtle p-4 rounded-sm shadow-subtle">
              <div className="flex items-center justify-between pb-2 border-b-2 border-secondary mb-3">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-secondary" />
                  <h4 className="font-serif text-base font-bold text-ink">
                    {isHindi ? `${categoryName} में सर्वाधिक पढ़े गए` : `Most Read in ${category.name}`}
                  </h4>
                </div>
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
