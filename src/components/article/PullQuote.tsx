import React from 'react';
import { Quote } from 'lucide-react';

interface PullQuoteProps {
  content: string;
  author?: string;
  citation?: string;
}

export const PullQuote: React.FC<PullQuoteProps> = ({
  content,
  author,
  citation,
}) => {
  return (
    <figure className="my-8 py-6 px-6 sm:px-8 border-y-2 border-primary/20 bg-surface-lowest rounded-sm relative">
      <Quote className="w-8 h-8 text-secondary/30 absolute top-3 left-3 -scale-x-100" />
      <blockquote className="font-serif text-xl sm:text-2xl text-primary font-medium italic leading-snug pl-4 mb-3">
        “{content}”
      </blockquote>
      {(author || citation) && (
        <figcaption className="text-xs font-semibold text-ink-muted pl-4 uppercase tracking-wider">
          {author && <span className="text-ink font-bold">{author}</span>}
          {citation && <span className="ml-1 text-ink-secondary">— {citation}</span>}
        </figcaption>
      )}
    </figure>
  );
};
