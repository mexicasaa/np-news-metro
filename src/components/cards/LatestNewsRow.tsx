import React from 'react';
import { Clock, Share2, ArrowRight } from 'lucide-react';
import { WpPost } from '../../types/wordpress';
import { handleImageError, getAuthorAvatarUrl, handleAvatarError } from '../../utils/imageFallback';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedPost, mockAuthors } from '../../data/mockWpData';

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

  const author = post.customAuthor?.name ? {
    name: post.customAuthor.name,
    avatar: getAuthorAvatarUrl(post.customAuthor.avatar),
  } : (post.authorId && mockAuthors[post.authorId] ? {
    name: mockAuthors[post.authorId].name,
    avatar: getAuthorAvatarUrl(mockAuthors[post.authorId].avatar),
  } : {
    name: isHindi ? 'एनपी ब्यूरो' : 'NP Bureau',
    avatar: '/logo-circle.png',
  });

  return (
    <article
      onClick={() => onSelect(post)}
      className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer h-full"
    >
      <div>
        {/* 1. Top Image */}
        {showThumbnail && (
          <a
            href={`/${post.category || 'india'}/${post.slug}`}
            onClick={(e) => {
              e.preventDefault();
              onSelect(post);
            }}
            className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 block"
          >
            <img
              src={localized.featuredImage}
              alt={localized.imageAlt || localized.title}
              onError={handleImageError}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {post.isBreaking && (
              <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-md shadow-sm">
                {isHindi ? 'लाइव' : 'Live'}
              </span>
            )}
          </a>
        )}

        {/* 2. Content */}
        <div className="p-4 sm:p-5 space-y-2.5">
          {/* Category & Read Time */}
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <span className="text-amber-800 font-extrabold">{localized.category}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 normal-case font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{isHindi ? localized.readTime.replace('min read', 'मिनट') : localized.readTime}</span>
            </span>
          </div>

          {/* Headline */}
          <h3 className="font-serif text-base sm:text-[17px] font-bold text-slate-950 leading-snug group-hover:text-red-700 transition-colors line-clamp-2">
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
          </h3>

          {/* Dek / Summary */}
          {localized.dek && (
            <p className="text-xs sm:text-[13px] text-slate-600 line-clamp-2 leading-relaxed">
              {localized.dek}
            </p>
          )}
        </div>
      </div>

      {/* 3. Footer: Author & Read CTA */}
      <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 max-w-[60%]">
          <img
            src={author.avatar}
            alt={author.name}
            onError={handleAvatarError}
            className="w-5 h-5 rounded-full object-cover border border-slate-200 flex-shrink-0"
          />
          <span className="font-semibold text-slate-700 truncate">
            {author.name}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-600 group-hover:text-red-700 font-bold transition-colors">
          <Share2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="inline-flex items-center gap-0.5">
            <span>{isHindi ? 'पढ़ें' : 'Read'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </article>
  );
};
