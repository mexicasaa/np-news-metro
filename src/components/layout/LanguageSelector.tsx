import React from 'react';
import { Languages, Check, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../i18n/translations';

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
  const { language, setLanguage, isHindi } = useLanguage();

  const handleSelect = (code: Language) => {
    setLanguage(code);
    onLanguageChange?.(code);
  };

  // 1. Mobile Drawer Variant: High-contrast touch-friendly dual buttons
  if (variant === 'mobile-drawer') {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-ink flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-primary" />
            <span>{isHindi ? 'भाषा चुनें (Language)' : 'Select Language / भाषा'}</span>
          </span>
          <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">
            {language === 'hi' ? 'हिन्दी सक्रिय' : 'English Active'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleSelect('en')}
            className={`py-2 px-3 rounded text-sm font-semibold flex items-center justify-center gap-2 border transition-all ${
              language === 'en'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>English</span>
            {language === 'en' && <Check className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={() => handleSelect('hi')}
            className={`py-2 px-3 rounded text-sm font-semibold flex items-center justify-center gap-2 border transition-all ${
              language === 'hi'
                ? 'bg-primary text-white border-primary shadow-sm font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>हिन्दी</span>
            {language === 'hi' && <Check className="w-4 h-4 text-emerald-300" />}
          </button>
        </div>
      </div>
    );
  }

  // 2. Footer Variant: Sleek dark toggle
  if (variant === 'footer') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <Globe className="w-4 h-4 text-slate-400" />
        <span className="text-xs text-slate-300 font-medium">
          {isHindi ? 'वेबसाइट भाषा:' : 'Language:'}
        </span>
        <div className="inline-flex items-center bg-slate-800 rounded p-0.5 border border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => handleSelect('en')}
            className={`px-3 py-1 rounded transition-colors text-xs ${
              language === 'en'
                ? 'bg-white text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Switch website to English"
          >
            English
          </button>
          <button
            type="button"
            onClick={() => handleSelect('hi')}
            className={`px-3 py-1 rounded transition-colors text-xs ${
              language === 'hi'
                ? 'bg-primary text-white font-bold shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
            title="वेबसाइट हिन्दी में पढ़ें"
          >
            हिन्दी
          </button>
        </div>
      </div>
    );
  }

  // 3. Desktop Utility Bar Variant: Compact segmented switcher
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="inline-flex items-center bg-slate-100 rounded p-0.5 border border-slate-300/80 text-[11px] shadow-2xs">
        <button
          type="button"
          onClick={() => handleSelect('en')}
          className={`px-2.5 py-0.5 rounded-xs transition-all duration-150 ${
            language === 'en'
              ? 'bg-slate-900 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
          title="Switch website to English"
        >
          English
        </button>

        <button
          type="button"
          onClick={() => handleSelect('hi')}
          className={`px-2.5 py-0.5 rounded-xs transition-all duration-150 ${
            language === 'hi'
              ? 'bg-primary text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-primary hover:bg-slate-200/60'
          }`}
          title="वेबसाइट हिन्दी में पढ़ें"
        >
          हिन्दी
        </button>
      </div>
    </div>
  );
};
