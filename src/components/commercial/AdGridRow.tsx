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
  const [activeZones, setActiveZones] = useState<string[]>(() =>
    zones.filter((z) => isZoneVisible(z))
  );
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
        const canShowAdSense = adsense.enabled && (zoneConfig ? zoneConfig.enabled : true);
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
    return () => {
      isSubscribed = false;
      window.removeEventListener('np_ads_updated', handleUpdate);
    };
  }, [zones.join(',')]);

  if (!isReady && activeZones.length === 0) {
    return null;
  }

  if (activeZones.length === 0) {
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
            ? 'grid-cols-1 max-w-sm mx-auto'
            : activeZones.length === 2
            ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
            : activeZones.length === 3
            ? 'grid-cols-1 sm:grid-cols-3 max-w-5xl mx-auto'
            : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4'
        }`}
      >
        {activeZones.map((zone) => (
          <div key={zone} className="h-full w-full flex flex-col items-stretch">
            <AdSlot zone={zone as any} variant="card" className="h-full w-full" />
          </div>
        ))}
      </div>
    </section>
  );
};
