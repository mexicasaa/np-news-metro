import React from 'react';
import { WpPost, GutenbergBlock } from '../../types/wordpress';
import { KeyPointsBlock } from './KeyPointsBlock';
import { PullQuote } from './PullQuote';
import { AdSlot } from '../commercial/AdSlot';
import { handleImageError } from '../../utils/imageFallback';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedPost } from '../../data/mockWpData';

interface ArticleBodyProps {
  post: WpPost;
  onSelectRelatedStory?: (storyId: string) => void;
  showAds?: boolean;
}

/**
 * Safely parses inline markdown syntax (bold, italic, links) into React elements.
 */
export const renderInlineMarkdown = (text?: string): React.ReactNode => {
  if (!text) return '';

  // Pattern matches:
  // 1. Links: [anchor text](url)
  // 2. Bold: **bold text**
  // 3. Italic: *italic text*
  const pattern = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (!part) return null;

    // Link: [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const linkText = linkMatch[1];
      const linkHref = linkMatch[2].trim();
      const isInternal = linkHref.startsWith('/') || linkHref.startsWith('#');
      return (
        <a
          key={index}
          href={linkHref}
          target={isInternal ? undefined : '_blank'}
          rel={isInternal ? undefined : 'noopener noreferrer'}
          className="text-primary underline hover:text-primary-dark font-medium transition-colors cursor-pointer"
        >
          {linkText}
        </a>
      );
    }

    // Bold: **text**
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) {
      return (
        <strong key={index} className="font-bold text-ink">
          {boldMatch[1]}
        </strong>
      );
    }

    // Italic: *text*
    const italicMatch = part.match(/^\*([^*]+)\*$/);
    if (italicMatch) {
      return (
        <em key={index} className="italic">
          {italicMatch[1]}
        </em>
      );
    }

    return part;
  });
};

export const ArticleBody: React.FC<ArticleBodyProps> = ({
  post,
  onSelectRelatedStory,
  showAds = false,
}) => {
  const { language } = useLanguage();
  const localized = getLocalizedPost(post, language);

  return (
    <div className="gutenberg-content font-body text-ink leading-relaxed">
      {(localized.blocks || post.blocks).map((block, index) => {
        switch (block.type) {
          case 'paragraph': {
            const isFirstParagraph = index === 0;
            const content = block.content || '';

            // If a paragraph contains bullet items (e.g. lines starting with '- ' or '* ')
            const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
            const isBulletGroup = lines.length > 1 && lines.every(l => /^[-*]\s+/.test(l));

            if (isBulletGroup) {
              return (
                <ul key={block.id} className="list-disc list-outside pl-6 sm:pl-8 mb-6 space-y-2 text-base sm:text-lg text-ink-secondary leading-relaxed">
                  {lines.map((line, lIdx) => (
                    <li key={lIdx}>
                      {renderInlineMarkdown(line.replace(/^[-*]\s+/, ''))}
                    </li>
                  ))}
                </ul>
              );
            }

            return (
              <p
                key={block.id}
                className={`text-base sm:text-lg text-ink-secondary mb-6 leading-relaxed ${
                  isFirstParagraph
                    ? 'first-letter:font-serif first-letter:text-4xl sm:first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-2 sm:first-letter:mr-3 first-letter:float-left first-letter:leading-none'
                    : ''
                }`}
              >
                {renderInlineMarkdown(content)}
              </p>
            );
          }

          case 'heading': {
            const headingContent = renderInlineMarkdown(block.content);
            if (block.level === 3) {
              return (
                <h3 key={block.id} className="font-serif text-xl sm:text-2xl font-bold text-ink mt-8 mb-3">
                  {headingContent}
                </h3>
              );
            }
            return (
              <h2 key={block.id} className="font-serif text-2xl sm:text-3xl font-bold text-ink mt-10 mb-4 border-b border-border-subtle pb-2">
                {headingContent}
              </h2>
            );
          }

          case 'list': {
            const listItems = block.items && block.items.length > 0 
              ? block.items 
              : (block.content ? block.content.split('\n').map(l => l.replace(/^[-*]\s+/, '').trim()).filter(Boolean) : []);

            return (
              <ul key={block.id} className="list-disc list-outside pl-6 sm:pl-8 mb-6 space-y-2 text-base sm:text-lg text-ink-secondary leading-relaxed">
                {listItems.map((item, iIdx) => (
                  <li key={iIdx}>
                    {renderInlineMarkdown(item)}
                  </li>
                ))}
              </ul>
            );
          }

          case 'keypoints': {
            const points = localized.keyTakeaways || post.keyTakeaways;
            if (!points || points.length === 0) return null;
            return <KeyPointsBlock key={block.id} points={points} />;
          }

          case 'pullquote': {
            return (
              <PullQuote
                key={block.id}
                content={block.content || ''}
                author={block.author}
                citation={block.citation}
              />
            );
          }

          case 'table': {
            if (!block.tableData) return null;
            return (
              <div key={block.id} className="my-8 overflow-x-auto border border-border-subtle rounded-sm bg-surface-lowest shadow-subtle">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-primary text-white">
                      {block.tableData.headers.map((h, i) => (
                        <th key={i} className="py-3 px-4 font-serif font-bold uppercase tracking-wider text-xs">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-ink-secondary">
                    {block.tableData.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-surface-container/50 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-3 px-4 font-medium">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          case 'image': {
            return (
              <figure key={block.id} className="my-8">
                <div className="aspect-[16/9] overflow-hidden rounded-sm bg-surface-container border border-border-subtle">
                  <img
                    src={block.imageUrl}
                    alt={block.imageCaption || 'Article visual'}
                    onError={handleImageError}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {(block.imageCaption || block.imageCredit) && (
                  <figcaption className="text-xs text-ink-muted mt-2 flex flex-wrap items-center justify-between gap-1">
                    <span>{block.imageCaption}</span>
                    <span className="font-semibold text-ink-secondary">{block.imageCredit}</span>
                  </figcaption>
                )}
              </figure>
            );
          }

          case 'ad_slot': {
            if (!showAds) return null;
            return (
              <div key={block.id} className="my-6">
                <AdSlot zone={block.adZone || 'A4'} />
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
};
