import React from 'react';
import { Newspaper, ArrowRight } from 'lucide-react';
import { WpPost } from '../../types/wordpress';
import { MediumStoryCard } from '../cards/MediumStoryCard';
import { useLanguage } from '../../context/LanguageContext';

interface RelatedStoriesBlockProps {
  relatedPosts: WpPost[];
  onSelectPost: (post: WpPost) => void;
  onSelectCategory?: (category: string) => void;
  title?: string;
}

export const RelatedStoriesBlock: React.FC<RelatedStoriesBlockProps> = ({
  relatedPosts,
  onSelectPost,
  onSelectCategory,
  title,
}) => {
  const { t, isHindi } = useLanguage();
  const displayTitle = title || (isHindi ? 'संबंधित समाचार एवं विश्लेषण' : 'Related Coverage & Analysis');

  if (!relatedPosts || relatedPosts.length === 0) return null;

  return (
    <section className="my-10 pt-8 border-t-2 border-primary/20">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-primary" />
          <h3 className="font-serif text-xl font-bold text-ink tracking-tight">
            {displayTitle}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedPosts.slice(0, 3).map((post) => (
          <MediumStoryCard
            key={post.id}
            post={post}
            onSelect={onSelectPost}
            onSelectCategory={onSelectCategory}
            showImage={true}
          />
        ))}
      </div>
    </section>
  );
};
