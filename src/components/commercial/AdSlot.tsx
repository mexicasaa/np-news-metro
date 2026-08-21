import React from 'react';
import { ExternalLink, Info } from 'lucide-react';
import { mockAdSlots } from '../../data/mockWpData';
import { useLanguage } from '../../context/LanguageContext';

interface AdSlotProps {
  zone: 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7';
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ zone, className = '' }) => {
  const { isHindi } = useLanguage();
  const adConfig = mockAdSlots[zone];

  if (!adConfig || !adConfig.isEnabled) {
    return null;
  }

  // Sidebar Ad (A3) Specific Layout
  if (zone === 'A3') {
    return (
      <div className={`my-4 bg-surface-lowest border border-border-subtle rounded-sm p-3.5 shadow-2xs hover:border-primary/40 transition-all ${className}`} data-ad-zone={zone}>
        <div className="flex items-center justify-between text-[9px] uppercase font-bold text-ink-muted tracking-widest pb-2 border-b border-border-subtle mb-2.5">
          <span className="text-secondary-gold">{isHindi ? 'प्रायोजित साझेदार' : 'Sponsored Partner'}</span>
          <span className="flex items-center gap-0.5 text-ink-muted/70">
            <Info className="w-2.5 h-2.5" />
            <span>{isHindi ? 'विज्ञापन' : 'Ad'}</span>
          </span>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
            {adConfig.advertiserName}
          </span>
          <p className="font-serif text-sm font-bold text-ink leading-snug">
            {adConfig.creativeText}
          </p>
          <a
            href={adConfig.ctaUrl || '#'}
            onClick={(e) => e.preventDefault()}
            className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-primary hover:text-secondary uppercase tracking-wider transition-colors"
          >
            <span>{isHindi ? 'साझेदार पहल देखें' : 'Explore Partner Initiative'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  // Horizontal Banner Ad Layout (A1, A2, A4, A5, A6, A7)
  return (
    <div
      className={`my-2 sm:my-2.5 flex flex-col items-center justify-center ${className}`}
      data-ad-zone={zone}
    >
      <div
        className="w-full bg-surface-lowest border border-border-subtle rounded-sm py-1.5 px-3 sm:py-2 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left transition-all hover:border-primary/40 shadow-2xs max-w-[970px]"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 flex-wrap sm:flex-nowrap">
          <span className="text-[9px] uppercase font-bold text-secondary-gold bg-secondary-gold/10 px-1.5 py-0.5 rounded-xs tracking-wider flex-shrink-0">
            {isHindi ? 'प्रायोजित' : 'Sponsored'}
          </span>
          <div className="min-w-0 text-left">
            <span className="text-[10px] font-bold text-primary mr-1.5 inline">
              {adConfig.advertiserName}:
            </span>
            <span className="text-xs font-serif font-bold text-ink leading-tight">
              {adConfig.creativeText}
            </span>
          </div>
        </div>

        <a
          href={adConfig.ctaUrl || '#'}
          onClick={(e) => e.preventDefault()}
          className="bg-primary hover:bg-primary-container text-white px-2.5 py-1 rounded-xs text-[10px] sm:text-[11px] font-bold uppercase tracking-wider flex-shrink-0 flex items-center gap-1 transition-colors"
        >
          <span>{isHindi ? 'और जानें' : 'Learn More'}</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
};
