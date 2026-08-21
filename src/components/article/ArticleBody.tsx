import React from 'react';
import { WpPost, GutenbergBlock } from '../../types/wordpress';
import { KeyPointsBlock } from './KeyPointsBlock';
import { PullQuote } from './PullQuote';
import { AdSlot } from '../commercial/AdSlot';
import { handleImageError } from '../../utils/imageFallback';

interface ArticleBodyProps {
  post: WpPost;
  onSelectRelatedStory?: (storyId: string) => void;
  showAds?: boolean;
}

export const ArticleBody: React.FC<ArticleBodyProps> = ({
  post,
  onSelectRelatedStory,
  showAds = false,
}) => {
  return (
    <div className="gutenberg-content font-sans text-ink leading-relaxed">
      {post.blocks.map((block, index) => {
        switch (block.type) {
          case 'paragraph': {
            const isFirstParagraph = index === 0;
            return (
              <p
                key={block.id}
                className={`text-base sm:text-lg text-ink-secondary mb-6 leading-relaxed ${
                  isFirstParagraph
                    ? 'first-letter:font-serif first-letter:text-4xl sm:first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-2 sm:first-letter:mr-3 first-letter:float-left first-letter:leading-none'
                    : ''
                }`}
              >
                {block.content}
              </p>
            );
          }

          case 'heading': {
            if (block.level === 3) {
              return (
                <h3 key={block.id} className="font-serif text-xl sm:text-2xl font-bold text-ink mt-8 mb-3">
                  {block.content}
                </h3>
              );
            }
            return (
              <h2 key={block.id} className="font-serif text-2xl sm:text-3xl font-bold text-ink mt-10 mb-4 border-b border-border-subtle pb-2">
                {block.content}
              </h2>
            );
          }

          case 'keypoints': {
            if (!post.keyTakeaways || post.keyTakeaways.length === 0) return null;
            return <KeyPointsBlock key={block.id} points={post.keyTakeaways} />;
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
