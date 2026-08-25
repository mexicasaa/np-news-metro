import React from 'react';
import { ShieldCheck, ArrowRight, Twitter, Linkedin, Mail } from 'lucide-react';
import { WpAuthor } from '../../types/wordpress';
import { useLanguage } from '../../context/LanguageContext';
import { getAuthorAvatarUrl, handleAvatarError } from '../../utils/imageFallback';

interface AuthorCardProps {
  author: WpAuthor;
  onSelect: (authorId: string) => void;
}

export const AuthorCard: React.FC<AuthorCardProps> = ({
  author,
  onSelect,
}) => {
  const { isHindi } = useLanguage();

  return (
    <div className="bg-surface-lowest border border-border-subtle p-5 rounded-sm shadow-subtle flex flex-col sm:flex-row gap-4 items-start">
      <img
        src={getAuthorAvatarUrl(author.avatar)}
        alt={author.name}
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-border-subtle flex-shrink-0"
        onError={handleAvatarError}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3
            onClick={() => onSelect(author.id)}
            className="font-serif text-lg font-bold text-ink hover:text-primary cursor-pointer transition-colors"
          >
            {author.name}
          </h3>
          {author.verified && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-sm" title={isHindi ? 'सत्यापित संपादकीय सदस्य' : 'Verified Editorial Staff'}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isHindi ? 'सत्यापित' : 'Verified'}</span>
            </span>
          )}
        </div>

        <p className="text-xs font-semibold text-secondary mb-2">
          {author.role}
        </p>

        <p className="text-xs text-ink-secondary leading-relaxed mb-3 line-clamp-2">
          {author.bio}
        </p>

        {/* Beats tags & Action link */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border-subtle text-xs">
          <div className="flex flex-wrap gap-1">
            {author.beats.map((beat, i) => (
              <span
                key={i}
                className="bg-surface-container text-ink-secondary px-2 py-0.5 rounded-sm text-[10px] font-medium border border-border-subtle"
              >
                {beat}
              </span>
            ))}
          </div>

          <button
            onClick={() => onSelect(author.id)}
            className="text-primary hover:text-primary-container font-semibold text-xs flex items-center gap-1 group"
          >
            <span>{isHindi ? 'लेख देखें' : 'View Articles'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
