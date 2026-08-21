import React from 'react';
import { Clock, Calendar, ShieldCheck, Share2, Bookmark, Printer, MessageSquare, AlertCircle } from 'lucide-react';
import { WpPost } from '../../types/wordpress';
import { mockAuthors, getLocalizedPost } from '../../data/mockWpData';
import { useLanguage } from '../../context/LanguageContext';

interface ArticleHeaderProps {
  post: WpPost;
  onSelectAuthor?: (authorId: string) => void;
  onSelectCategory?: (category: string) => void;
  onOpenComments?: () => void;
}

export const ArticleHeader: React.FC<ArticleHeaderProps> = ({
  post,
  onSelectAuthor,
  onSelectCategory,
  onOpenComments,
}) => {
  const { language, t, isHindi } = useLanguage();
  const localized = getLocalizedPost(post, language);
  const author = mockAuthors[post.authorId];

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) + (isHindi ? ' भारतीय मानक समय (IST)' : ' IST');
    } catch {
      return dateStr;
    }
  };

  return (
    <header className="mb-6">
      {/* Category Pill & Badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button
          onClick={() => onSelectCategory?.(post.category)}
          className="bg-secondary/10 hover:bg-secondary/20 text-secondary font-bold uppercase tracking-wider text-xs px-2.5 py-1 rounded-sm border border-secondary/30 transition-colors"
        >
          {localized.category}
        </button>

        {post.isBreaking && (
          <span className="bg-editorial-red text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span>{isHindi ? 'ब्रेकिंग रिपोर्ट' : 'Breaking Report'}</span>
          </span>
        )}

        {post.isOpinion && (
          <span className="bg-primary text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm">
            {isHindi ? 'संपादकीय विचार' : 'Editorial Opinion'}
          </span>
        )}

        <span className="text-border-strong">•</span>

        <span className="text-xs text-ink-muted flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-ink-muted" />
          <span>{isHindi ? localized.readTime.replace('min read', 'मिनट') : localized.readTime}</span>
        </span>
      </div>

      {/* Primary Headline (Playfair Display) */}
      <h1 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold text-ink leading-[1.18] tracking-tight mb-4">
        {localized.title}
      </h1>

      {/* Subheadline / Dek */}
      {localized.dek && (
        <p className="text-base sm:text-lg text-ink-secondary leading-relaxed font-normal mb-6">
          {localized.dek}
        </p>
      )}

      {/* Author Byline & Publication Timestamps Bar */}
      <div className="pt-4 pb-4 border-y border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Author info */}
        {author ? (
          <div className="flex items-center gap-3">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-11 h-11 rounded-full object-cover border border-border-subtle cursor-pointer"
              onClick={() => onSelectAuthor?.(author.id)}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onSelectAuthor?.(author.id)}
                  className="font-bold text-ink hover:text-primary transition-colors text-sm hover:underline"
                >
                  {author.name}
                </button>
                {author.verified && (
                  <span title={isHindi ? 'सत्यापित संपादकीय सदस्य' : 'Verified Editorial Staff'}>
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-muted">{author.role}</p>
            </div>
          </div>
        ) : (
          <div className="text-xs text-ink-muted">
            <span className="font-bold text-ink">{isHindi ? 'एनपी न्यूज़ मेट्रो ब्यूरो' : 'NP News Metro Bureau'}</span>
          </div>
        )}

        {/* Timestamps */}
        <div className="text-xs text-ink-muted sm:text-right space-y-0.5">
          <div className="flex items-center sm:justify-end gap-1.5 text-ink-secondary">
            <span className="font-semibold text-ink">{isHindi ? 'प्रकाशित:' : 'Published:'}</span>
            <span>{formatDateTime(post.publishedAt)}</span>
          </div>
          {post.updatedAt && (
            <div className="flex items-center sm:justify-end gap-1.5 text-editorial-red font-medium">
              <span>{isHindi ? 'अपडेट किया गया:' : 'Updated:'}</span>
              <span>{formatDateTime(post.updatedAt)}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
