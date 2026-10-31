import React, { useEffect, useState } from 'react';
import { AdSlot } from './AdSlot';
import { isZoneVisible, getAdPlacement, getAdSenseSettings } from '../../services/adService';

interface AdGridRowProps {
  zones: string[];
  className?: string;
  id?: string;
}

/**
 * AdGridRow Component
 * Renders a row of commercial ad cards in a responsive grid,
 * dynamically adapting column count to ONLY active ads that exist.
 * If an ad is deleted or closed, its column collapses seamlessly.
 */
export const AdGridRow: React.FC<AdGridRowProps> = ({
  zones,
  className = '',
  id,
}) => {
  const [activeZones, setActiveZones] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

    const resolveActiveZones = async () => {
      const adsense = getAdSenseSettings();
      const valid: string[] = [];

      for (const zone of zones) {
        if (!isZoneVisible(zone)) continue;

        const placement = await getAdPlacement(zone);
        if (placement) {
          valid.push(zone);
          continue;
        }

        const zoneConfig = adsense.zones[zone];
        const isZoneAdSenseEnabled = zoneConfig ? zoneConfig.enabled : true;
        const canShowAdSense = adsense.enabled && isZoneAdSenseEnabled && adsense.priority !== 'direct_only';
        if (canShowAdSense) {
          valid.push(zone);
        }
      }

      if (isSubscribed) {
        setActiveZones(valid);
        setIsReady(true);
      }
    };

    resolveActiveZones();

    const handleUpdate = () => {
      resolveActiveZones();
    };

    window.addEventListener('np_ads_updated', handleUpdate);

    // Periodic 45-second live sync across devices/readers without full reload
    const pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        resolveActiveZones();
      }
    }, 45000);

    return () => {
      isSubscribed = false;
      clearInterval(pollInterval);
      window.removeEventListener('np_ads_updated', handleUpdate);
    };
  }, [zones.join(',')]);

  const handleUnavailableZone = (zone: string) => {
    setActiveZones((prev) => prev.filter((z) => z !== zone));
  };

  if (!isReady || activeZones.length === 0) {
    return null;
  }

  return (
    <section
      id={id}
      aria-label="Commercial Partner Advertisements"
      className={`w-full py-2 ${className}`}
    >
      <div
        className={`grid gap-3 sm:gap-4 lg:gap-5 items-stretch ${
          activeZones.length === 1
            ? 'grid-cols-1 max-w-md mx-auto'
            : activeZones.length === 2
            ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
            : activeZones.length === 3
            ? 'grid-cols-1 sm:grid-cols-3 max-w-5xl mx-auto'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto'
        }`}
      >
        {activeZones.map((zone) => (
          <AdSlot
            key={zone}
            zone={zone as any}
            variant="card"
            className="h-full w-full"
            onUnavailable={() => handleUnavailableZone(zone)}
          />
        ))}
      </div>
    </section>
  );
};
