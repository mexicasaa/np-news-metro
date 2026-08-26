import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { WpPost } from '../../types/wordpress';
import { handleImageError } from '../../utils/imageFallback';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedPost } from '../../data/mockWpData';

interface CompactStoryCardProps {
  post: WpPost;
  onSelect: (post: WpPost) => void;
  showThumbnail?: boolean;
}

export const CompactStoryCard: React.FC<CompactStoryCardProps> = ({
  post,
  onSelect,
  showThumbnail = false,
}) => {
  const { language, t, isHindi } = useLanguage();
  const localized = getLocalizedPost(post, language);

  return (
    <article
      onClick={() => onSelect(post)}
      className="group p-2.5 sm:p-3 hover:bg-surface-container/60 rounded-md cursor-pointer transition-all duration-200 flex items-start gap-3.5"
    >
      {showThumbnail && (
        <a
          href={`/${post.category || 'india'}/${post.slug}`}
          onClick={(e) => {
            e.preventDefault();
            onSelect(post);
          }}
          className="relative w-20 h-20 sm:w-24 sm:h-20 flex-shrink-0 overflow-hidden rounded-md bg-surface-container border border-border-subtle shadow-2xs block"
        >
          <img
            src={localized.featuredImage}
            alt={localized.imageAlt || localized.title}
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {post.isBreaking && (
            <span className="absolute top-1 left-1 bg-editorial-red text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-2xs shadow-xs">
              {t.live}
            </span>
          )}
        </a>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-extrabold text-secondary tracking-wider mb-1">
          <span className="hover:underline">{localized.category}</span>
          <span className="text-border-strong">•</span>
          <span className="text-ink-muted normal-case font-medium flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />
            <span>{isHindi ? localized.readTime.replace('min read', 'मिनट') : localized.readTime}</span>
          </span>
        </div>
        
        <h5 className="font-serif text-xs sm:text-[13px] md:text-sm font-bold text-ink leading-snug group-hover:text-editorial-red transition-colors line-clamp-2">
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
        </h5>
      </div>
    </article>
  );
};
