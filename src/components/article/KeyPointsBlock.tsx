import React from 'react';
import { CheckCircle2, BookmarkCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface KeyPointsBlockProps {
  title?: string;
  points: string[];
}

export const KeyPointsBlock: React.FC<KeyPointsBlockProps> = ({
  title,
  points,
}) => {
  const { isHindi } = useLanguage();
  const displayTitle = title || (isHindi ? 'मुख्य बिंदु जो आपको जानने चाहिए' : 'What You Need to Know');

  if (!points || points.length === 0) return null;

  return (
    <div className="my-8 bg-surface-lowest border-l-4 border-primary border-y border-r border-border-subtle p-5 rounded-r-sm shadow-subtle">
      <div className="flex items-center gap-2 mb-3">
        <BookmarkCheck className="w-5 h-5 text-secondary" />
        <h3 className="font-serif text-lg font-bold text-ink tracking-tight">
          {displayTitle}
        </h3>
      </div>
      <ul className="space-y-2.5 text-sm text-ink-secondary leading-relaxed">
        {points.map((pt, index) => (
          <li key={index} className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-gold mt-2 flex-shrink-0"></span>
            <span>{pt}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
