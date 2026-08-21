import React from 'react';
import { X, Search, ChevronRight, Newspaper, Mail, ShieldCheck, TrendingUp, Video, Camera, Globe, Languages } from 'lucide-react';
import { mockCategories } from '../../data/mockWpData';
import { useLanguage } from '../../context/LanguageContext';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (slug: string) => void;
  onOpenSearch: () => void;
  onNavigateTrending: () => void;
  onNavigatePhotos: () => void;
  onNavigateStatic: (page: string) => void;
  onOpenAdmin?: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
  onOpenSearch,
  onNavigateTrending,
  onNavigatePhotos,
  onNavigateStatic,
  onOpenAdmin,
}) => {
  const { language, setLanguage, t, isHindi } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Drawer panel */}
      <div className="relative z-10 w-full max-w-sm bg-surface-lowest h-full shadow-2xl flex flex-col overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-canvas">
          <div className="cursor-pointer flex items-center py-0.5" onClick={() => { onSelectCategory('home'); onClose(); }}>
            <img
              src="/logo.png"
              alt="NP NEWS METRO"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-1.5 rounded-sm hover:bg-surface-container text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Language Switcher Bar */}
        <div className="px-4 py-2.5 bg-surface-container border-b border-border-subtle flex items-center justify-between">
          <span className="text-xs font-bold text-ink flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-primary" />
            <span>{isHindi ? 'भाषा चुनें (Language)' : 'Select Language'}</span>
          </span>

          <div className="flex items-center bg-white border border-border-subtle rounded-md p-0.5 shadow-2xs">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-sm text-[11px] font-bold uppercase transition-all ${
                language === 'en'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-ink-secondary hover:text-primary'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 rounded-sm text-[11px] font-bold transition-all ${
                language === 'hi'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-ink-secondary hover:text-primary'
              }`}
            >
              हिंदी
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 border-b border-border-subtle">
          <button
            onClick={() => {
              onClose();
              onOpenSearch();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-surface-container rounded-sm border border-border-subtle text-xs text-ink-muted"
          >
            <Search className="w-4 h-4 text-primary" />
            <span>{t.searchPlaceholder}</span>
          </button>
        </div>

        {/* Categories List */}
        <div className="flex-1 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-2 px-2">
            {isHindi ? 'संपादकीय अनुभाग' : 'Editorial Desks'}
          </p>
          <div className="space-y-0.5">
            <button
              onClick={() => {
                onSelectCategory('home');
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-sm text-sm font-semibold text-ink hover:bg-surface-container hover:text-primary transition-colors"
            >
              <span>{t.nav_home}</span>
              <ChevronRight className="w-4 h-4 text-ink-muted" />
            </button>

            <button
              onClick={() => {
                onSelectCategory('latest');
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-sm text-sm font-semibold text-ink hover:bg-surface-container hover:text-primary transition-colors"
            >
              <span>{t.latestNewsWire}</span>
              <span className="text-[10px] bg-editorial-red text-white px-1.5 py-0.5 rounded font-bold">24/7</span>
            </button>

            {mockCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.slug);
                  onClose();
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-sm text-sm font-medium text-ink hover:bg-surface-container hover:text-primary transition-colors"
              >
                <span>
                  {cat.slug === 'india'
                    ? t.nav_india
                    : cat.slug === 'politics'
                    ? t.nav_politics
                    : cat.slug === 'business'
                    ? t.nav_business
                    : cat.slug === 'technology'
                    ? t.nav_tech
                    : cat.slug === 'world'
                    ? t.nav_world
                    : cat.slug === 'sports'
                    ? t.nav_sports
                    : cat.slug === 'entertainment'
                    ? t.nav_entertainment
                    : cat.slug === 'lifestyle'
                    ? t.nav_lifestyle
                    : cat.name}
                </span>
                <ChevronRight className="w-4 h-4 text-ink-muted" />
              </button>
            ))}
          </div>

          {/* Special Destinations */}
          <div className="mt-6 pt-4 border-t border-border-subtle space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-2 px-2">
              {isHindi ? 'मल्टीमीडिया एवं विशेष' : 'Multimedia & Features'}
            </p>
            <button
              onClick={() => {
                onSelectCategory('videos');
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-sm font-medium text-ink hover:bg-surface-container hover:text-primary transition-colors"
            >
              <Video className="w-4 h-4 text-editorial-red" />
              <span>{t.nav_videos}</span>
            </button>
            <button
              onClick={() => {
                onNavigatePhotos();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-sm font-medium text-ink hover:bg-surface-container hover:text-primary transition-colors"
            >
              <Camera className="w-4 h-4 text-secondary-gold" />
              <span>{t.nav_photos}</span>
            </button>
            <button
              onClick={() => {
                onNavigateTrending();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-sm font-medium text-ink hover:bg-surface-container hover:text-primary transition-colors"
            >
              <TrendingUp className="w-4 h-4 text-editorial-red" />
              <span>{t.nav_trending}</span>
            </button>
          </div>
        </div>

        {/* Drawer Footer / Policy links */}
        <div className="p-4 bg-canvas border-t border-border-subtle text-xs space-y-2">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-ink-secondary">
            <button onClick={() => { onNavigateStatic('about'); onClose(); }} className="hover:underline">{isHindi ? 'हमारे बारे में' : 'About Us'}</button>
            <button onClick={() => { onNavigateStatic('ethics'); onClose(); }} className="hover:underline">{t.factCheckDesk}</button>
            <button onClick={() => { onNavigateStatic('corrections'); onClose(); }} className="hover:underline">{isHindi ? 'संशोधन नीति' : 'Corrections Policy'}</button>
            <button onClick={() => { onNavigateStatic('contact'); onClose(); }} className="hover:underline">{t.contactUs}</button>
          </div>
          <p className="text-[10px] text-ink-muted mt-2">
            {t.footerCopyright} {t.allRightsReserved}
          </p>
        </div>
      </div>
    </div>
  );
};
