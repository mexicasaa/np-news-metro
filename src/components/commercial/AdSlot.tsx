import React, { useState, useEffect } from 'react';
import { ExternalLink, Info, Phone } from 'lucide-react';
import { mockAdSlots } from '../../data/mockWpData';
import { useLanguage } from '../../context/LanguageContext';
import { getAdPlacement, trackAdImpression, trackAdClick, ActiveAdPlacement } from '../../services/adService';

interface AdSlotProps {
  zone: 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7';
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ zone, className = '' }) => {
  const { isHindi } = useLanguage();
  const [directAd, setDirectAd] = useState<ActiveAdPlacement | null>(null);

  useEffect(() => {
    let isMounted = true;
    getAdPlacement(zone)
      .then((placement) => {
        if (isMounted && placement) {
          setDirectAd(placement);
          trackAdImpression(placement.campaignId, placement.placementId);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [zone]);

  // Fallback to Google AdSense / static placement configuration if no direct campaign active
  const adConfig = mockAdSlots[zone];
  const isEnabled = directAd ? true : adConfig?.isEnabled;
  if (!isEnabled) {
    return null;
  }

  const advertiserName = directAd ? directAd.advertiserName : adConfig?.advertiserName || 'Sponsored Partner';
  const creativeText = directAd ? directAd.creativeText : adConfig?.creativeText || '';
  const ctaUrl = directAd ? directAd.destinationUrl : (adConfig?.ctaUrl || '#');
  const mediaUrl = directAd?.mediaUrl || adConfig?.creativeUrl;
  const altText = directAd?.altText || advertiserName;

  const isPhoneCta = typeof ctaUrl === 'string' && ctaUrl.startsWith('tel:');
  const isExternalLink = typeof ctaUrl === 'string' && ctaUrl.startsWith('http');

  const handleClick = (e: React.MouseEvent) => {
    if (directAd) {
      trackAdClick(directAd.campaignId, directAd.placementId);
    }
    if (!ctaUrl || ctaUrl === '#') {
      e.preventDefault();
    }
  };

  // Sidebar Ad (A3) Specific Layout - Optimized for Vertical / Portrait Posters
  if (zone === 'A3') {
    return (
      <aside
        className={`my-4 bg-surface-lowest border border-border-subtle rounded-sm p-3.5 shadow-2xs hover:border-primary/40 transition-all ${className}`}
        data-slot={zone}
        aria-label="Sponsored Partner"
      >
        <div className="flex items-center justify-between text-[9px] uppercase font-bold text-ink-muted tracking-widest pb-2 border-b border-border-subtle mb-2.5">
          <span className="text-secondary-gold">{isHindi ? 'प्रायोजित साझेदार' : 'Sponsored Partner'}</span>
          <span className="flex items-center gap-0.5 text-ink-muted/70">
            <Info className="w-2.5 h-2.5" />
            <span>{isHindi ? 'विज्ञापन' : 'Ad'}</span>
          </span>
        </div>

        <div className="space-y-3">
          {mediaUrl && (
            <a
              href={ctaUrl}
              target={isExternalLink ? '_blank' : undefined}
              rel={isExternalLink ? 'noopener noreferrer' : undefined}
              onClick={handleClick}
              className="block group overflow-hidden rounded-xs bg-slate-50 border border-border-subtle/80 hover:border-primary/50 transition-all shadow-2xs"
              title={advertiserName}
            >
              <img
                src={mediaUrl}
                alt={altText}
                className="w-full h-auto max-h-[540px] object-contain block mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
                loading="lazy"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.endsWith('/uploads/shastri-patanjali-chikitsalaya.jpg')) {
                    target.src = '/uploads/shastri-patanjali-chikitsalaya.jpg';
                  }
                }}
              />
            </a>
          )}

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary block leading-snug">
              {advertiserName}
            </span>
            {creativeText && (
              <p className="font-serif text-xs font-semibold text-ink leading-relaxed">
                {creativeText}
              </p>
            )}

            {ctaUrl && ctaUrl !== '#' && (
              <a
                href={ctaUrl}
                target={isExternalLink ? '_blank' : undefined}
                rel={isExternalLink ? 'noopener noreferrer' : undefined}
                onClick={handleClick}
                className="inline-flex items-center justify-center gap-1.5 w-full mt-2.5 py-2 px-3 bg-primary hover:bg-primary-container text-white text-[11px] font-bold uppercase tracking-wider rounded-xs shadow-2xs transition-colors cursor-pointer"
              >
                {isPhoneCta ? (
                  <>
                    <Phone className="w-3.5 h-3.5 text-secondary-gold" />
                    <span>{isHindi ? 'कॉल / ऑर्डर करें (9871937299)' : 'Call to Order (9871937299)'}</span>
                  </>
                ) : (
                  <>
                    <span>{isHindi ? 'साझेदार पहल देखें' : 'Explore Partner Initiative'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </>
                )}
              </a>
            )}
          </div>
        </div>
      </aside>
    );
  }

  // In-Article Native Placement (A4) with Vertical Poster Support
  if (zone === 'A4' && mediaUrl) {
    return (
      <div
        className={`my-6 bg-surface-lowest border border-border-subtle rounded-sm p-3.5 sm:p-4 shadow-2xs hover:border-primary/40 transition-all max-w-[760px] mx-auto ${className}`}
        data-slot={zone}
      >
        <div className="flex items-center justify-between text-[9px] uppercase font-bold text-ink-muted tracking-widest pb-2 border-b border-border-subtle mb-3">
          <span className="text-secondary-gold">{isHindi ? 'प्रायोजित विज्ञापन' : 'Sponsored Feature'}</span>
          <span className="flex items-center gap-0.5 text-ink-muted/70">
            <Info className="w-2.5 h-2.5" />
            <span>{isHindi ? 'विज्ञापन' : 'Ad'}</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <a
            href={ctaUrl}
            target={isExternalLink ? '_blank' : undefined}
            rel={isExternalLink ? 'noopener noreferrer' : undefined}
            onClick={handleClick}
            className="w-full sm:w-44 flex-shrink-0 group overflow-hidden rounded-xs bg-slate-50 border border-border-subtle/80 hover:border-primary/50 transition-all shadow-2xs"
            title={advertiserName}
          >
            <img
              src={mediaUrl}
              alt={altText}
              className="w-full h-auto max-h-[300px] object-contain block mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith('/uploads/shastri-patanjali-chikitsalaya.jpg')) {
                  target.src = '/uploads/shastri-patanjali-chikitsalaya.jpg';
                }
              }}
            />
          </a>

          <div className="flex-1 min-w-0 flex flex-col justify-between h-full space-y-2 text-center sm:text-left">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-1">
                {advertiserName}
              </span>
              <p className="font-serif text-sm font-semibold text-ink leading-relaxed">
                {creativeText}
              </p>
            </div>

            {ctaUrl && ctaUrl !== '#' && (
              <a
                href={ctaUrl}
                target={isExternalLink ? '_blank' : undefined}
                rel={isExternalLink ? 'noopener noreferrer' : undefined}
                onClick={handleClick}
                className="inline-flex items-center justify-center gap-1.5 self-center sm:self-start mt-2 py-2 px-4 bg-primary hover:bg-primary-container text-white text-[11px] font-bold uppercase tracking-wider rounded-xs shadow-2xs transition-colors cursor-pointer"
              >
                {isPhoneCta ? (
                  <>
                    <Phone className="w-3.5 h-3.5 text-secondary-gold" />
                    <span>{isHindi ? 'कॉल करें: 9871937299' : 'Call: 9871937299'}</span>
                  </>
                ) : (
                  <>
                    <span>{isHindi ? 'और जानें' : 'Learn More'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </>
                )}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Horizontal Banner Ad Layout (A1, A2, A5, A6, A7, or text fallback)
  return (
    <div
      className={`my-2 sm:my-2.5 flex flex-col items-center justify-center ${className}`}
      data-slot={zone}
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
              {advertiserName}:
            </span>
            <span className="text-xs font-serif font-bold text-ink leading-tight">
              {creativeText}
            </span>
          </div>
        </div>

        <a
          href={ctaUrl}
          target={isExternalLink ? '_blank' : undefined}
          rel={isExternalLink ? 'noopener noreferrer' : undefined}
          onClick={handleClick}
          className="bg-primary hover:bg-primary-container text-white px-2.5 py-1 rounded-xs text-[10px] sm:text-[11px] font-bold uppercase tracking-wider flex-shrink-0 flex items-center gap-1 transition-colors"
        >
          {isPhoneCta ? (
            <>
              <Phone className="w-2.5 h-2.5" />
              <span>{isHindi ? 'कॉल करें' : 'Call Now'}</span>
            </>
          ) : (
            <>
              <span>{isHindi ? 'और जानें' : 'Learn More'}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </>
          )}
        </a>
      </div>
    </div>
  );
};
