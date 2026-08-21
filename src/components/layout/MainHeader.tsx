import React from 'react';
import { Menu, Search, Bookmark, Bell, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface MainHeaderProps {
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onOpenNewsletter: () => void;
  onNavigateHome: () => void;
  onOpenAdmin?: () => void;
  savedArticlesCount?: number;
}

export const MainHeader: React.FC<MainHeaderProps> = ({
  onOpenMenu,
  onOpenSearch,
  onOpenNewsletter,
  onNavigateHome,
  onOpenAdmin,
  savedArticlesCount = 0,
}) => {
  const { t } = useLanguage();

  return (
    <header className="bg-canvas border-b border-border-subtle py-2.5 sm:py-3.5 px-3 sm:px-4">
      <div className="max-w-site mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Navigation Drawer Trigger & Quick Links */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={onOpenMenu}
            aria-label="Open Navigation Menu"
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-sm border border-border-subtle hover:bg-surface-lowest hover:border-primary transition-all text-[11px] sm:text-xs font-semibold text-ink uppercase tracking-wider shadow-subtle"
          >
            <Menu className="w-4 h-4 text-primary" />
            <span className="hidden xs:inline sm:inline">{t.sections}</span>
          </button>

          <button
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-sm bg-surface-lowest border border-border-subtle hover:border-primary text-ink-muted text-xs transition-colors w-44 lg:w-56"
            aria-label="Search stories, topics, authors"
          >
            <Search className="w-3.5 h-3.5 text-ink-muted" />
            <span className="truncate">{t.searchPlaceholder}</span>
            <kbd className="hidden lg:inline-block ml-auto text-[10px] bg-surface-container px-1.5 py-0.5 rounded text-ink-secondary border border-border-subtle font-mono">
              /
            </kbd>
          </button>
        </div>

        {/* Center: NP News Metro Master Brand Header */}
        <div className="text-center flex-1 max-w-2xl cursor-pointer flex items-center justify-center px-1 sm:px-2 min-w-0" onClick={onNavigateHome}>
          <div className="inline-flex flex-col items-center group py-0.5 max-w-full">
            <img
              src="/logo.png"
              alt="NP NEWS METRO — Real News. Real Impact."
              className="h-9 xs:h-11 sm:h-14 md:h-16 lg:h-18 w-auto max-w-[170px] xs:max-w-[220px] sm:max-w-none object-contain transition-transform group-hover:scale-[1.01]"
            />
          </div>
        </div>

        {/* Right: Actions (Search Mobile, Saved, Newsletter CTA) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          <button
            onClick={onOpenSearch}
            aria-label="Search"
            className="md:hidden p-1.5 sm:p-2 rounded-sm border border-border-subtle text-ink hover:bg-surface-lowest hover:border-primary transition-colors"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
          </button>

          <button
            onClick={() => alert('Bookmarks feature active: 2 saved stories ready for offline reading.')}
            aria-label="Saved Stories"
            className="hidden sm:flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-sm border border-border-subtle hover:bg-surface-lowest text-xs font-medium text-ink transition-colors"
            title="Saved Reading List"
          >
            <Bookmark className="w-3.5 h-3.5 text-secondary-gold" />
            <span className="hidden md:inline">{t.saved}</span>
            {savedArticlesCount > 0 && (
              <span className="bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {savedArticlesCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenNewsletter}
            className="bg-primary hover:bg-primary-container text-white px-2.5 sm:px-4 py-1.5 rounded-sm text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-subtle"
          >
            <Sparkles className="w-3.5 h-3.5 text-secondary-gold hidden xs:inline" />
            <span>{t.subscribe}</span>
          </button>

          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="bg-red-50 hover:bg-red-100 text-editorial-red border-2 border-editorial-red/40 px-2 sm:px-3 py-1.5 rounded-sm text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs cursor-pointer"
              title="Open Daily Publishing Center (P0 Admin)"
            >
              <span className="w-2 h-2 rounded-full bg-editorial-red animate-ping hidden xs:inline-block"></span>
              <span>Admin Portal</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
