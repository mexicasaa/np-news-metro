import React from 'react';
import { Quote, Feather, ShieldCheck, Flame, BookOpen, ArrowRight } from 'lucide-react';
import { WpPost } from '../types/wordpress';
import { mockPosts, mockAuthors, getLocalizedPost } from '../data/mockWpData';
import { ArticleBody } from '../components/article/ArticleBody';
import { ArticleShareBar } from '../components/article/ArticleShareBar';
import { AuthorBioBox } from '../components/article/AuthorBioBox';
import { RelatedStoriesBlock } from '../components/article/RelatedStoriesBlock';
import { RankingItem } from '../components/cards/RankingItem';
import { AdSlot } from '../components/commercial/AdSlot';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { useLanguage } from '../context/LanguageContext';
import { getAuthorAvatarUrl, getOptimizedImageUrl } from '../utils/imageFallback';

interface OpinionArticleTemplateProps {
  post: WpPost;
  onSelectPost: (post: WpPost) => void;
  onNavigateHome: () => void;
  onSelectCategory: (category: string) => void;
  onSelectAuthor: (authorId: string) => void;
}

export const OpinionArticleTemplate: React.FC<OpinionArticleTemplateProps> = ({
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
    role: post.customAuthor.role || 'Columnist & Contributor',
    avatar: getAuthorAvatarUrl(post.customAuthor.avatar),
    bio: `${post.customAuthor.name} writes opinions and analytical columns for NP News Metro.`,
    twitter: '',
    email: '',
    beats: ['Opinion & Analysis'],
    social: {},
    verified: false,
    slug: 'guest'
  } : (post.authorId && mockAuthors[post.authorId] ? {
    ...mockAuthors[post.authorId],
    avatar: getAuthorAvatarUrl(mockAuthors[post.authorId].avatar),
  } : (mockAuthors['author-4'] ? {
    ...mockAuthors['author-4'],
    avatar: getAuthorAvatarUrl(mockAuthors['author-4'].avatar),
  } : {
    id: 'staff-author',
    name: isHindi ? 'संपादकीय विचार मंच' : 'NP Editorial Board',
    slug: 'author',
    role: isHindi ? 'संपादकीय लेखक' : 'Opinion Columnist',
    avatar: getAuthorAvatarUrl(null),
    bio: 'NP News Metro Opinion Desk.',
    verified: true,
    beats: ['Opinion & Analysis'],
    social: {}
  }));
  const otherOpinions = mockPosts.filter((p) => p.id !== post.id && (p.isOpinion || p.category === 'opinion'));
  const trendingRanking = [...mockPosts].sort((a, b) => b.viewsCount - a.viewsCount).slice(0, 5);

  return (
    <div className="bg-canvas min-h-screen">
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: onNavigateHome },
          { label: isHindi ? 'विचार एवं विश्लेषण' : 'Opinion & Analysis', onClick: () => onSelectCategory('opinion') },
          { label: localized.title, isActive: true },
        ]}
      />

      <main className="max-w-site mx-auto px-4 py-8">
        {/* Columnist Hero Header */}
        <header className="max-w-reading mx-auto mb-10 text-center pb-8 border-b-2 border-primary">
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary font-bold uppercase tracking-widest text-xs px-3 py-1 rounded-sm border border-secondary/30 mb-4">
            <Feather className="w-3.5 h-3.5" />
            <span>{isHindi ? 'संपादकीय स्तंभ' : 'Ethos Chronicle Column'}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[46px] font-bold text-ink leading-[1.18] tracking-tight mb-6">
            “{localized.title}”
          </h1>

          <p className="text-base sm:text-lg text-ink-secondary leading-relaxed max-w-xl mx-auto mb-8 font-serif italic">
            {localized.dek}
          </p>

          {/* Author Prominent Portrait & Bylines */}
          <div className="inline-flex flex-col items-center">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-surface-lowest shadow-md mb-3"
            />
            <button
              onClick={() => onSelectAuthor(author.id)}
              className="font-serif text-xl font-bold text-ink hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <span>{author.name}</span>
              {author.verified && <ShieldCheck className="w-4 h-4 text-emerald-700" />}
            </button>
            <p className="text-xs font-semibold text-secondary mt-0.5">{author.role}</p>
            <p className="text-[11px] text-ink-muted mt-1">
              {isHindi ? `नई दिल्ली से प्रकाशित • ${localized.readTime.replace('min read', 'मिनट')}` : `Published in New Delhi • ${post.readTime}`}
            </p>
          </div>
        </header>

        {/* 12-Col Layout: Centered Reading Column (8 cols) + Right Rail (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-site mx-auto">
          {/* Main Article Body */}
          <article className="lg:col-span-8 max-w-reading">
            <ArticleShareBar
              post={post}
              title={localized.title}
              featuredImage={localized.featuredImage}
              summary={localized.dek}
              category={post.category}
              commentCount={post.commentCount}
            />

            {/* Optional Lead Visual */}
            {localized.featuredImage && (
              <figure className="my-6">
                <div className="aspect-[16/9] w-full overflow-hidden rounded-sm bg-surface-container border border-border-subtle">
                  <img
                    src={getOptimizedImageUrl(localized.featuredImage, 1200)}
                    alt={localized.imageAlt || localized.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                <figcaption className="text-xs text-ink-muted mt-2 flex items-center justify-between">
                  <span>{isHindi && post.imageCaptionHi ? post.imageCaptionHi : post.imageCaption}</span>
                  <span className="font-semibold text-ink-secondary">{post.imageCredit}</span>
                </figcaption>
              </figure>
            )}

            {/* Article Gutenberg Blocks */}
            <ArticleBody post={post} />

            {/* Author Bio Box */}
            <AuthorBioBox
              author={author}
              onViewAuthorProfile={onSelectAuthor}
            />

            {/* Related Opinion Stories */}
            <RelatedStoriesBlock
              relatedPosts={otherOpinions.length > 0 ? otherOpinions : mockPosts.slice(2, 5)}
              onSelectPost={onSelectPost}
              onSelectCategory={onSelectCategory}
              title={isHindi ? 'अन्य संपादकीय विचार एवं विश्लेषण' : 'More Thought & Editorial Analysis'}
            />
          </article>

          {/* Right Rail Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <AdSlot zone="A3" />

            <div className="bg-surface-lowest border border-border-subtle p-4 rounded-sm shadow-subtle">
              <div className="flex items-center justify-between pb-2 border-b-2 border-secondary mb-3">
                <h3 className="font-serif text-base font-bold text-ink flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-secondary" />
                  <span>{isHindi ? 'लोकप्रिय स्तंभ' : 'Popular Columns'}</span>
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
