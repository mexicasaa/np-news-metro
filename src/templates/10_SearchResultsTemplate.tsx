import React, { useState } from 'react';
import { Search, Filter, X, ArrowRight, Sparkles, Compass } from 'lucide-react';
import { WpPost } from '../types/wordpress';
import { mockCategories, getLocalizedPost } from '../data/mockWpData';
import { getStoredPosts } from '../utils/newsStorage';
import { HorizontalStoryCard } from '../components/cards/HorizontalStoryCard';
import { EmptyState } from '../components/common/EmptyState';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { useLanguage } from '../context/LanguageContext';

interface SearchResultsTemplateProps {
  posts?: WpPost[];
  initialQuery?: string;
  onSelectPost: (post: WpPost) => void;
  onNavigateHome: () => void;
  onSelectCategory: (category: string) => void;
}

export const SearchResultsTemplate: React.FC<SearchResultsTemplateProps> = ({
  posts: externalPosts,
  initialQuery = 'Corridor',
  onSelectPost,
  onNavigateHome,
  onSelectCategory,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'date'>('relevance');
  const { language, t, isHindi } = useLanguage();

  const allPosts = externalPosts && externalPosts.length > 0 ? externalPosts : getStoredPosts();

  const filteredPosts = allPosts.filter((post) => {
    const localized = getLocalizedPost(post, language);
    const matchesQuery =
      query.trim() === '' ||
      localized.title.toLowerCase().includes(query.toLowerCase()) ||
      localized.dek.toLowerCase().includes(query.toLowerCase()) ||
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.dek.toLowerCase().includes(query.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || post.category === selectedCategory;

    return matchesQuery && matchesCategory;
  });

  const popularSearches = isHindi ? [
    'इंफ्रास्ट्रक्चर',
    'चुनाव आयोग',
    'सेमीकंडक्टर',
    'मुद्रास्फीति',
    'वाराणसी',
    'पश्चिमी घाट',
  ] : [
    'Infrastructure',
    'Election Commission',
    'Semiconductor',
    'Inflation',
    'Varanasi',
    'Western Ghats',
  ];

  return (
    <div className="bg-canvas min-h-screen">
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: onNavigateHome },
          { label: isHindi ? 'समाचार अभिलेखागार खोजें' : 'Search Archives', isActive: true },
        ]}
      />

      <main className="max-w-site mx-auto px-4 py-8 space-y-8">
        {/* Large Search Box */}
        <div className="bg-surface-lowest border border-border-subtle p-6 sm:p-8 rounded-sm shadow-subtle max-w-4xl mx-auto">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink mb-4">
            {isHindi ? 'एनपी न्यूज़ मेट्रो अभिलेखागार खोजें' : 'Search NP News Metro Archives'}
          </h1>

          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-primary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-11 pr-4 py-3 bg-surface-container border border-border-subtle rounded-sm text-sm text-ink focus:outline-hidden focus:border-primary font-medium"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-subtle flex-shrink-0"
            >
              <Search className="w-4 h-4 text-secondary-gold" />
              <span>{t.search}</span>
            </button>
          </form>

          {/* Trending search suggestions */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-ink-muted">
            <span className="font-bold text-ink text-[11px] uppercase tracking-wider">
              {isHindi ? 'सुझाव:' : 'Suggested:'}
            </span>
            {popularSearches.map((term, i) => (
              <button
                key={i}
                onClick={() => setQuery(term)}
                className="bg-surface-container hover:bg-surface-high text-ink px-2.5 py-1 rounded-sm border border-border-subtle transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Filters and Results Counts */}
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold uppercase text-ink-muted text-[11px]">
              {isHindi ? 'अनुभाग:' : 'Section:'}
            </span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-sm font-semibold ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-surface-container text-ink hover:bg-surface-high border border-border-subtle'
              }`}
            >
              {isHindi ? 'सभी अनुभाग' : 'All Sections'}
            </button>
            {mockCategories.slice(0, 6).map((c) => {
              const catLabel = isHindi && c.nameHi ? c.nameHi : c.name;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`px-2.5 py-1 rounded-sm font-medium ${
                    selectedCategory === c.slug
                      ? 'bg-primary text-white font-semibold'
                      : 'bg-surface-container text-ink hover:bg-surface-high border border-border-subtle'
                  }`}
                >
                  {catLabel}
                </button>
              );
            })}
          </div>

          <div className="text-ink-secondary flex items-center gap-3">
            <span>
              {isHindi ? `${filteredPosts.length} परिणाम प्रदर्शित` : `Showing ${filteredPosts.length} results`}
            </span>
            <span>•</span>
            <select
              aria-label="Sort search results"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-surface-container border border-border-subtle text-ink rounded px-2 py-1 text-xs"
            >
              <option value="relevance">{isHindi ? 'सर्वाधिक प्रासंगिक' : 'Most Relevant'}</option>
              <option value="date">{isHindi ? 'नवीनतम पहले' : 'Most Recent'}</option>
            </select>
          </div>
        </div>

        {/* Results Feed or Empty State */}
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <HorizontalStoryCard
                key={post.id}
                post={post}
                onSelect={onSelectPost}
                onSelectCategory={onSelectCategory}
              />
            ))
          ) : (
            <EmptyState
              title={isHindi ? `"${query}" के लिए कोई समाचार नहीं मिला` : `No articles matched "${query}"`}
              description={isHindi ? 'कृपया अन्य शब्दों से खोजने का प्रयास करें या श्रेणी फ़िल्टर हटाएं।' : 'Try adjusting your keywords or clearing the category filter. You can also explore our core editorial sections below.'}
              onReset={() => {
                setQuery('');
                setSelectedCategory('all');
              }}
              onSelectCategory={onSelectCategory}
            />
          )}
        </div>
      </main>
    </div>
  );
};
