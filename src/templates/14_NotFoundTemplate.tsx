import React, { useState } from 'react';
import { Search, Home, Newspaper, TrendingUp, ArrowRight, AlertOctagon } from 'lucide-react';
import { WpPost } from '../types/wordpress';
import { mockCategories } from '../data/mockWpData';
import { getStoredPosts } from '../utils/newsStorage';
import { MediumStoryCard } from '../components/cards/MediumStoryCard';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { useLanguage } from '../context/LanguageContext';

interface NotFoundTemplateProps {
  onNavigateHome: () => void;
  onNavigateLatest: () => void;
  onNavigateTrending: () => void;
  onSelectPost: (post: WpPost) => void;
  onSelectCategory: (category: string) => void;
  onExecuteSearch?: (query: string) => void;
}

export const NotFoundTemplate: React.FC<NotFoundTemplateProps> = ({
  onNavigateHome,
  onNavigateLatest,
  onNavigateTrending,
  onSelectPost,
  onSelectCategory,
  onExecuteSearch,
}) => {
  const [query, setQuery] = useState('');
  const { t, isHindi } = useLanguage();

  const recommendedStories = getStoredPosts().slice(0, 3);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onExecuteSearch && query.trim()) {
      onExecuteSearch(query.trim());
    }
  };

  return (
    <div className="bg-canvas min-h-screen">
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: onNavigateHome },
          { label: isHindi ? '४०४ पृष्ठ नहीं मिला' : '404 Page Not Found', isActive: true },
        ]}
      />

      <main className="max-w-site mx-auto px-4 py-12 text-center">
        <div className="max-w-2xl mx-auto bg-surface-lowest border border-border-subtle p-8 sm:p-12 rounded-sm shadow-subtle mb-12">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/logo.png"
              alt="NP NEWS METRO"
              className="h-11 sm:h-14 w-auto object-contain cursor-pointer"
              onClick={onNavigateHome}
            />
          </div>

          {/* Error Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-editorial-red/10 text-editorial-red text-xs font-bold uppercase tracking-widest rounded-sm border border-editorial-red/20 mb-4">
            <AlertOctagon className="w-4 h-4" />
            <span>{isHindi ? 'एचटीटीपी ४०४ त्रुटि' : 'HTTP 404 Error'}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-ink tracking-tight mb-3">
            {isHindi ? 'लेख या पृष्ठ उपलब्ध नहीं है' : 'Article or Page Not Found'}
          </h1>

          <p className="text-sm sm:text-base text-ink-secondary leading-relaxed mb-6">
            {isHindi
              ? 'आप जिस ख़बर की तलाश कर रहे हैं, वह स्थानांतरित हो सकती है, उसका यूआरएल बदल गया हो सकता है या उसे संग्रहीत कर दिया गया है। रिपोर्ट खोजने के लिए नीचे दिए गए खोज बॉक्स का उपयोग करें।'
              : 'The story you are looking for may have been moved, updated with a revised URL permalink, or archived. Use our search tool below to find the report.'}
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md mx-auto mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isHindi ? 'कीवर्ड या शीर्षक द्वारा खोजें...' : 'Search by keyword or headline...'}
              className="flex-1 px-3.5 py-2.5 bg-surface-container border border-border-subtle rounded-sm text-xs text-ink focus:outline-hidden focus:border-primary font-medium"
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary-container text-white px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{t.search}</span>
            </button>
          </form>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-border-subtle text-xs">
            <button
              onClick={onNavigateHome}
              className="px-4 py-2 bg-primary text-white font-semibold rounded-sm hover:bg-primary-container transition-colors flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{isHindi ? 'मुख्य पृष्ठ पर लौटें' : 'Return to Homepage'}</span>
            </button>

            <button
              onClick={onNavigateLatest}
              className="px-4 py-2 bg-surface-container hover:bg-surface-high text-ink font-semibold rounded-sm border border-border-subtle transition-colors flex items-center gap-1.5"
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>{isHindi ? 'ताज़ा समाचार फ़ीड देखें' : 'View Latest Wire'}</span>
            </button>

            <button
              onClick={onNavigateTrending}
              className="px-4 py-2 bg-surface-container hover:bg-surface-high text-ink font-semibold rounded-sm border border-border-subtle transition-colors flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5 text-secondary" />
              <span>{isHindi ? 'ट्रेंडिंग ख़बरें' : 'Trending Stories'}</span>
            </button>
          </div>
        </div>

        {/* Recommended Stories */}
        <div className="max-w-4xl mx-auto text-left">
          <div className="flex items-center justify-between pb-2 border-b-2 border-primary mb-6">
            <h3 className="font-serif text-xl font-bold text-ink">
              {isHindi ? 'प्रमुख महत्वपूर्ण समाचार जिन्हें आप पढ़ना चाह सकते हैं' : 'Top Developing Stories You May Be Looking For'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recommendedStories.map((post) => (
              <MediumStoryCard
                key={post.id}
                post={post}
                onSelect={onSelectPost}
                onSelectCategory={onSelectCategory}
                showImage={true}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
