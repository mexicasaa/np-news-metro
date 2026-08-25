import React, { useState } from 'react';
import { Radio, Clock, AlertTriangle, Flame, Share2, RefreshCw, Pin } from 'lucide-react';
import { WpPost } from '../types/wordpress';
import { mockPosts, mockAuthors, mockLiveBlog, getLocalizedPost } from '../data/mockWpData';
import { handleImageError } from '../utils/imageFallback';
import { ArticleBody } from '../components/article/ArticleBody';
import { ArticleShareBar } from '../components/article/ArticleShareBar';
import { AuthorBioBox } from '../components/article/AuthorBioBox';
import { LiveTimeline } from '../components/article/LiveTimeline';
import { RelatedStoriesBlock } from '../components/article/RelatedStoriesBlock';
import { RankingItem } from '../components/cards/RankingItem';
import { AdSlot } from '../components/commercial/AdSlot';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { useLanguage } from '../context/LanguageContext';

interface BreakingArticleTemplateProps {
  post: WpPost;
  onSelectPost: (post: WpPost) => void;
  onNavigateHome: () => void;
  onSelectCategory: (category: string) => void;
  onSelectAuthor: (authorId: string) => void;
}

export const BreakingArticleTemplate: React.FC<BreakingArticleTemplateProps> = ({
  post,
  onSelectPost,
  onNavigateHome,
  onSelectCategory,
  onSelectAuthor,
}) => {
  const { language, t, isHindi } = useLanguage();
  const localized = getLocalizedPost(post, language);
  const author = post.customAuthor?.name ? {
    id: 'guest',
    name: post.customAuthor.name,
    role: post.customAuthor.role || 'Guest Contributor',
    avatar: post.customAuthor.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    bio: '',
    twitter: '',
    email: '',
    beats: ['National News'],
    social: {},
    verified: false,
    slug: 'guest'
  } : mockAuthors[post.authorId];
  const relatedBreaking = mockPosts.filter((p) => p.id !== post.id && p.isBreaking);
  const trendingRanking = [...mockPosts].sort((a, b) => b.viewsCount - a.viewsCount).slice(0, 5);

  return (
    <div className="bg-canvas min-h-screen">
      {/* Top Urgent Breaking News Banner */}
      <div className="bg-editorial-red text-white py-2.5 px-4">
        <div className="max-w-site mx-auto flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
            <span>
              {isHindi
                ? 'तत्काल संपादकीय बुलेटिन • निरंतर लाइव अपडेट'
                : 'Urgent Editorial Report • Continuous Updates'}
            </span>
          </div>
          <span className="font-mono text-[11px] text-white/90">
            {isHindi ? 'नई दिल्ली न्यूज़रूम से लाइव' : 'Live from New Delhi Newsroom'}
          </span>
        </div>
      </div>

      <Breadcrumbs
        items={[
          { label: 'Home', onClick: onNavigateHome },
          { label: isHindi ? 'ब्रेकिंग न्यूज़' : 'Breaking News', onClick: () => onSelectCategory('politics') },
          { label: localized.title, isActive: true },
        ]}
      />

      <main className="max-w-site mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Content Column */}
          <article className="lg:col-span-8 max-w-reading">
            {/* Header */}
            <header className="mb-6">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="bg-editorial-red text-white text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-sm shadow-sm flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'ब्रेकिंग स्टोरी' : 'Breaking Story'}</span>
                </span>
                <span className="bg-surface-container text-ink font-bold uppercase tracking-wider text-xs px-2.5 py-1 rounded-sm border border-border-subtle">
                  {localized.category}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-ink leading-[1.18] tracking-tight mb-4">
                {localized.title}
              </h1>

              <p className="text-base sm:text-lg text-ink-secondary leading-relaxed font-normal mb-4">
                {localized.dek}
              </p>

              {/* Time Indicators */}
              <div className="bg-surface-lowest border border-border-subtle p-3 rounded-sm flex items-center justify-between text-xs text-ink-muted flex-wrap gap-2">
                <div className="flex items-center gap-2 text-ink">
                  <span className="font-bold">
                    {isHindi ? 'लेखक: ' : 'By '}{author?.name || (isHindi ? 'न्यूज़रूम टीम' : 'Newsroom Team')}
                  </span>
                  <span>•</span>
                  <span>{isHindi ? '25 मिनट पहले प्रकाशित' : 'Published 25m ago'}</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-editorial-red">
                  <span className="w-2 h-2 rounded-full bg-editorial-red animate-ping"></span>
                  <span>{isHindi ? 'अंतिम अपडेट: 3 मिनट पहले' : 'Last Updated: 3 minutes ago'}</span>
                </div>
              </div>
            </header>

            {/* Social Share Bar with Featured Image */}
            <ArticleShareBar
              post={post}
              title={localized.title}
              featuredImage={localized.featuredImage}
              summary={localized.dek}
              category={post.category}
              commentCount={post.commentCount}
            />

            {/* Hero Image */}
            <figure className="my-6">
              <div className="aspect-[16/9] w-full overflow-hidden rounded-sm bg-surface-container border border-border-subtle">
                <img
                  src={localized.featuredImage}
                  alt={localized.imageAlt || localized.title}
                  onError={handleImageError}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              <figcaption className="text-xs text-ink-muted mt-2 flex items-center justify-between">
                <span>{isHindi && post.imageCaptionHi ? post.imageCaptionHi : post.imageCaption}</span>
                <span className="font-semibold text-ink-secondary">{post.imageCredit}</span>
              </figcaption>
            </figure>

            {/* Live Update Timeline Stream */}
            <LiveTimeline
              updates={mockLiveBlog.updates}
              status="LIVE"
            />

            {/* Gutenberg Blocks */}
            <ArticleBody post={post} />

            {/* Author */}
            {author && (
              <AuthorBioBox
                author={author}
                onViewAuthorProfile={onSelectAuthor}
              />
            )}

            {/* Related Breaking Coverage */}
            <RelatedStoriesBlock
              relatedPosts={mockPosts.slice(1, 4)}
              onSelectPost={onSelectPost}
              onSelectCategory={onSelectCategory}
              title={isHindi ? 'संबंधित निरंतर कवरेज' : 'Related Ongoing Coverage'}
            />
          </article>

          {/* Right Rail Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <AdSlot zone="A3" />

            <div className="bg-surface-lowest border border-border-subtle p-4 rounded-sm shadow-subtle">
              <div className="flex items-center justify-between pb-2 border-b-2 border-editorial-red mb-3">
                <h3 className="font-serif text-base font-bold text-ink flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-editorial-red" />
                  <span>{isHindi ? 'ट्रेंडिंग ब्रेकिंग ख़बरें' : 'Trending Breaking Stories'}</span>
                </h3>
              </div>
              <div className="divide-y divide-border-subtle">
                {trendingRanking.map((p, idx) => (
                  <RankingItem
                    key={p.id}
                    rank={idx + 1}
                    post={p}
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
