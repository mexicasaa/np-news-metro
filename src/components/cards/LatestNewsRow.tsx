import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { WpPost } from '../../types/wordpress';
import { handleImageError } from '../../utils/imageFallback';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedPost } from '../../data/mockWpData';

interface LatestNewsRowProps {
  post: WpPost;
  onSelect: (post: WpPost) => void;
  showThumbnail?: boolean;
}

export const LatestNewsRow: React.FC<LatestNewsRowProps> = ({
  post,
  onSelect,
  showThumbnail = true,
}) => {
  const { language, isHindi } = useLanguage();
  const localized = getLocalizedPost(post, language);

  // Format publish time (e.g. 10:00 AM or 15m ago)
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString(isHindi ? 'hi-IN' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isHindi ? 'अभी-अभी' : 'Just now';
    }
  };

  return (
    <article
      onClick={() => onSelect(post)}
      className="group p-3 sm:p-4 hover:bg-slate-50/80 rounded-md cursor-pointer transition-all duration-200 flex items-start justify-between gap-3 sm:gap-4"
    >
      {/* Text Content */}
      <div className="flex-1 min-w-0">
        {/* Meta Bar: Time + Category */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-primary bg-slate-100 px-2 py-0.5 rounded-xs">
            <Clock className="w-2.5 h-2.5 text-slate-500" />
            <span>{formatTime(post.publishedAt)}</span>
          </span>

          <span className="text-[10px] font-extrabold uppercase tracking-wider text-secondary bg-secondary/10 px-2 py-0.5 rounded-xs">
            {localized.category}
          </span>
        </div>

        {/* Headline */}
        <h4 className="font-serif text-sm sm:text-base font-bold text-ink leading-snug group-hover:text-editorial-red transition-colors line-clamp-2 mb-1">
          <a
            href={`/${post.category || 'india'}/${post.slug}`}
            onClick={(e) => {
              e.preventDefault();
              onSelect(post);
            }}
            className="text-inherit hover:text-editorial-red no-underline block"
          >
            {localized.title}
          </a>
        </h4>

        {/* Snippet Dek */}
        <p className="text-xs text-ink-muted line-clamp-1 leading-relaxed hidden sm:block">
          {localized.dek}
        </p>
      </div>

      {/* Thumbnail with clean aspect ratio */}
      {showThumbnail && (
        <a
          href={`/${post.category || 'india'}/${post.slug}`}
          onClick={(e) => {
            e.preventDefault();
            onSelect(post);
          }}
          className="relative w-20 h-16 sm:w-24 sm:h-20 flex-shrink-0 rounded-md overflow-hidden bg-surface-container border border-border-subtle shadow-2xs ml-1 block"
        >
          <img
            src={localized.featuredImage}
            alt={localized.imageAlt || localized.title}
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </a>
      )}
    </article>
  );
};
