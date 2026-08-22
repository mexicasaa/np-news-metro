import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Calendar, User, Tag, ArrowRight, Sparkles } from 'lucide-react';
import { WpPost } from '../../types/wordpress';
import { mockAuthors, mockCategories, getLocalizedPost } from '../../data/mockWpData';
import { getStoredPosts } from '../../utils/newsStorage';
import { useLanguage } from '../../context/LanguageContext';

interface SearchModalProps {
  posts?: WpPost[];
  isOpen: boolean;
  onClose: () => void;
  onSelectPost: (post: WpPost) => void;
  onExecuteFullSearch?: (query: string, filterCategory?: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  posts: externalPosts,
  isOpen,
  onClose,
  onSelectPost,
  onExecuteFullSearch,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const { language, t, isHindi } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedCategory('all');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allPosts = externalPosts && externalPosts.length > 0 ? externalPosts : getStoredPosts();

  const filteredPosts = allPosts.filter((post) => {
    const localized = getLocalizedPost(post, language);
    const q = query.trim().toLowerCase();
    if (!q) {
      return selectedCategory === 'all' || post.category === selectedCategory;
    }

    const matchesQuery =
      (localized.title && localized.title.toLowerCase().includes(q)) ||
      (localized.dek && localized.dek.toLowerCase().includes(q)) ||
      (post.title && post.title.toLowerCase().includes(q)) ||
      (post.titleHi && post.titleHi.toLowerCase().includes(q)) ||
      (post.dek && post.dek.toLowerCase().includes(q)) ||
      (post.dekHi && post.dekHi.toLowerCase().includes(q)) ||
      post.tags.some((t) => t.toLowerCase().includes(q)) ||
      post.blocks?.some((b) => b.content && b.content.toLowerCase().includes(q)) ||
      post.blocksHi?.some((b) => b.content && b.content.toLowerCase().includes(q)) ||
      post.keyTakeaways?.some((k) => k.toLowerCase().includes(q)) ||
      post.keyTakeawaysHi?.some((k) => k.toLowerCase().includes(q));

    const matchesCategory =
      selectedCategory === 'all' || post.category === selectedCategory;

    return matchesQuery && matchesCategory;
  });

  const popularSearches = isHindi ? [
    'गन्ने के रस की एक बूंद में उलझा देश का भविष्य',
    'गन्ना एवं इथेनॉल सम्मिश्रण नीति',
    'मल्टी-मॉडल इंफ्रास्ट्रक्चर कॉरिडोर',
    'चुनाव आयोग विधानसभा कार्यक्रम',
    'सेमीकंडक्टर प्लांट धोलेरा',
    'खुदरा मुद्रास्फीति आरबीआई',
    'पश्चिमी घाट देवराई वन',
  ] : [
    'Sugarcane Ethanol Blending Policy',
    'Infrastructure Corridor',
    'Election Commission',
    'Semiconductor Dholera',
    'Retail Inflation RBI',
    'Western Ghats Sacred Groves',
  ];

  const handleFullSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onExecuteFullSearch && query.trim()) {
      onExecuteFullSearch(query, selectedCategory === 'all' ? undefined : selectedCategory);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-ink/70 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-2xl bg-surface-lowest border border-border-subtle rounded-sm shadow-modal overflow-hidden animate-fadeIn">
        {/* Search Input Header */}
        <form onSubmit={handleFullSearchSubmit} className="p-4 border-b border-border-subtle flex items-center gap-3 bg-canvas">
          <Search className="w-5 h-5 text-primary flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-transparent border-none text-ink placeholder-ink-muted text-base focus:outline-hidden font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 hover:bg-surface-container rounded text-ink-muted"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-ink-muted hover:text-ink px-2 py-1 border border-border-subtle rounded-sm"
          >
            ESC
          </button>
        </form>

        {/* Category Filters Bar */}
        <div className="px-4 py-2 border-b border-border-subtle bg-surface-lowest flex items-center gap-2 overflow-x-auto hide-scrollbar text-xs">
          <span className="text-ink-muted font-semibold text-[11px] uppercase tracking-wider">
            {isHindi ? 'फ़िल्टर:' : 'Filter:'}
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-primary text-white'
                : 'bg-surface-container text-ink hover:bg-surface-high'
            }`}
          >
            {isHindi ? 'सभी अनुभाग' : 'All Sections'}
          </button>
          {mockCategories.slice(0, 7).map((cat) => {
            const catLabel = isHindi && cat.nameHi ? cat.nameHi : cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-2.5 py-1 rounded-sm text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.slug
                    ? 'bg-primary text-white'
                    : 'bg-surface-container text-ink hover:bg-surface-high'
                }`}
              >
                {catLabel}
              </button>
            );
          })}
        </div>

        {/* Results Stream / Empty / Suggestions */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {query.trim() === '' ? (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5 text-secondary-gold" />
                <span>{isHindi ? 'न्यूज़रूम के ट्रेंडिंग विषय' : 'Trending Topics in the Newsroom'}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {popularSearches.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 bg-surface-container hover:bg-surface-high text-xs font-medium text-ink rounded-sm border border-border-subtle transition-colors flex items-center gap-1.5"
                  >
                    <span>{term}</span>
                    <ArrowRight className="w-3 h-3 text-ink-muted" />
                  </button>
                ))}
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                {isHindi ? 'हालिया प्रमुख समाचार' : 'Recent Lead Stories'}
              </p>
              <div className="space-y-2">
                {allPosts.slice(0, 3).map((post: WpPost) => {
                  const locPost = getLocalizedPost(post, language);
                  return (
                    <div
                      key={post.id}
                      onClick={() => {
                        onSelectPost(post);
                        onClose();
                      }}
                      className="p-2.5 hover:bg-surface-container rounded-sm border border-border-subtle cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-gold">
                          {locPost.category}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-ink leading-snug line-clamp-1">
                          {locPost.title}
                        </h4>
                      </div>
                      <ArrowRight className="w-4 h-4 text-ink-muted flex-shrink-0 ml-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-ink-muted pb-2 border-b border-border-subtle">
                <span>
                  {isHindi
                    ? `"${query}" के लिए ${filteredPosts.length} परिणाम मिले`
                    : `Found ${filteredPosts.length} matches for "${query}"`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (onExecuteFullSearch) onExecuteFullSearch(query, selectedCategory === 'all' ? undefined : selectedCategory);
                    onClose();
                  }}
                  className="font-semibold text-primary hover:underline"
                >
                  {isHindi ? 'पूरा परिणाम पृष्ठ देखें →' : 'View full results page →'}
                </button>
              </div>
              {filteredPosts.map((post) => {
                const author = mockAuthors[post.authorId];
                const locPost = getLocalizedPost(post, language);
                return (
                  <div
                    key={post.id}
                    onClick={() => {
                      onSelectPost(post);
                      onClose();
                    }}
                    className="p-3 hover:bg-surface-container rounded-sm border border-border-subtle cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-1">
                      <span className="text-secondary-gold font-bold">{locPost.category}</span>
                      <span>•</span>
                      <span>{isHindi ? locPost.readTime.replace('min read', 'मिनट') : locPost.readTime}</span>
                      {author && <span>• {isHindi ? 'लेखक: ' : 'By '}{author.name}</span>}
                    </div>
                    <h4 className="font-serif font-bold text-sm sm:text-base text-ink mb-1 hover:text-primary">
                      {locPost.title}
                    </h4>
                    <p className="text-xs text-ink-secondary line-clamp-2">{locPost.dek}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-surface-container mx-auto flex items-center justify-center text-ink-muted mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-ink">
                {isHindi ? `"${query}" के लिए कोई परिणाम नहीं मिला` : `No articles matched "${query}"`}
              </h3>
              <p className="text-xs text-ink-secondary max-w-sm mx-auto mt-1 mb-4">
                {isHindi
                  ? 'कृपया अन्य शब्दों से खोजने का प्रयास करें या हमारे प्रमुख डेस्क देखें।'
                  : 'Try searching with broader terms or check spelling. You can also browse our major editorial desks.'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {mockCategories.slice(0, 4).map((c) => {
                  const catLabel = isHindi && c.nameHi ? c.nameHi : c.name;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setQuery('');
                        setSelectedCategory(c.slug);
                      }}
                      className="px-2.5 py-1 bg-surface-container text-xs font-semibold text-primary rounded-sm border border-border-subtle"
                    >
                      {isHindi ? `${catLabel} देखें` : `Browse ${c.name}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
