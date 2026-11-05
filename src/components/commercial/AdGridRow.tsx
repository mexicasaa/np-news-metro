import React, { useEffect, useState } from 'react';
import { AdSlot } from './AdSlot';
import { isZoneVisible, getAdPlacement, getAdSenseSettings, ActiveAdPlacement } from '../../services/adService';

interface AdGridRowProps {
  zones: string[];
  className?: string;
  id?: string;
}

interface ResolvedAdItem {
  zone: string;
  placement: ActiveAdPlacement;
}

/**
 * AdGridRow Component
 * Renders a row of commercial ad cards in a responsive grid,
 * dynamically adapting column count to ONLY active ads that exist.
 * Directly preloads placements to eliminate async race conditions and flickering.
 */
export const AdGridRow: React.FC<AdGridRowProps> = ({
  zones,
  className = '',
  id,
}) => {
  const [adItems, setAdItems] = useState<ResolvedAdItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

    const resolveActiveZones = async () => {
      const adsense = getAdSenseSettings();

      const results = await Promise.all(
        zones.map(async (zone) => {
          if (!isZoneVisible(zone)) return null;

          const placement = await getAdPlacement(zone);
          if (placement && !(placement as any).isExplicitlyDisabled) {
            return { zone, placement };
          }

          if (placement && (placement as any).isExplicitlyDisabled) {
            return null;
          }

          const zoneConfig = adsense.zones[zone];
          const isZoneAdSenseEnabled = zoneConfig ? zoneConfig.enabled : true;
          const canShowAdSense = adsense.enabled && isZoneAdSenseEnabled && adsense.priority !== 'direct_only';
          if (canShowAdSense) {
            return {
              zone,
              placement: {
                campaignId: `adsense-${zone}`,
                placementId: `adsense-${zone}`,
                advertiserName: 'Sponsored Partner',
                creativeText: '',
                destinationUrl: '#',
                isAdSense: true,
              },
            };
          }

          return null;
        })
      );

      const valid = results.filter((item): item is ResolvedAdItem => item !== null);

      if (isSubscribed) {
        setAdItems(valid);
        setIsReady(true);
      }
    };

    resolveActiveZones();

    const handleUpdate = () => {
      resolveActiveZones();
    };

    window.addEventListener('np_ads_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Periodic 30-second live sync across devices/readers
    const pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        resolveActiveZones();
      }
    }, 30000);

    return () => {
      isSubscribed = false;
      clearInterval(pollInterval);
      window.removeEventListener('np_ads_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [zones.join(',')]);

  if (!isReady || adItems.length === 0) {
    return null;
  }

  return (
    <section
      id={id}
      aria-label="Commercial Partner Advertisements"
      className={`w-full py-2 ${className}`}
    >
      <div
        className={`grid gap-3 sm:gap-4 lg:gap-5 items-start ${
          adItems.length === 1
            ? 'grid-cols-1 max-w-md mx-auto'
            : adItems.length === 2
            ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
            : adItems.length === 3
            ? 'grid-cols-1 sm:grid-cols-3 max-w-5xl mx-auto'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto'
        }`}
      >
        {adItems.map(({ zone, placement }) => (
          <AdSlot
            key={zone}
            zone={zone as any}
            variant="card"
            className="w-full"
            placement={placement}
          />
        ))}
      </div>
    </section>
  );
};
