import React from 'react';
import { WpPost } from '../../types/wordpress';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedPost } from '../../data/mockWpData';

interface RankingItemProps {
  rank: number;
  post: WpPost;
  onSelect: (post: WpPost) => void;
  showMetrics?: boolean;
}

export const RankingItem: React.FC<RankingItemProps> = ({
  rank,
  post,
  onSelect,
}) => {
  const { language, isHindi } = useLanguage();
  const localized = getLocalizedPost(post, language);

  return (
    <article
      onClick={() => onSelect(post)}
      className="group py-3.5 px-3.5 sm:px-4 hover:bg-slate-50/80 rounded-sm cursor-pointer transition-colors flex items-start gap-3.5 sm:gap-4"
    >
      {/* Elegant Large Serif Rank Number */}
      <span className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-300 group-hover:text-primary leading-none w-6 sm:w-7 flex-shrink-0 pt-0.5 transition-colors">
        {rank}
      </span>

      {/* Story Content */}
      <div className="flex-1 min-w-0">
        {/* Category & Read Time */}
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1">
          <span className="text-secondary hover:underline">{localized.category}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 normal-case font-medium">
            {isHindi ? localized.readTime.replace('min read', 'मिनट') : localized.readTime}
          </span>
        </div>

        {/* Headline */}
        <h4 className="font-serif text-sm sm:text-[15px] font-bold text-slate-900 leading-snug group-hover:text-editorial-red transition-colors line-clamp-2">
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
      </div>
    </article>
  );
};
