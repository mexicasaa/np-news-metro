import React, { useState } from 'react';
import { ChevronDown, TrendingUp, Sparkles, Video, Camera } from 'lucide-react';
import { mockCategories } from '../../data/mockWpData';
import { useLanguage } from '../../context/LanguageContext';

interface PrimaryNavProps {
  currentCategory?: string;
  onSelectCategory: (categorySlug: string) => void;
  onNavigateTrending: () => void;
  onNavigatePhotos: () => void;
}

export const PrimaryNav: React.FC<PrimaryNavProps> = ({
  currentCategory = 'home',
  onSelectCategory,
  onNavigateTrending,
  onNavigatePhotos,
}) => {
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const { t, isHindi } = useLanguage();

  const mainItems = [
    { label: t.nav_home, slug: 'home' },
    { label: t.nav_latest, slug: 'latest' },
    { label: t.nav_india, slug: 'india' },
    { label: t.nav_politics, slug: 'politics' },
    { label: t.nav_business, slug: 'business' },
    { label: t.nav_tech, slug: 'technology' },
    { label: t.nav_world, slug: 'world' },
    { label: t.nav_sports, slug: 'sports' },
    { label: t.nav_entertainment, slug: 'entertainment' },
    { label: t.nav_lifestyle, slug: 'lifestyle' },
    { label: t.nav_opinion, slug: 'opinion' },
    { label: t.nav_videos, slug: 'videos' },
  ];

  const secondaryItems = [
    { label: t.nav_photos, slug: 'photos', icon: Camera },
    { label: t.nav_trending, slug: 'trending', icon: TrendingUp },
    { label: isHindi ? 'पर्यावरण एवं जलवायु' : 'Environment & Climate', slug: 'lifestyle' },
    { label: isHindi ? 'शिक्षा एवं रोज़गार' : 'Education & Jobs', slug: 'india' },
    { label: isHindi ? 'विज्ञान एवं अंतरिक्ष' : 'Science & Space', slug: 'technology' },
    { label: isHindi ? 'तथ्य-जांच ब्यूरो' : 'Fact-Check Bureau', slug: 'static', staticPage: 'ethics' },
  ];

  return (
    <nav className="bg-canvas border-b-2 border-primary/20 sticky top-0 z-30 shadow-subtle w-full max-w-full overflow-hidden">
      <div className="max-w-site mx-auto px-2 sm:px-4 flex items-center justify-between">
        {/* Horizontal Navigation List */}
        <ul className="flex items-center overflow-x-auto hide-scrollbar whitespace-nowrap gap-0.5 sm:gap-1 py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-ink scroll-smooth touch-pan-x w-full">
          {mainItems.map((item) => {
            const isActive = currentCategory === item.slug;
            return (
              <li key={item.slug} className="flex-shrink-0">
                <button
                  onClick={() => onSelectCategory(item.slug)}
                  className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-sm transition-all flex items-center gap-1 sm:gap-1.5 ${
                    isActive
                      ? 'text-primary bg-surface-lowest border-b-2 border-primary font-bold shadow-subtle'
                      : 'hover:text-primary hover:bg-surface-lowest/70 text-ink/80'
                  }`}
                >
                  {item.slug === 'videos' && <Video className="w-3 h-3 text-editorial-red" />}
                  {item.label}
                </button>
              </li>
            );
          })}

          {/* Photos Link */}
          <li>
            <button
              onClick={onNavigatePhotos}
              className={`px-3 py-2 rounded-sm transition-all flex items-center gap-1.5 ${
                currentCategory === 'photos'
                  ? 'text-primary bg-surface-lowest border-b-2 border-primary font-bold'
                  : 'hover:text-primary hover:bg-surface-lowest/70 text-ink/80'
              }`}
            >
              <Camera className="w-3 h-3 text-secondary-gold" />
              {t.nav_photos}
            </button>
          </li>

          {/* More Dropdown */}
          <li className="relative">
            <button
              onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
              onBlur={() => setTimeout(() => setMoreDropdownOpen(false), 200)}
              className="px-3 py-2 rounded-sm hover:text-primary hover:bg-surface-lowest/70 text-ink/80 transition-all flex items-center gap-1"
            >
              <span>{isHindi ? 'अन्य' : 'More'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {moreDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-surface-lowest border border-border-subtle rounded-sm shadow-dropdown py-2 z-50 animate-fadeIn">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-ink-muted tracking-wider border-b border-border-subtle">
                  Special Coverage
                </div>
                {secondaryItems.map((sec, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (sec.slug === 'trending') onNavigateTrending();
                      else if (sec.slug === 'photos') onNavigatePhotos();
                      else onSelectCategory(sec.slug);
                      setMoreDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-ink hover:bg-surface-container hover:text-primary transition-colors flex items-center justify-between"
                  >
                    <span>{sec.label}</span>
                    {sec.icon && <sec.icon className="w-3.5 h-3.5 text-secondary-gold" />}
                  </button>
                ))}
              </div>
            )}
          </li>
        </ul>

        {/* Right Action: Trending Hub Quick Trigger */}
        <div className="hidden xl:flex items-center pl-3 border-l border-border-subtle">
          <button
            onClick={onNavigateTrending}
            className="flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-primary transition-colors px-2 py-1 bg-surface-container/60 rounded-sm border border-border-subtle"
          >
            <TrendingUp className="w-3.5 h-3.5 text-editorial-red" />
            <span className="uppercase tracking-wider text-[10px]">Trending Today</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
