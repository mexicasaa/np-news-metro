import React from 'react';
import { Clock } from 'lucide-react';
import { WpPost } from '../../types/wordpress';
import { handleImageError } from '../../utils/imageFallback';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedPost } from '../../data/mockWpData';

interface RankingItemProps {
  rank?: number;
  post: WpPost;
  onSelect: (post: WpPost) => void;
  showMetrics?: boolean;
}

export const RankingItem: React.FC<RankingItemProps> = ({
  post,
  onSelect,
}) => {
  const { language, isHindi } = useLanguage();
  const localized = getLocalizedPost(post, language);

  return (
    <article
      onClick={() => onSelect(post)}
      className="group p-4 sm:p-4.5 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4 cursor-pointer"
    >
      {/* Story Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Category & Read Time */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <span className="text-amber-800 font-extrabold">{localized.category}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 normal-case font-medium flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{isHindi ? localized.readTime.replace('min read', 'मिनट') : localized.readTime}</span>
          </span>
        </div>

        {/* Headline */}
        <h4 className="font-serif text-base sm:text-[16px] font-bold text-slate-950 leading-snug group-hover:text-red-700 transition-colors line-clamp-2">
          <a
            href={`/${post.category || 'india'}/${post.slug}`}
            onClick={(e) => {
              e.preventDefault();
              onSelect(post);
            }}
            className="text-inherit hover:text-red-700 no-underline block"
          >
            {localized.title}
          </a>
        </h4>
      </div>

      {/* Mini Thumbnail */}
      {post.featuredImage && (
        <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 flex-shrink-0 shadow-3xs">
          <img
            src={localized.featuredImage}
            alt={localized.imageAlt || localized.title}
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}
    </article>
  );
};
