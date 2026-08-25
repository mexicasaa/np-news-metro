import React, { useState } from 'react';
import { Clock, User, ShieldCheck, Flame, MessageSquare, AlertCircle, Share2, ExternalLink } from 'lucide-react';
import { WpPost } from '../types/wordpress';
import { mockPosts, mockAuthors, getLocalizedPost } from '../data/mockWpData';
import { handleImageError } from '../utils/imageFallback';
import { ArticleHeader } from '../components/article/ArticleHeader';
import { ArticleBody } from '../components/article/ArticleBody';
import { ArticleShareBar } from '../components/article/ArticleShareBar';
import { AuthorBioBox } from '../components/article/AuthorBioBox';
import { CorrectionNotice } from '../components/article/CorrectionNotice';
import { RelatedStoriesBlock } from '../components/article/RelatedStoriesBlock';
import { RankingItem } from '../components/cards/RankingItem';
import { AdSlot } from '../components/commercial/AdSlot';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { NewsletterModule } from '../components/common/NewsletterModule';
import { useLanguage } from '../context/LanguageContext';
import { getAuthorAvatarUrl } from '../utils/imageFallback';

interface StandardArticleTemplateProps {
  post: WpPost;
  onSelectPost: (post: WpPost) => void;
  onNavigateHome: () => void;
  onSelectCategory: (category: string) => void;
  onSelectAuthor: (authorId: string) => void;
  showCorrections?: boolean;
  showAds?: boolean;
}

export const StandardArticleTemplate: React.FC<StandardArticleTemplateProps> = ({
  post,
  onSelectPost,
  onNavigateHome,
  onSelectCategory,
  onSelectAuthor,
  showCorrections = true,
  showAds = false,
}) => {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const { language, t, isHindi } = useLanguage();
  const localized = getLocalizedPost(post, language);
  const author = post.customAuthor?.name ? {
    id: 'guest-author',
    name: post.customAuthor.name,
    slug: 'guest',
    role: post.customAuthor.role || (isHindi ? 'अतिथि लेखक / विशेष संवाददाता' : 'Guest Contributor / Wire Reporter'),
    avatar: getAuthorAvatarUrl(post.customAuthor.avatar),
    bio: `${post.customAuthor.name} is an external writer and contributor for NP News Metro.`,
    verified: false,
    beats: ['Guest Editorial'],
    social: {}
  } : (post.authorId && mockAuthors[post.authorId] ? {
    ...mockAuthors[post.authorId],
    avatar: getAuthorAvatarUrl(mockAuthors[post.authorId].avatar),
  } : {
    id: 'staff-author',
    name: isHindi ? 'एनपी न्यूज़ मेट्रो ब्यूरो' : 'NP News Metro Bureau',
    slug: 'author',
    role: isHindi ? 'संपादकीय डेस्क' : 'Editorial Desk',
    avatar: getAuthorAvatarUrl(null),
    bio: 'NP News Metro Bureau reporting team.',
    verified: true,
    beats: ['National News'],
    social: {}
  });
  const relatedPosts = mockPosts.filter((p) => p.id !== post.id && (p.category === post.category || p.tags.some(t => post.tags.includes(t))));
  const trendingRanking = [...mockPosts].sort((a, b) => b.viewsCount - a.viewsCount).slice(0, 5);

  return (
    <div className="bg-canvas min-h-screen">
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: onNavigateHome },
          { label: localized.category.toUpperCase(), onClick: () => onSelectCategory(post.category) },
          { label: localized.title, isActive: true },
        ]}
      />

      <main className="max-w-site mx-auto px-4 py-8">
        {/* 12-Col Layout: Main Article (8 cols / 760px) + Right Rail Sidebar (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Reading Column */}
          <article className="lg:col-span-8 max-w-reading">
            {/* Article Top Header */}
            <ArticleHeader
              post={post}
              onSelectAuthor={onSelectAuthor}
              onSelectCategory={onSelectCategory}
              onOpenComments={() => setCommentsOpen(!commentsOpen)}
            />

            {/* Social Share Bar with Featured Image */}
            <ArticleShareBar
              post={post}
              title={localized.title}
              featuredImage={localized.featuredImage}
              summary={localized.dek}
              category={post.category}
              commentCount={post.commentCount}
              onOpenComments={() => setCommentsOpen(!commentsOpen)}
            />

            {/* Google News Follow & Share Banner */}
            <div className="my-4 py-2.5 px-3.5 bg-surface-lowest border border-border-subtle rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-slate-400 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-ink leading-tight">
                    {isHindi ? 'गूगल न्यूज़ (Google News) पर NP News Metro को फॉलो करें' : 'Follow NP News Metro on Google News'}
                  </p>
                  <p className="text-[11px] text-ink-muted leading-tight">
                    {isHindi ? 'सभी ताज़ा ख़बरें और अपडेट्स सीधे गूगल पर पाएं' : 'Get the latest verified news and live updates directly on Google'}
                  </p>
                </div>
              </div>
              <a
                href={`https://news.google.com/search?q=${encodeURIComponent(localized.title + ' NP News Metro')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="self-start sm:self-auto px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-sm flex items-center gap-1.5 flex-shrink-0 transition-colors shadow-xs"
              >
                <span>{isHindi ? 'Google News पर पढ़ें' : 'Read on Google'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Hero Image with Caption and Photo Credit */}
            <figure className="my-6">
              <div className="aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-sm bg-surface-container border border-border-subtle shadow-subtle">
                <img
                  src={localized.featuredImage}
                  alt={localized.imageAlt || localized.title}
                  onError={handleImageError}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              <figcaption className="text-xs text-ink-muted mt-2 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="italic leading-snug">{isHindi && post.imageCaptionHi ? post.imageCaptionHi : post.imageCaption}</span>
                <span className="font-semibold text-ink-secondary flex-shrink-0">
                  {post.imageCredit}
                </span>
              </figcaption>
            </figure>

            {/* Editorial Correction Notice if active */}
            {showCorrections && post.correctionNote && (
              <CorrectionNotice
                date={post.correctionNote.date}
                text={post.correctionNote.text}
              />
            )}

            {/* Gutenberg Block-Driven Body */}
            <ArticleBody post={post} showAds={showAds} />

            {/* Tags / Topics Pill Bar */}
            <div className="my-8 pt-6 border-t border-border-subtle flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold text-ink uppercase tracking-wider text-[11px]">
                {isHindi ? 'संबंधित विषय:' : 'Topics:'}
              </span>
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-surface-container hover:bg-surface-high text-ink px-2.5 py-1 rounded-sm border border-border-subtle transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Author Biography Box */}
            {author && (
              <AuthorBioBox
                author={author}
                onViewAuthorProfile={onSelectAuthor}
              />
            )}

            {/* Comments Section (Optional/Moderated) */}
            <section className="my-8 pt-6 border-t border-border-subtle">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="font-serif text-xl font-bold text-ink">
                    {isHindi ? `पाठक चर्चा (${post.commentCount})` : `Reader Discussion (${post.commentCount})`}
                  </h3>
                </div>
                <button
                  onClick={() => setCommentsOpen(!commentsOpen)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {commentsOpen ? (isHindi ? 'चर्चा समेटें' : 'Collapse Discussion') : (isHindi ? 'चर्चा में भाग लें' : 'Join the Conversation')}
                </button>
              </div>

              {commentsOpen ? (
                <div className="bg-surface-lowest border border-border-subtle p-5 rounded-sm space-y-4">
                  <div className="p-3 bg-surface-container rounded text-xs text-ink-secondary">
                    <p className="font-bold text-ink mb-1">
                      {isHindi ? 'न्यूज़रूम टिप्पणी दिशानिर्देश:' : 'Newsroom Commenting Guidelines:'}
                    </p>
                    <p>
                      {isHindi
                        ? 'एनपी न्यूज़ मेट्रो सभ्य और तर्कसंगत बहस को प्रोत्साहित करता है। सभी टिप्पणियों की आचार संहिता के अनुसार समीक्षा की जाती है।'
                        : 'NP News Metro encourages reasoned civil debate. All comments are moderated in accordance with our Code of Conduct.'}
                    </p>
                  </div>
                  <textarea
                    rows={3}
                    placeholder={isHindi ? 'बहस में अपना दृष्टिकोण जोड़ें...' : 'Add your civil perspective to the debate...'}
                    className="w-full p-3 bg-canvas border border-border-subtle rounded text-xs focus:outline-hidden focus:border-primary"
                  />
                  <button
                    onClick={() => alert(isHindi ? 'टिप्पणी संपादकीय समीक्षा के लिए भेज दी गई है।' : 'Comment submitted for editorial moderation queue.')}
                    className="bg-primary text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-sm"
                  >
                    {isHindi ? 'समीक्षा हेतु प्रस्तुत करें' : 'Submit for Moderation'}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-ink-muted">
                  {isHindi
                    ? 'सभ्य और सार्थक संवाद बनाए रखने के लिए टिप्पणियों की हमारे संपादकीय सत्यनिष्ठा डेस्क द्वारा समीक्षा की जाती है।'
                    : 'Comments are moderated by our editorial integrity desk to maintain constructive civil discourse.'}
                </p>
              )}
            </section>

            {/* Related Coverage Block */}
            <RelatedStoriesBlock
              relatedPosts={relatedPosts}
              onSelectPost={onSelectPost}
              onSelectCategory={onSelectCategory}
            />
          </article>

          {/* Right Rail Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Sidebar Ad (A3) */}
            {showAds && <AdSlot zone="A3" />}

            {/* Most Read Ranking */}
            <div className="bg-surface-lowest border border-border-subtle p-4 rounded-sm shadow-subtle">
              <div className="flex items-center justify-between pb-2 border-b-2 border-secondary mb-3">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-secondary" />
                  <h3 className="font-serif text-base font-bold text-ink">
                    {isHindi ? 'सभी डेस्कों पर सर्वाधिक पढ़े गए' : 'Most Read Across Desks'}
                  </h3>
                </div>
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

            {/* Newsletter CTA Box in Sidebar */}
            <div className="bg-primary-container text-white p-5 rounded-sm border border-slate-700">
              <span className="text-[10px] uppercase font-bold text-secondary-gold tracking-widest block mb-1">
                {isHindi ? 'एनपी न्यूज़ मेट्रो ब्रीफिंग' : 'NP News Metro Briefing'}
              </span>
              <h4 className="font-serif text-lg font-bold text-white leading-snug mb-2">
                {isHindi ? 'कोई भी महत्वपूर्ण ख़बर न चूकें' : 'Never Miss a Developing Story'}
              </h4>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                {isHindi
                  ? 'सुबह की खुफिया रिपोर्ट और ब्रेकिंग न्यूज़ बुलेटिन सीधे व्हाट्सएप या ईमेल पर प्राप्त करें।'
                  : 'Get morning intelligence briefs and breaking news bulletins directly on WhatsApp or Email.'}
              </p>
              <button
                onClick={() => alert(isHindi ? 'न्यूज़लेटर सदस्यता फॉर्म खोला गया।' : 'Newsletter signup modal triggered.')}
                className="w-full bg-secondary-gold hover:bg-secondary text-white py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
              >
                {t.newsletterBtn}
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
