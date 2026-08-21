import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { WpPost } from '../../types/wordpress';
import { mockAuthors, getLocalizedPost } from '../../data/mockWpData';
import { handleImageError } from '../../utils/imageFallback';
import { useLanguage } from '../../context/LanguageContext';

interface LargeStoryCardProps {
  post: WpPost;
  onSelect: (post: WpPost) => void;
  onSelectCategory?: (category: string) => void;
}

export const LargeStoryCard: React.FC<LargeStoryCardProps> = ({
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
      className="group bg-surface-lowest border border-border-subtle hover:border-slate-300 rounded-md overflow-hidden transition-all duration-300 flex flex-col justify-between h-full shadow-xs hover:shadow-md cursor-pointer"
    >
      <div>
        {/* Aspect 16:9 Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
          <img
            src={localized.featuredImage}
            alt={localized.imageAlt || localized.title}
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Breaking Badge Overlay */}
          {post.isBreaking && (
            <span className="absolute top-2.5 left-2.5 bg-editorial-red text-white px-2.5 py-0.5 rounded-xs text-[10px] font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              <span>{t.breaking}</span>
            </span>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-5">
          {/* Category & Read Time */}
          <div className="flex items-center gap-2 mb-2 text-[11px]">
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
            <span className="text-slate-500 flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{isHindi ? localized.readTime.replace('min read', 'मिनट') : localized.readTime}</span>
            </span>
          </div>

          {/* Headline */}
          <h3 className="font-serif text-lg sm:text-[19px] font-bold text-slate-900 leading-snug group-hover:text-editorial-red transition-colors line-clamp-2 mb-2">
            {localized.title}
          </h3>

          {/* Dek Excerpt */}
          <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed line-clamp-2">
            {localized.dek}
          </p>
        </div>
      </div>

      {/* Card Footer: Author Byline & Arrow */}
      <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-auto">
        <div className="flex items-center gap-2">
          {author?.avatar ? (
            <img
              src={author.avatar}
              alt={author.name}
              className="w-5 h-5 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600">
              NP
            </span>
          )}
          <span className="font-medium text-slate-700">{author ? author.name : t.npNewsDesk}</span>
        </div>

        <span className="text-[11px] font-semibold text-primary group-hover:text-editorial-red flex items-center gap-1 transition-colors">
          <span>{t.readStory}</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </article>
  );
};
