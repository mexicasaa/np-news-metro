import React from 'react';
import { ShieldCheck, ArrowRight, Mail, Twitter, Linkedin } from 'lucide-react';
import { WpAuthor } from '../../types/wordpress';
import { useLanguage } from '../../context/LanguageContext';

interface AuthorBioBoxProps {
  author: WpAuthor;
  onViewAuthorProfile: (authorId: string) => void;
}

export const AuthorBioBox: React.FC<AuthorBioBoxProps> = ({
  author,
  onViewAuthorProfile,
}) => {
  const { t, isHindi } = useLanguage();

  return (
    <div className="my-10 p-6 bg-surface-lowest border border-border-subtle rounded-sm shadow-subtle flex flex-col sm:flex-row gap-5 items-start">
      <img
        src={author.avatar}
        alt={author.name}
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-border-subtle flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-[10px] uppercase font-bold text-ink-muted tracking-wider">
            {isHindi ? 'लेखक:' : 'Written by'}
          </span>
          <h3
            onClick={() => onViewAuthorProfile(author.id)}
            className="font-serif text-lg font-bold text-ink hover:text-primary cursor-pointer transition-colors"
          >
            {author.name}
          </h3>
          {author.verified && (
            <span title={isHindi ? 'सत्यापित संपादकीय सदस्य' : 'Verified Editorial Staff'}>
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
            </span>
          )}
        </div>

        <p className="text-xs font-semibold text-secondary mb-2">
          {author.role}
        </p>

        <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed mb-4">
          {author.bio}
        </p>

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-border-subtle text-xs">
          <div className="flex items-center gap-3 text-ink-muted">
            {author.social.twitter && (
              <span className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                <Twitter className="w-3.5 h-3.5" />
                <span>@{author.social.twitter}</span>
              </span>
            )}
            {author.social.email && (
              <span className="hidden sm:flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                <Mail className="w-3.5 h-3.5" />
                <span>{isHindi ? 'ईमेल भेजें' : 'Email Reporter'}</span>
              </span>
            )}
          </div>

          <button
            onClick={() => onViewAuthorProfile(author.id)}
            className="text-primary hover:text-primary-container font-semibold flex items-center gap-1 text-xs group"
          >
            <span>{isHindi ? 'इस लेखक के अन्य लेख' : 'More from this Journalist'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
