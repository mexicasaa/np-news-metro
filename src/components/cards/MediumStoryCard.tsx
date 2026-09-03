import React from 'react';
import { Clock } from 'lucide-react';
import { WpPost } from '../../types/wordpress';
import { handleImageError, getOptimizedImageUrl } from '../../utils/imageFallback';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedPost } from '../../data/mockWpData';

interface MediumStoryCardProps {
  post: WpPost;
  onSelect: (post: WpPost) => void;
  onSelectCategory?: (category: string) => void;
  showImage?: boolean;
}

export const MediumStoryCard: React.FC<MediumStoryCardProps> = ({
  post,
  onSelect,
  onSelectCategory,
  showImage = true,
}) => {
  const { language, t, isHindi } = useLanguage();
  const localized = getLocalizedPost(post, language);

  return (
    <article className="group bg-surface-lowest border border-border-subtle p-3.5 rounded-sm hover:border-border-strong transition-all flex flex-col justify-between h-full shadow-subtle">
      <div>
        {showImage && (
          <a
            href={`/${post.category || 'india'}/${post.slug}`}
            className="relative aspect-[16/10] w-full overflow-hidden bg-surface-container mb-2.5 cursor-pointer block"
            onClick={(e) => {
              e.preventDefault();
              onSelect(post);
            }}
          >
            <img
              src={getOptimizedImageUrl(localized.featuredImage, 600)}
              alt={localized.imageAlt || localized.title}
              onError={handleImageError}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              loading="lazy"
              decoding="async"
            />
          </a>
        )}

        <div className="flex items-center gap-1.5 mb-1 text-[11px]">
          <button
            onClick={() => onSelectCategory?.(post.category)}
            className="text-secondary font-bold uppercase tracking-wider hover:text-primary transition-colors text-[10px]"
          >
            {localized.category}
          </button>
          <span className="text-border-strong">•</span>
          <span className="text-ink-muted text-[10px]">
            {isHindi ? localized.readTime.replace('min read', 'मिनट') : localized.readTime}
          </span>
        </div>

        <h4 className="font-serif text-base font-bold text-ink leading-snug group-hover:text-primary transition-colors line-clamp-3 mb-1.5">
          <a
            href={`/${post.category || 'india'}/${post.slug}`}
            onClick={(e) => {
              e.preventDefault();
              onSelect(post);
            }}
            className="text-inherit hover:text-primary no-underline block"
          >
            {localized.title}
          </a>
        </h4>
      </div>

      <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-ink-muted mt-2">
        <span className="truncate max-w-[140px]">
          {post.authorId ? (isHindi ? 'एनपी ब्यूरो' : 'NP Bureau') : (isHindi ? 'संवाददाता' : 'Staff Reporter')}
        </span>
        <span>{isHindi ? localized.readTime.replace('min read', 'मिनट') : localized.readTime}</span>
      </div>
    </article>
  );
};
