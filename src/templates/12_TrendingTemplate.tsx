import React, { useState } from 'react';
import { Flame, TrendingUp, Calendar, Share2, Eye, Award } from 'lucide-react';
import { WpPost } from '../types/wordpress';
import { getLocalizedPost } from '../data/mockWpData';
import { getStoredPosts, isPostPublished } from '../utils/newsStorage';
import { RankingItem } from '../components/cards/RankingItem';
import { LargeStoryCard } from '../components/cards/LargeStoryCard';
import { AdSlot } from '../components/commercial/AdSlot';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { useLanguage } from '../context/LanguageContext';

interface TrendingTemplateProps {
  posts?: WpPost[];
  onSelectPost: (post: WpPost) => void;
  onNavigateHome: () => void;
  onSelectCategory: (category: string) => void;
  showAds?: boolean;
}

export const TrendingTemplate: React.FC<TrendingTemplateProps> = ({
  posts: externalPosts,
  onSelectPost,
  onNavigateHome,
  onSelectCategory,
  showAds = false,
}) => {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'shared'>('today');
  const { language, t, isHindi } = useLanguage();

  const allPosts = (externalPosts && externalPosts.length > 0 ? externalPosts : getStoredPosts()).filter(isPostPublished);

  // Sorted list for top 10
  const sortedPosts = [...allPosts].sort((a, b) => {
    if (timeframe === 'shared') return (b.sharesCount || 0) - (a.sharesCount || 0);
    return (b.viewsCount || 0) - (a.viewsCount || 0);
  });

  const top1Story = sortedPosts[0] || allPosts[0];
  const locTop1 = top1Story ? getLocalizedPost(top1Story, language) : null;
  const rankingList = sortedPosts.slice(0, 10);

  return (
    <div className="bg-canvas min-h-screen">
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: onNavigateHome },
          { label: isHindi ? 'ट्रेंडिंग एवं सर्वाधिक पढ़े गए' : 'Trending & Most Read', isActive: true },
        ]}
      />

      <main className="max-w-site mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="border-b-2 border-primary pb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 bg-secondary rotate-45 inline-block"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-secondary">
              {isHindi ? 'पाठक रुझान एवं विश्लेषण' : 'Audience Pulse & Metrics'}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-ink tracking-tight mb-2">
            {isHindi ? 'भारत भर में ट्रेंडिंग और सर्वाधिक पढ़े गए समाचार' : 'Trending & Most Read Across India'}
          </h1>

          <p className="text-xs sm:text-sm text-ink-secondary max-w-2xl leading-relaxed">
            {isHindi
              ? 'हमारे राष्ट्रीय समाचार नेटवर्क पर पाठक जुड़ाव, सत्यापित शेयर और संपादकीय रुचि को मापने वाले वास्तविक समय के आंकड़े।'
              : 'Real-time analytics measuring reader engagement, verified shares, and editorial interest across our national news network.'}
          </p>

          {/* Timeframe Filter Tabs */}
          <div className="flex items-center gap-2 mt-4 text-xs font-bold uppercase tracking-wider flex-wrap">
            <button
              onClick={() => setTimeframe('today')}
              className={`px-3 py-1.5 rounded-sm transition-colors ${
                timeframe === 'today'
                  ? 'bg-primary text-white font-bold'
                  : 'bg-surface-container text-ink hover:bg-surface-high border border-border-subtle'
              }`}
            >
              {isHindi ? 'आज के शीर्ष 10' : "Today's Top 10"}
            </button>
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1.5 rounded-sm transition-colors ${
                timeframe === 'week'
                  ? 'bg-primary text-white font-bold'
                  : 'bg-surface-container text-ink hover:bg-surface-high border border-border-subtle'
              }`}
            >
              {isHindi ? 'इस सप्ताह' : 'This Week'}
            </button>
            <button
              onClick={() => setTimeframe('shared')}
              className={`px-3 py-1.5 rounded-sm transition-colors ${
                timeframe === 'shared'
                  ? 'bg-primary text-white font-bold'
                  : 'bg-surface-container text-ink hover:bg-surface-high border border-border-subtle'
              }`}
            >
              {isHindi ? 'सर्वाधिक शेयर की गई ख़बरें' : 'Most Shared Stories'}
            </button>
          </div>
        </div>

        {/* Top 1 Hero Feature of Trending */}
        {top1Story && locTop1 && (
          <section aria-label="#1 Ranked Story" className="bg-surface-lowest border-2 border-secondary p-6 rounded-sm shadow-subtle">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-secondary text-white text-xs font-extrabold px-2.5 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>{isHindi ? 'देश में #1 सर्वाधिक पढ़ा गया समाचार' : '#1 Most Read in the Country'}</span>
              </span>
              <span className="text-xs text-ink-muted">
                {isHindi ? `आज ${(top1Story.viewsCount / 1000).toFixed(1)}k पाठकों ने पढ़ा` : `${(top1Story.viewsCount / 1000).toFixed(1)}k readers today`}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 aspect-[16/9] overflow-hidden rounded-sm bg-surface-container">
                <img
                  src={locTop1.featuredImage}
                  alt={locTop1.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="lg:col-span-5 space-y-3">
                <span className="text-xs font-bold uppercase text-secondary tracking-wider">
                  {locTop1.category}
                </span>
                <h2
                  onClick={() => onSelectPost(top1Story)}
                  className="font-serif text-2xl sm:text-3xl font-bold text-ink hover:text-primary cursor-pointer leading-snug"
                >
                  {locTop1.title}
                </h2>
                <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                  {locTop1.dek}
                </p>
                <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-ink-muted">
                  <span className="flex items-center gap-1 font-mono text-ink">
                    <Share2 className="w-3.5 h-3.5 text-secondary-gold" />
                    <span>
                      {isHindi ? `${top1Story.sharesCount} सत्यापित शेयर` : `${top1Story.sharesCount} verified shares`}
                    </span>
                  </span>
                  <button
                    onClick={() => onSelectPost(top1Story)}
                    className="text-primary font-bold hover:underline"
                  >
                    {isHindi ? 'पूरी ख़बर पढ़ें →' : 'Read Full Story →'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 12-Col Layout: Top 10 Numbered List (8 cols) + Ad/Sidebar (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Top 10 List */}
          <div className="lg:col-span-8 bg-surface-lowest border border-border-subtle rounded-sm p-4 divide-y divide-border-subtle shadow-subtle">
            <div className="pb-3 text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center justify-between">
              <span>{isHindi ? 'राष्ट्रीय लीडरबोर्ड (रैंक 01 से 10)' : 'National Leaderboard (Rank 01 to 10)'}</span>
              <span>{isHindi ? 'प्रति घंटा अपडेट' : 'Updated Hourly'}</span>
            </div>

            {rankingList.map((post, idx) => (
              <RankingItem
                key={post.id}
                rank={idx + 1}
                post={post}
                onSelect={onSelectPost}
                showMetrics={true}
              />
            ))}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {showAds && <AdSlot zone="A3" />}

            <div className="bg-primary text-white p-5 rounded-sm border border-slate-700">
              <span className="text-[10px] uppercase font-bold text-secondary-gold tracking-widest block mb-1">
                {isHindi ? 'संपादकीय पारदर्शिता नोट' : 'Editorial Transparency Note'}
              </span>
              <h4 className="font-serif text-lg font-bold text-white mb-2">
                {isHindi ? 'हम समाचारों की रैंकिंग कैसे करते हैं' : 'How We Rank Stories'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isHindi
                  ? 'रैंकिंग वास्तविक उपयोगकर्ताओं के पढ़ने के समय और सत्यापित सीधे शेयरों द्वारा निर्धारित की जाती है, जिसे बॉट ट्रैफ़िक और कृत्रिम प्रसार से फ़िल्टर किया जाता है।'
                  : 'Rankings are determined by real user reading dwell time and verified direct shares, filtered against bot traffic and artificial amplification.'}
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
