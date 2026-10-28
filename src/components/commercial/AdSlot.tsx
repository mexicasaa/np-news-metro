import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Info, Phone } from 'lucide-react';
import { mockAdSlots } from '../../data/mockWpData';
import { useLanguage } from '../../context/LanguageContext';
import { 
  getAdPlacement, 
  trackAdImpression, 
  trackAdClick, 
  ActiveAdPlacement, 
  getAdSenseSettings, 
  AdSenseSettings,
  isZoneVisible
} from '../../services/adService';
import { DEFAULT_FALLBACK_IMAGE } from '../../utils/imageFallback';

export interface AdSlotProps {
  zone: 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7' | 'A8' | string;
  className?: string;
  variant?: 'banner' | 'card' | 'sidebar' | 'inline';
}

export const AdSlot: React.FC<AdSlotProps> = ({
  zone,
  className = '',
  variant,
}) => {
  const { isHindi } = useLanguage();
  const [directAd, setDirectAd] = useState<ActiveAdPlacement | null>(null);
  const [adSenseSettings, setAdSenseSettings] = useState<AdSenseSettings>(getAdSenseSettings());
  const [adSenseFailed, setAdSenseFailed] = useState<boolean>(false);
  const insRef = useRef<HTMLModElement | null>(null);

  const fetchPlacement = () => {
    getAdPlacement(zone)
      .then((placement) => {
        setDirectAd(placement);
        if (placement) {
          trackAdImpression(placement.campaignId, placement.placementId);
        }
      })
      .catch(() => {});
    setAdSenseSettings(getAdSenseSettings());
  };

  useEffect(() => {
    fetchPlacement();

    // Listen for real-time ad updates from Admin panel or other tabs
    const handleUpdate = () => {
      fetchPlacement();
      setAdSenseFailed(false);
    };

    window.addEventListener('np_ads_updated', handleUpdate);
    return () => {
      window.removeEventListener('np_ads_updated', handleUpdate);
    };
  }, [zone]);

  // Determine AdSense vs Direct priority
  const zoneConfig = adSenseSettings.zones[zone];
  const isAdSenseGloballyEnabled = adSenseSettings.enabled;
  const isAdSenseZoneEnabled = zoneConfig ? zoneConfig.enabled : true;
  const canShowAdSense = isAdSenseGloballyEnabled && isAdSenseZoneEnabled && !adSenseFailed;

  let shouldShowAdSense = false;
  if (adSenseSettings.priority === 'adsense_only') {
    shouldShowAdSense = canShowAdSense;
  } else if (adSenseSettings.priority === 'adsense_first') {
    shouldShowAdSense = canShowAdSense;
  } else if (adSenseSettings.priority === 'direct_only') {
    shouldShowAdSense = false;
  } else {
    // direct_first (default recommended)
    shouldShowAdSense = !directAd && canShowAdSense;
  }

  // Google AdSense Push Effect with React 18 Double-Push Protection
  useEffect(() => {
    if (shouldShowAdSense && insRef.current) {
      const status = insRef.current.getAttribute('data-adsbygoogle-status');
      if (!status) {
        try {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch (err) {
          console.warn('[AdSense] Push notice for zone', zone, err);
        }
      }

      // Fallback monitor: if AdSense is blocked by ad-blocker or unfilled after 2.5s, fallback to direct ad
      const timer = setTimeout(() => {
        if (insRef.current) {
          const isUnfilled = insRef.current.getAttribute('data-ad-status') === 'unfilled';
          const hasChildren = insRef.current.children.length > 0;
          if (isUnfilled || (!hasChildren && !(window as any).adsbygoogle)) {
            setAdSenseFailed(true);
          }
        }
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [shouldShowAdSense, zone]);

  // Check if zone is visible (Admin toggle)
  if (!isZoneVisible(zone)) {
    return null;
  }

  // Active Direct Campaign Details
  const adConfig = mockAdSlots[zone];
  const isEnabled = shouldShowAdSense || (directAd ? true : (isZoneVisible(zone) && adConfig?.isEnabled));
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

  /* ======================================================================
     CASE 1: Render Google AdSense Unit
     ====================================================================== */
  if (shouldShowAdSense) {
    const isCard = variant === 'card' || variant === 'sidebar';
    return (
      <div
        className={`bg-white dark:bg-surface-lowest border border-border-subtle rounded-md p-4 sm:p-5 shadow-xs transition-all ${
          isCard ? 'h-full flex flex-col justify-between min-h-[340px]' : 'min-h-[120px] w-full max-w-[970px] mx-auto'
        } ${className}`}
        data-slot={zone}
        data-provider="adsense"
      >
        <div className="flex items-center justify-between text-[10px] sm:text-xs uppercase font-bold text-ink-muted tracking-wider pb-2.5 border-b border-border-subtle mb-3">
          <span className="text-secondary-gold font-sans font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-gold inline-block"></span>
            {isHindi ? 'प्रायोजित साझेदार' : 'SPONSORED PARTNER'}
          </span>
          <span className="flex items-center gap-1 text-ink-muted/70 font-mono text-[10px] sm:text-[11px] font-semibold">
            <Info className="w-3.5 h-3.5" />
            <span>{isHindi ? 'विज्ञापन' : 'AD'}</span>
          </span>
        </div>

        <div className="w-full flex-1 flex items-center justify-center overflow-hidden">
          <ins
            ref={insRef}
            className="adsbygoogle block w-full text-center"
            style={{ display: 'block', minHeight: isCard ? '280px' : '90px' }}
            data-ad-client={adSenseSettings.clientId}
            data-ad-slot={zoneConfig?.slotId || '1029384756'}
            data-ad-format={zoneConfig?.format || (isCard ? 'rectangle' : 'auto')}
            data-full-width-responsive="true"
            data-ad-test={adSenseSettings.testMode ? 'on' : undefined}
          />
        </div>
      </div>
    );
  }

  /* ======================================================================
     CASE 2: Card Layout for 4-in-a-row multi-slot ad strips & grid cards
     ====================================================================== */
  if (variant === 'card') {
    return (
      <div
        className={`bg-white dark:bg-surface-lowest border border-border-subtle hover:border-primary/50 rounded-md p-3 sm:p-4 lg:p-5 shadow-xs hover:shadow-subtle transition-all duration-200 flex flex-col justify-between h-full group ${className}`}
        data-slot={zone}
        aria-label={`Sponsored: ${advertiserName}`}
      >
        <div className="flex-1 flex flex-col">
          {/* Compliant Ad Header */}
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] lg:text-xs uppercase font-bold text-ink-muted tracking-wider pb-2 border-b border-border-subtle mb-2.5">
            <span className="text-secondary-gold font-sans font-bold flex items-center gap-1 sm:gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-gold inline-block flex-shrink-0"></span>
              <span className="truncate">{isHindi ? 'प्रायोजित साझेदार' : 'SPONSORED PARTNER'}</span>
            </span>
            <span className="flex items-center gap-1 text-ink-muted/70 font-mono text-[9px] sm:text-[10px] lg:text-[11px] font-semibold flex-shrink-0">
              <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{isHindi ? 'विज्ञापन' : 'AD'}</span>
            </span>
          </div>

          {/* Media Creative Image: Natural Responsive Sizing with Max Boundaries */}
          {mediaUrl ? (
            <a
              href={ctaUrl}
              target={isExternalLink ? '_blank' : undefined}
              rel={isExternalLink ? 'noopener noreferrer' : undefined}
              onClick={handleClick}
              className="block group/img overflow-hidden rounded-xs bg-white border border-border-subtle/80 hover:border-primary/40 transition-all mb-2 flex-shrink-0"
              title={advertiserName}
            >
              <img
                src={mediaUrl}
                alt={altText}
                className="w-full h-auto max-h-[220px] sm:max-h-[300px] md:max-h-[380px] lg:max-h-[460px] object-contain block mx-auto transition-transform duration-300 group-hover/img:scale-[1.02]"
                loading="lazy"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (zone === 'A3' && !target.src.endsWith('/uploads/ads/suresh-chand-agarwal-memorial.png')) {
                    target.src = '/uploads/ads/suresh-chand-agarwal-memorial.png';
                  } else if (zone === 'A4' && !target.src.endsWith('/uploads/ads/shastri-patanjali-chikitsalaya.jpg')) {
                    target.src = '/uploads/ads/shastri-patanjali-chikitsalaya.jpg';
                  } else if (target.src !== DEFAULT_FALLBACK_IMAGE) {
                    target.src = DEFAULT_FALLBACK_IMAGE;
                  }
                }}
              />
            </a>
          ) : (
            <div className="w-full py-5 px-3 bg-gradient-to-br from-primary/10 via-surface-container to-secondary-gold/15 rounded-xs border border-border-subtle/70 flex flex-col items-center justify-center mb-2 text-center flex-shrink-0">
              <div className="w-7 h-7 rounded-full bg-secondary-gold/20 flex items-center justify-center mb-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary-gold inline-block"></span>
              </div>
              <span className="font-serif font-bold text-xs sm:text-sm text-primary uppercase tracking-wider line-clamp-2">
                {advertiserName}
              </span>
              <span className="text-[10px] text-ink-muted mt-0.5 font-sans">Official Partner Initiative</span>
            </div>
          )}

          {/* Content Details: Adjusts dynamically based on image height */}
          <div className="space-y-1 mb-2 mt-1 flex-1 flex flex-col justify-start">
            <h4 className="font-sans font-bold text-xs sm:text-sm lg:text-base text-ink block leading-snug line-clamp-2 hover:text-primary transition-colors">
              {advertiserName}
            </h4>
            {creativeText && (
              <p className="font-serif text-[11px] sm:text-xs lg:text-[13px] text-ink-secondary leading-relaxed line-clamp-2 mt-0.5">
                {creativeText}
              </p>
            )}
          </div>
        </div>

        {/* CTA Button pinned to bottom */}
        {ctaUrl && ctaUrl !== '#' && (
          <a
            href={ctaUrl}
            target={isExternalLink ? '_blank' : undefined}
            rel={isExternalLink ? 'noopener noreferrer' : undefined}
            onClick={handleClick}
            className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 sm:py-2 px-2.5 sm:px-3.5 bg-primary hover:bg-primary-container text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-xs shadow-2xs transition-colors cursor-pointer mt-2.5 flex-shrink-0"
          >
            {isPhoneCta ? (
              <>
                <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-secondary-gold" />
                <span>{isHindi ? 'कॉल करें' : 'Call to Order'}</span>
              </>
            ) : (
              <>
                <span>{isHindi ? 'और जानें' : (directAd?.ctaText || 'Learn More')}</span>
                <ExternalLink className="w-3 h-3" />
              </>
            )}
          </a>
        )}
      </div>
    );
  }

  /* ======================================================================
     CASE 3: Sidebar Vertical Poster (A3 / variant='sidebar')
     ====================================================================== */
  if (variant === 'sidebar' || (!variant && zone === 'A3')) {
    return (
      <aside
        className={`my-3 sm:my-4 bg-white dark:bg-surface-lowest border border-border-subtle rounded-md p-3.5 sm:p-5 shadow-xs hover:border-primary/40 transition-all ${className}`}
        data-slot={zone}
        aria-label="Sponsored Partner"
      >
        <div className="flex items-center justify-between text-[10px] sm:text-xs uppercase font-bold text-ink-muted tracking-wider pb-2 border-b border-border-subtle mb-3">
          <span className="text-secondary-gold font-sans font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-gold inline-block"></span>
            {isHindi ? 'प्रायोजित साझेदार' : 'SPONSORED PARTNER'}
          </span>
          <span className="flex items-center gap-1 text-ink-muted/70 font-mono text-[10px] sm:text-[11px] font-semibold">
            <Info className="w-3.5 h-3.5" />
            <span>{isHindi ? 'विज्ञापन' : 'AD'}</span>
          </span>
        </div>

        <div className="space-y-3">
          {mediaUrl && (
            <a
              href={ctaUrl}
              target={isExternalLink ? '_blank' : undefined}
              rel={isExternalLink ? 'noopener noreferrer' : undefined}
              onClick={handleClick}
              className="block group overflow-hidden rounded-xs bg-white border border-border-subtle/80 hover:border-primary/50 transition-all shadow-2xs"
              title={advertiserName}
            >
              <img
                src={mediaUrl}
                alt={altText}
                className="w-full h-auto max-h-[460px] sm:max-h-[520px] lg:max-h-[580px] object-contain block mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
                loading="lazy"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.endsWith('/uploads/ads/suresh-chand-agarwal-memorial.png')) {
                    target.src = '/uploads/ads/suresh-chand-agarwal-memorial.png';
                  } else if (target.src !== DEFAULT_FALLBACK_IMAGE) {
                    target.src = DEFAULT_FALLBACK_IMAGE;
                  }
                }}
              />
            </a>
          )}

          <div className="space-y-1">
            <h4 className="font-sans font-bold text-sm sm:text-base text-ink block leading-snug">
              {advertiserName}
            </h4>
            {creativeText && (
              <p className="font-serif text-xs sm:text-[13px] text-ink-secondary leading-relaxed">
                {creativeText}
              </p>
            )}

            {ctaUrl && ctaUrl !== '#' && (
              <a
                href={ctaUrl}
                target={isExternalLink ? '_blank' : undefined}
                rel={isExternalLink ? 'noopener noreferrer' : undefined}
                onClick={handleClick}
                className="inline-flex items-center justify-center gap-1.5 w-full mt-2.5 py-2 px-3.5 bg-primary hover:bg-primary-container text-white text-xs font-bold uppercase tracking-wider rounded-xs shadow-2xs transition-colors cursor-pointer"
              >
                {isPhoneCta ? (
                  <>
                    <Phone className="w-3.5 h-3.5 text-secondary-gold" />
                    <span>{isHindi ? 'कॉल / ऑर्डर करें (9871937299)' : 'Call to Order (9871937299)'}</span>
                  </>
                ) : (
                  <>
                    <span>{isHindi ? 'साझेदार पहल देखें' : (directAd?.ctaText || 'Explore Partner Initiative')}</span>
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

  /* ======================================================================
     CASE 4: In-Article Native Placement (A4 / variant='inline')
     ====================================================================== */
  if (variant === 'inline' || (!variant && zone === 'A4' && mediaUrl)) {
    return (
      <div
        className={`my-6 bg-white dark:bg-surface-lowest border border-border-subtle rounded-md p-4 sm:p-5 shadow-xs hover:border-primary/40 transition-all max-w-[820px] mx-auto ${className}`}
        data-slot={zone}
      >
        <div className="flex items-center justify-between text-[10px] sm:text-xs uppercase font-bold text-ink-muted tracking-wider pb-2.5 border-b border-border-subtle mb-3">
          <span className="text-secondary-gold font-sans font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-gold inline-block"></span>
            {isHindi ? 'प्रायोजित साझेदार' : 'SPONSORED PARTNER'}
          </span>
          <span className="flex items-center gap-1 text-ink-muted/70 font-mono text-[10px] sm:text-[11px] font-semibold">
            <Info className="w-3.5 h-3.5" />
            <span>{isHindi ? 'विज्ञापन' : 'AD'}</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <a
            href={ctaUrl}
            target={isExternalLink ? '_blank' : undefined}
            rel={isExternalLink ? 'noopener noreferrer' : undefined}
            onClick={handleClick}
            className="w-full sm:w-60 flex-shrink-0 group overflow-hidden rounded-xs bg-white border border-border-subtle/80 hover:border-primary/50 transition-all shadow-2xs"
            title={advertiserName}
          >
            <img
              src={mediaUrl}
              alt={altText}
              className="w-full h-auto max-h-[300px] sm:max-h-[360px] object-contain block mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith('/uploads/ads/shastri-patanjali-chikitsalaya.jpg')) {
                  target.src = '/uploads/ads/shastri-patanjali-chikitsalaya.jpg';
                } else if (target.src !== DEFAULT_FALLBACK_IMAGE) {
                  target.src = DEFAULT_FALLBACK_IMAGE;
                }
              }}
            />
          </a>

          <div className="flex-1 min-w-0 flex flex-col justify-between h-full space-y-2 text-center sm:text-left">
            <div>
              <h4 className="font-sans font-bold text-sm sm:text-base text-ink block mb-1">
                {advertiserName}
              </h4>
              <p className="font-serif text-xs sm:text-sm font-semibold text-ink leading-relaxed">
                {creativeText}
              </p>
            </div>

            {ctaUrl && ctaUrl !== '#' && (
              <a
                href={ctaUrl}
                target={isExternalLink ? '_blank' : undefined}
                rel={isExternalLink ? 'noopener noreferrer' : undefined}
                onClick={handleClick}
                className="inline-flex items-center justify-center gap-1.5 self-center sm:self-start mt-2 py-2 px-4 bg-primary hover:bg-primary-container text-white text-xs font-bold uppercase tracking-wider rounded-xs shadow-2xs transition-colors cursor-pointer"
              >
                {isPhoneCta ? (
                  <>
                    <Phone className="w-3.5 h-3.5 text-secondary-gold" />
                    <span>{isHindi ? 'कॉल करें: 9871937299' : 'Call: 9871937299'}</span>
                  </>
                ) : (
                  <>
                    <span>{isHindi ? 'और जानें' : (directAd?.ctaText || 'Learn More')}</span>
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

  /* ======================================================================
     CASE 5: Horizontal Banner Ad Layout (A1, A2, A5, A6, A7, or text fallback)
     ====================================================================== */
  return (
    <div
      className={`my-3 sm:my-3.5 flex flex-col items-center justify-center ${className}`}
      data-slot={zone}
    >
      <div
        className="w-full bg-white dark:bg-surface-lowest border border-border-subtle rounded-md py-2 px-3 sm:py-2.5 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left transition-all hover:border-primary/40 shadow-xs max-w-[970px]"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 flex-wrap sm:flex-nowrap">
          <span className="text-[10px] uppercase font-bold text-secondary-gold bg-secondary-gold/10 px-2 py-0.5 rounded-xs tracking-wider flex-shrink-0">
            {isHindi ? 'प्रायोजित' : 'SPONSORED'}
          </span>
          <div className="min-w-0 text-left">
            <span className="text-xs font-bold text-primary mr-1.5 inline">
              {advertiserName}:
            </span>
            <span className="text-xs sm:text-sm font-serif font-bold text-ink leading-tight">
              {creativeText}
            </span>
          </div>
        </div>

        <a
          href={ctaUrl}
          target={isExternalLink ? '_blank' : undefined}
          rel={isExternalLink ? 'noopener noreferrer' : undefined}
          onClick={handleClick}
          className="bg-primary hover:bg-primary-container text-white px-3 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider flex-shrink-0 flex items-center gap-1 transition-colors"
        >
          {isPhoneCta ? (
            <>
              <Phone className="w-3 h-3" />
              <span>{isHindi ? 'कॉल करें' : 'Call Now'}</span>
            </>
          ) : (
            <>
              <span>{isHindi ? 'और जानें' : (directAd?.ctaText || 'Learn More')}</span>
              <ExternalLink className="w-3 h-3" />
            </>
          )}
        </a>
      </div>
    </div>
  );
};
