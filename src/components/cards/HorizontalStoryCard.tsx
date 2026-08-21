import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { WpPost } from '../../types/wordpress';
import { mockAuthors, getLocalizedPost } from '../../data/mockWpData';
import { handleImageError } from '../../utils/imageFallback';
import { useLanguage } from '../../context/LanguageContext';

interface HorizontalStoryCardProps {
  post: WpPost;
  onSelect: (post: WpPost) => void;
  onSelectCategory?: (category: string) => void;
}

export const HorizontalStoryCard: React.FC<HorizontalStoryCardProps> = ({
  post,
  onSelect,
  onSelectCategory,
}) => {
  const { language, t, isHindi } = useLanguage();
  const localized = getLocalizedPost(post, language);
  const author = mockAuthors[post.authorId];

  return (
    <article 
      onClick={() => onSelect(post)}
      className="group bg-surface-lowest border border-border-subtle hover:border-slate-300 rounded-md p-3.5 sm:p-4 transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer flex flex-col sm:flex-row items-start gap-4"
    >
      {/* Left Image */}
      <div className="relative w-full sm:w-44 md:w-48 aspect-[16/10] sm:aspect-[4/3] overflow-hidden bg-slate-950 rounded-sm flex-shrink-0">
        <img
          src={localized.featuredImage}
          alt={localized.imageAlt || localized.title}
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {post.isBreaking && (
          <span className="absolute top-2 left-2 bg-editorial-red text-white px-2 py-0.5 rounded-xs text-[9px] font-extrabold uppercase tracking-wider">
            {t.breaking}
          </span>
        )}
      </div>

      {/* Right Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
        <div>
          {/* Category & Read Time */}
          <div className="flex items-center gap-2 mb-1.5 text-[11px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectCategory?.(post.category);
              }}
              className="text-secondary font-extrabold uppercase tracking-wider hover:underline"
            >
              {localized.category}
            </button>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 text-xs flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{isHindi ? localized.readTime.replace('min read', 'मिनट') : localized.readTime}</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-editorial-red transition-colors line-clamp-2 mb-1.5">
            {localized.title}
          </h3>

          {/* Dek */}
          <p className="text-xs sm:text-[13px] text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {localized.dek}
          </p>
        </div>

        {/* Footer: Author & Read link */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 mt-auto">
          <span className="font-medium text-slate-700">
            {author ? `${isHindi ? 'लेखक: ' : 'By '}${author.name}` : t.npNewsDesk}
          </span>
          <span className="text-[11px] font-semibold text-primary group-hover:text-editorial-red flex items-center gap-1 transition-colors">
            <span>{t.readStory}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </article>
  );
};
