import React, { useState } from 'react';
import { Clock, ArrowRight, Share2 } from 'lucide-react';
import { WpPost } from '../../types/wordpress';
import { mockAuthors, getLocalizedPost } from '../../data/mockWpData';
import { handleImageError, getAuthorAvatarUrl, getOptimizedImageUrl } from '../../utils/imageFallback';
import { useLanguage } from '../../context/LanguageContext';
import { ShareModal } from '../article/ShareModal';
import { getCanonicalArticleUrl } from '../../utils/shareUtils';

interface LargeStoryCardProps {
  post: WpPost;
  onSelect: (post: WpPost) => void;
  onSelectCategory?: (category: string) => void;
  onSelectAuthor?: (authorId: string) => void;
}

export const LargeStoryCard: React.FC<LargeStoryCardProps> = ({
  post,
  onSelect,
  onSelectCategory,
  onSelectAuthor,
}) => {
  const { language, t, isHindi } = useLanguage();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const localized = getLocalizedPost(post, language);
  const author = post.customAuthor?.name ? {
    id: 'guest',
    name: post.customAuthor.name,
    role: post.customAuthor.role || 'Guest Contributor',
    avatar: getAuthorAvatarUrl(post.customAuthor.avatar)
  } : (post.authorId && mockAuthors[post.authorId] ? {
    ...mockAuthors[post.authorId],
    avatar: getAuthorAvatarUrl(mockAuthors[post.authorId].avatar)
  } : null);

  return (
    <article 
      onClick={() => onSelect(post)}
      className="group bg-surface-lowest border border-border-subtle hover:border-slate-300 rounded-md overflow-hidden transition-all duration-300 flex flex-col justify-between h-full shadow-xs hover:shadow-md cursor-pointer"
    >
      <div>
        {/* Aspect 16:9 Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
          <img
            src={getOptimizedImageUrl(localized.featuredImage, 800)}
            alt={localized.imageAlt || localized.title}
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            decoding="async"
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
          </h3>

          {/* Dek Excerpt */}
          <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed line-clamp-2">
            {localized.dek}
          </p>
        </div>
      </div>

      {/* Card Footer: Author Byline, Share & Arrow */}
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

        <div className="flex items-center gap-2.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsShareModalOpen(true);
            }}
            className="p-1 rounded text-slate-400 hover:text-primary hover:bg-slate-100 transition-colors"
            title={isHindi ? 'फोटो सहित शेयर करें' : 'Share story with photo'}
            aria-label="Share story"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <a
            href={`/${post.category || 'india'}/${post.slug}`}
            onClick={(e) => {
              e.preventDefault();
              onSelect(post);
            }}
            className="text-[11px] font-semibold text-primary group-hover:text-editorial-red flex items-center gap-1 transition-colors no-underline cursor-pointer"
          >
            <span>{t.readStory}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>

      {/* Share Modal with Featured Image Preview */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={localized.title}
        url={getCanonicalArticleUrl(post.category, post.slug)}
        imageUrl={localized.featuredImage}
        summary={localized.dek}
        category={post.category}
      />
    </article>
  );
};
