import React, { useState, useEffect } from 'react';
import { ShieldCheck, Twitter, Linkedin, Mail, ArrowRight, BookOpen, Flame, Newspaper } from 'lucide-react';
import { WpAuthor, WpPost } from '../types/wordpress';
import { mockAuthors } from '../data/mockWpData';
import { getStoredPosts } from '../utils/newsStorage';
import { HorizontalStoryCard } from '../components/cards/HorizontalStoryCard';
import { RankingItem } from '../components/cards/RankingItem';
import { AdSlot } from '../components/commercial/AdSlot';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { useLanguage } from '../context/LanguageContext';
import { getAuthorAvatarUrl, handleAvatarError } from '../utils/imageFallback';
import { getAuthorArticles } from '../services/articleService';
import { matchEditorialAuthor, getLocalizedAuthor } from '../services/translationService';
import { slugifyText } from '../utils/slugify';

interface AuthorProfileTemplateProps {
  authorId?: string;
  onSelectPost: (post: WpPost) => void;
  onNavigateHome: () => void;
  onSelectCategory: (category: string) => void;
}

export const AuthorProfileTemplate: React.FC<AuthorProfileTemplateProps> = ({
  authorId = 'author-neeraj-pandey',
  onSelectPost,
  onNavigateHome,
  onSelectCategory,
}) => {
  const [activeTab, setActiveTab] = useState<'latest' | 'popular'>('latest');
  const { t, isHindi, language } = useLanguage();

  const matchedAuthor = matchEditorialAuthor(authorId);
  const rawAuthor: WpAuthor = matchedAuthor || (() => {
    // Check if stored posts contain this author
    const stored = getStoredPosts();
    const found = stored.find(
      (p) =>
        p.authorId === authorId ||
        p.customAuthor?.name?.toLowerCase() === authorId.toLowerCase() ||
        (p as any).authorName?.toLowerCase() === authorId.toLowerCase()
    );
    if (found?.customAuthor) {
      const ca = found.customAuthor;
      return {
        id: `author-${slugifyText(ca.name, 40)}`,
        name: ca.name,
        nameHi: ca.name,
        slug: slugifyText(ca.name, 40),
        role: ca.role || 'विशेष संवाददाता',
        roleHi: ca.role || 'विशेष संवाददाता',
        avatar: ca.avatar || '/np-author-default.png',
        bio: ca.bio || `${ca.name} एनपी न्यूज़ मेट्रो के लिए विशेष रिपोर्टिंग और समसामयिक आलेख प्रस्तुत करते हैं।`,
        bioHi: ca.bio || `${ca.name} एनपी न्यूज़ मेट्रो के लिए विशेष रिपोर्टिंग और समसामयिक आलेख प्रस्तुत करते हैं।`,
        verified: false,
        beats: ['Regional Affairs', 'Special Dispatch'],
        social: {},
      };
    }
    // Dynamic contributor
    const cleanName = authorId.replace(/^author-/, '').replace(/-/g, ' ');
    return {
      id: authorId.startsWith('author-') ? authorId : `author-${authorId}`,
      name: cleanName,
      nameHi: cleanName,
      slug: slugifyText(cleanName, 40),
      role: 'विशेष संवाददाता',
      roleHi: 'विशेष संवाददाता',
      avatar: '/np-author-default.png',
      bio: `${cleanName} एनपी न्यूज़ मेट्रो के लिए विशेष रिपोर्टिंग और समसामयिक आलेख प्रस्तुत करते हैं।`,
      bioHi: `${cleanName} एनपी न्यूज़ मेट्रो के लिए विशेष रिपोर्टिंग और समसामयिक आलेख प्रस्तुत करते हैं।`,
      verified: false,
      beats: ['Regional Affairs', 'Special Dispatch'],
      social: {},
    };
  })();

  const author = getLocalizedAuthor(rawAuthor, language);
  const displayName = author.name;
  const displayRole = author.role;
  const displayBio = author.bio;

  const [authorPosts, setAuthorPosts] = useState<WpPost[]>(() => {
    const stored = getStoredPosts();
    return stored.filter(
      (p) =>
        p.authorId === author.id ||
        p.customAuthor?.name === author.name ||
        p.customAuthor?.name === author.nameHi ||
        (p as any).authorName === author.name ||
        (p as any).authorName === author.nameHi
    );
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const queryKey = author.nameHi || author.name || author.slug || author.id;
    getAuthorArticles(queryKey)
      .then((fetched) => {
        if (isMounted) {
          if (fetched && fetched.length > 0) {
            setAuthorPosts(fetched);
          }
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [author.id, author.slug, author.name, author.nameHi]);

  const displayPosts = authorPosts;
  const popularPosts = [...displayPosts].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
  const trendingRanking = [...getStoredPosts()].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0)).slice(0, 5);

  return (
    <div className="bg-canvas min-h-screen">
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: onNavigateHome },
          { label: isHindi ? 'पत्रकार एवं स्तंभकार' : 'Journalists & Columnists', onClick: () => onNavigateHome() },
          { label: displayName, isActive: true },
        ]}
      />

      <main className="max-w-site mx-auto px-4 py-8">
        {/* Author Bio Header Card */}
        <section aria-label="Journalist Biography" className="bg-surface-lowest border border-border-subtle p-6 sm:p-8 rounded-sm shadow-subtle mb-10">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <img
              src={getAuthorAvatarUrl(author.avatar)}
              alt={displayName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-surface-container flex-shrink-0"
              onError={handleAvatarError}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
                  {displayName}
                </h1>
                {author.verified && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>{isHindi ? 'सत्यापित संपादकीय सदस्य' : 'Verified Editorial Staff'}</span>
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm font-semibold text-secondary mb-3">
                {displayRole} • NP News Metro
              </p>

              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed mb-4 max-w-2xl">
                {displayBio}
              </p>

              {/* Beats & Editorial Contact Links */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border-subtle text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold uppercase tracking-wider text-ink-muted text-[11px]">
                    {isHindi ? 'विशेषज्ञता/बीट्स:' : 'Beats:'}
                  </span>
                  {author.beats.map((beat, i) => (
                    <span
                      key={i}
                      className="bg-surface-container text-ink px-2.5 py-1 rounded-sm border border-border-subtle font-medium text-[11px]"
                    >
                      {beat}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-ink-secondary">
                  {author.social.twitter && (
                    <a
                      href={`https://twitter.com/${author.social.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <Twitter className="w-3.5 h-3.5" />
                      <span>@{author.social.twitter}</span>
                    </a>
                  )}
                  {author.social.email && (
                    <a
                      href={`mailto:${author.social.email}`}
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'पत्रकार को ईमेल करें' : 'Email Journalist'}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 12-Col Layout: Author Articles Tabs (8 cols) + Right Rail (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tabs */}
            <div className="flex items-center gap-4 border-b-2 border-primary pb-2 text-xs font-bold uppercase tracking-wider">
              <button
                onClick={() => setActiveTab('latest')}
                className={`pb-1 transition-colors ${
                  activeTab === 'latest'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {isHindi ? `हालिया प्रकाशित लेख (${displayPosts.length})` : `Latest Published Stories (${displayPosts.length})`}
              </button>
              <button
                onClick={() => setActiveTab('popular')}
                className={`pb-1 transition-colors ${
                  activeTab === 'popular'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {isHindi ? 'सर्वाधिक पढ़े गए लेख' : 'Most Read Articles'}
              </button>
            </div>

            {/* List */}
            <div className="space-y-4">
              {isLoading && displayPosts.length === 0 ? (
                <div className="py-16 text-center text-ink-muted bg-surface-lowest border border-border-subtle rounded-sm">
                  <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-sm">{isHindi ? 'लेख लोड हो रहे हैं...' : 'Loading published stories...'}</p>
                </div>
              ) : displayPosts.length === 0 ? (
                <div className="py-16 text-center bg-surface-lowest border border-border-subtle rounded-sm p-8 text-ink-muted">
                  <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-40 text-primary" />
                  <p className="text-sm font-medium text-ink">
                    {isHindi
                      ? 'इस लेखक के लिए अभी कोई प्रकाशित लेख उपलब्ध नहीं हैं।'
                      : 'No published stories found for this author yet.'}
                  </p>
                </div>
              ) : (
                (activeTab === 'latest' ? displayPosts : popularPosts).map((post) => (
                  <HorizontalStoryCard
                    key={post.id}
                    post={post}
                    onSelect={onSelectPost}
                    onSelectCategory={onSelectCategory}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right Rail Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <AdSlot zone="A3" />

            <div className="bg-surface-lowest border border-border-subtle p-4 rounded-sm shadow-subtle">
              <div className="flex items-center justify-between pb-2 border-b-2 border-secondary mb-3">
                <h3 className="font-serif text-base font-bold text-ink flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-secondary" />
                  <span>{isHindi ? 'सभी डेस्कों पर ट्रेंडिंग' : 'Trending Across Desks'}</span>
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
