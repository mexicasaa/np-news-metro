import React, { useState, useRef, useEffect } from 'react';
import { Languages, ChevronDown, Check, Search, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../i18n/translations';
import { SupportedLanguageInfo } from '../../services/translationService';

interface LanguageSelectorProps {
  variant?: 'utility-bar' | 'mobile-drawer' | 'footer';
  className?: string;
  onLanguageChange?: (lang: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'utility-bar',
  className = '',
  onLanguageChange,
}) => {
  const { language, setLanguage, supportedLanguages, isHindi } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchFilter('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      // Focus search input
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchFilter('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const currentLangInfo = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
    setSearchFilter('');
    onLanguageChange?.(code);
  };

  const filteredLanguages = supportedLanguages.filter((l) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase().trim();
    return (
      l.name.toLowerCase().includes(q) ||
      l.nativeName.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q)
    );
  });

  // Top quick languages for fast one-click access
  const primaryQuickCodes: Language[] = ['en', 'hi', 'es', 'fr', 'de', 'zh', 'ja', 'ar'];

  // Mobile Drawer Variant
  if (variant === 'mobile-drawer') {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-ink flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-primary" />
            <span>{isHindi ? 'वेबसाइट भाषा चुनें' : 'Select Website Language'}</span>
          </span>
          <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">
            {currentLangInfo.nativeName}
          </span>
        </div>

        {/* Quick Language Pills */}
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {primaryQuickCodes.map((code) => {
            const langObj = supportedLanguages.find((l) => l.code === code);
            if (!langObj) return null;
            const isSelected = language === code;
            return (
              <button
                key={code}
                onClick={() => handleSelect(code)}
                className={`px-2 py-1.5 rounded text-xs font-semibold text-center transition-all ${
                  isSelected
                    ? 'bg-primary text-white shadow-xs font-bold'
                    : 'bg-surface-container hover:bg-surface-container-high text-ink border border-border-subtle'
                }`}
              >
                <div className="truncate">{langObj.nativeName}</div>
              </button>
            );
          })}
        </div>

        {/* Full selector button toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 bg-surface-container hover:bg-surface-container-high border border-border-subtle rounded-md text-xs font-semibold text-ink transition-colors"
        >
          <span className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-secondary" />
            <span>{isHindi ? 'सभी भाषाएं देखें' : 'View All Supported Languages'} ({supportedLanguages.length})</span>
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="mt-2 p-2 bg-white border border-border-subtle rounded-md shadow-lg max-h-56 overflow-y-auto space-y-1">
            {supportedLanguages.map((l) => {
              const isSelected = language === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => handleSelect(l.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-left transition-colors ${
                    isSelected ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-slate-50 text-ink'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{l.nativeName}</span>
                    <span className="text-[10px] text-ink-muted">({l.name})</span>
                    {l.dir === 'rtl' && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-bold">RTL</span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Footer Variant
  if (variant === 'footer') {
    return (
      <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container hover:bg-surface-container-high border border-border-subtle rounded-md text-xs font-semibold text-ink transition-colors"
          title="Select Language"
        >
          <Languages className="w-3.5 h-3.5 text-secondary" />
          <span>{currentLangInfo.nativeName}</span>
          <ChevronDown className={`w-3 h-3 text-ink-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-border-subtle rounded-lg shadow-xl p-2 z-50 max-h-80 overflow-y-auto">
            <div className="text-[11px] font-bold text-ink-secondary px-2 py-1 mb-1 border-b border-border-subtle">
              {isHindi ? 'भाषा चुनें (Select Language)' : 'Select Website Language'}
            </div>
            {supportedLanguages.map((l) => (
              <button
                key={l.code}
                onClick={() => handleSelect(l.code)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-left transition-colors ${
                  language === l.code ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-slate-50 text-ink'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{l.nativeName}</span>
                  <span className="text-[10px] text-ink-muted">({l.name})</span>
                </div>
                {language === l.code && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default: Utility Bar Variant (Desktop header)
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Selector Trigger Button */}
      <div className="flex items-center bg-surface-container border border-border-subtle rounded-md p-0.5 shadow-2xs">
        {/* Quick Hindi / English direct buttons */}
        <button
          onClick={() => handleSelect('en')}
          className={`px-1.5 py-0.5 rounded-xs text-[10px] font-bold tracking-wider transition-all ${
            language === 'en'
              ? 'bg-primary text-white shadow-xs font-extrabold'
              : 'text-ink-secondary hover:text-primary'
          }`}
          title="Switch to English"
        >
          EN
        </button>
        <button
          onClick={() => handleSelect('hi')}
          className={`px-1.5 py-0.5 rounded-xs text-[11px] font-bold transition-all ${
            language === 'hi'
              ? 'bg-primary text-white shadow-xs font-extrabold'
              : 'text-ink-secondary hover:text-primary'
          }`}
          title="हिंदी में बदलें"
        >
          हिन्दी
        </button>

        {/* More Languages Dropdown Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-xs text-[10px] font-semibold transition-all border-l border-border-subtle ml-0.5 ${
            language !== 'en' && language !== 'hi'
              ? 'bg-primary text-white font-bold shadow-xs'
              : 'text-ink-secondary hover:text-primary'
          }`}
          title="More languages / अन्य भाषाएं"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Languages className="w-3 h-3 flex-shrink-0" />
          <span className="hidden sm:inline max-w-[65px] truncate">
            {language !== 'en' && language !== 'hi' ? currentLangInfo.nativeName : 'More'}
          </span>
          <ChevronDown className={`w-2.5 h-2.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-72 bg-white border border-border-subtle rounded-lg shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle">
            <span className="text-xs font-bold text-ink flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>{isHindi ? 'वेबसाइट भाषा' : 'Website Language'}</span>
            </span>
            <span className="text-[10px] text-ink-muted">
              {supportedLanguages.length} {isHindi ? 'भाषाएं' : 'Languages'}
            </span>
          </div>

          {/* Search Input */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={isHindi ? 'भाषा खोजें...' : 'Search language...'}
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-border-subtle rounded focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white text-ink"
            />
          </div>

          {/* Quick Major Languages Grid */}
          {!searchFilter && (
            <div className="mb-2 pb-2 border-b border-border-subtle">
              <div className="text-[10px] uppercase font-bold text-ink-muted tracking-wider mb-1.5 px-1">
                {isHindi ? 'प्रमुख भाषाएं' : 'Popular Languages'}
              </div>
              <div className="grid grid-cols-4 gap-1">
                {primaryQuickCodes.map((code) => {
                  const l = supportedLanguages.find((x) => x.code === code);
                  if (!l) return null;
                  const isSelected = language === code;
                  return (
                    <button
                      key={code}
                      onClick={() => handleSelect(code)}
                      className={`px-1.5 py-1 rounded text-[11px] font-semibold text-center truncate transition-colors ${
                        isSelected
                          ? 'bg-primary text-white font-bold'
                          : 'bg-slate-100 hover:bg-slate-200 text-ink'
                      }`}
                      title={l.name}
                    >
                      {l.nativeName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Languages Scrollable List */}
          <div className="max-h-52 overflow-y-auto space-y-0.5 pr-0.5">
            {filteredLanguages.map((l) => {
              const isSelected = language === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => handleSelect(l.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-left transition-colors ${
                    isSelected
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'hover:bg-slate-100 text-ink'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs">{l.nativeName}</span>
                    <span className="text-[11px] text-ink-muted">({l.name})</span>
                    {l.dir === 'rtl' && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-bold">
                        RTL
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                </button>
              );
            })}
            {filteredLanguages.length === 0 && (
              <div className="text-center py-4 text-xs text-ink-muted">
                {isHindi ? 'कोई भाषा नहीं मिली' : 'No language found'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
