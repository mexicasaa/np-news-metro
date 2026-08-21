import React from 'react';
import { Calendar, CloudSun, Globe, Newspaper, Mail, ShieldCheck, Languages } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface UtilityBarProps {
  onSelectEdition?: (edition: string) => void;
  currentEdition?: string;
  onOpenNewsletter?: () => void;
  onNavigate?: (template: string, params?: any) => void;
  onOpenAdmin?: () => void;
}

export const UtilityBar: React.FC<UtilityBarProps> = ({
  onSelectEdition,
  currentEdition = 'National / New Delhi',
  onOpenNewsletter,
  onNavigate,
  onOpenAdmin,
}) => {
  const { language, setLanguage, t, isHindi } = useLanguage();

  return (
    <div className="bg-surface-lowest border-b border-border-subtle text-[11px] text-ink-secondary py-1.5 px-3 sm:px-4 font-sans">
      <div className="max-w-site mx-auto flex items-center justify-between gap-2">
        {/* Left: Date & Edition */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 font-semibold text-ink whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">{t.todayDate}</span>
            <span className="sm:hidden">{isHindi ? '19 अगस्त 2026' : 'Aug 19, 2026'}</span>
          </span>

          <span className="hidden xs:inline-block text-border-strong">•</span>

          {/* Edition Selector */}
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-secondary flex-shrink-0" />
            <select
              aria-label="Select City or National Edition"
              value={currentEdition}
              onChange={(e) => onSelectEdition?.(e.target.value)}
              className="bg-transparent border-none text-ink font-semibold focus:ring-0 cursor-pointer p-0 text-[11px] hover:text-primary transition-colors truncate max-w-[110px] xs:max-w-none"
            >
              <option value="National / New Delhi">{isHindi ? 'नई दिल्ली' : 'New Delhi'}</option>
              <option value="Mumbai Metro">{isHindi ? 'मुंबई' : 'Mumbai'}</option>
              <option value="Bengaluru Urban">{isHindi ? 'बेंगलुरु' : 'Bengaluru'}</option>
              <option value="Chennai Metro">{isHindi ? 'चेन्नई' : 'Chennai'}</option>
              <option value="Kolkata Metro">{isHindi ? 'कोलकाता' : 'Kolkata'}</option>
              <option value="Global / NRI Edition">{isHindi ? 'ग्लोबल' : 'Global'}</option>
            </select>
          </div>

          <span className="hidden md:inline-block text-border-strong">•</span>

          {/* Weather & AQI */}
          <span className="hidden md:flex items-center gap-1.5 text-ink-secondary">
            <CloudSun className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-medium">{t.weatherCity}</span>
            <span className="bg-emerald-50 px-1.5 py-0.2 rounded-xs text-[10px] font-bold text-emerald-800 border border-emerald-200">
              {t.aqiStatus}
            </span>
          </span>
        </div>

        {/* Right: Language Switcher & Quick Editorial Links */}
        <div className="flex items-center gap-2 sm:gap-3 font-semibold flex-shrink-0">
          {/* Prominent Language Switcher Button */}
          <div className="flex items-center bg-surface-container border border-border-subtle rounded-md p-0.5 shadow-2xs">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded-sm text-[10px] font-bold tracking-wider transition-all flex items-center gap-1 ${
                language === 'en'
                  ? 'bg-primary text-white shadow-xs font-extrabold'
                  : 'text-ink-secondary hover:text-primary'
              }`}
              title="Switch to English"
            >
              <span>EN</span>
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-0.5 rounded-sm text-[11px] font-bold transition-all flex items-center gap-1 ${
                language === 'hi'
                  ? 'bg-primary text-white shadow-xs font-extrabold'
                  : 'text-ink-secondary hover:text-primary'
              }`}
              title="हिंदी में बदलें"
            >
              <span>हिंदी</span>
            </button>
          </div>

          <button
            onClick={() => onNavigate?.('static', { page: 'epaper' })}
            className="hidden lg:flex items-center gap-1 hover:text-primary transition-colors text-ink/70"
          >
            <Newspaper className="w-3.5 h-3.5 text-ink-muted" />
            <span>{t.epaper}</span>
          </button>

          <button
            onClick={onOpenNewsletter}
            className="flex items-center gap-1 hover:text-primary transition-colors text-primary font-bold text-[11px]"
          >
            <Mail className="w-3 h-3 text-primary" />
            <span className="hidden xs:inline">{t.morningBriefing}</span>
            <span className="xs:hidden">{isHindi ? 'ब्रीफिंग' : 'Briefing'}</span>
          </button>

          <button
            onClick={() => onNavigate?.('static', { page: 'ethics' })}
            className="hidden sm:flex items-center gap-1 hover:text-primary transition-colors text-ink/70"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t.factCheckDesk}</span>
          </button>

          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-editorial-red border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer"
              title="Open Daily Publishing Center"
            >
              <span>⚡ Admin</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
