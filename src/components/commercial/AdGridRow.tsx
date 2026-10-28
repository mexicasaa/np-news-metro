import React from 'react';
import { AdSlot } from './AdSlot';
import { isZoneVisible } from '../../services/adService';

interface AdGridRowProps {
  zones: string[];
  className?: string;
  id?: string;
}

/**
 * AdGridRow Component
 * Renders a row of commercial ad cards in a responsive grid
 * (4 columns on desktop, 2 on tablet, 2 on mobile), adapting automatically
 * to only active/visible zones configured in Admin.
 */
export const AdGridRow: React.FC<AdGridRowProps> = ({
  zones,
  className = '',
  id,
}) => {
  const visibleZones = zones.filter((z) => isZoneVisible(z));
  if (visibleZones.length === 0) {
    return null;
  }

  return (
    <section
      id={id}
      aria-label="Commercial Partner Advertisements"
      className={`w-full py-2 ${className}`}
    >
      <div className={`grid gap-3 sm:gap-4 lg:gap-5 items-stretch ${
        visibleZones.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' :
        visibleZones.length === 2 ? 'grid-cols-2 max-w-2xl mx-auto' :
        visibleZones.length === 3 ? 'grid-cols-1 sm:grid-cols-3' :
        'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4'
      }`}>
        {visibleZones.map((zone) => (
          <div key={zone} className="h-full flex flex-col">
            <AdSlot zone={zone as any} variant="card" className="h-full" />
          </div>
        ))}
      </div>
    </section>
  );
};
