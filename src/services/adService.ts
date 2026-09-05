import { AdRepository } from '../repositories/supabase/AdRepository';
import { AdvertiserRecord, AdCampaignRecord } from '../repositories/types';

export interface ActiveAdPlacement {
  campaignId: string;
  placementId: string;
  advertiserName: string;
  creativeText: string;
  destinationUrl: string;
  mediaUrl?: string;
  altText?: string;
}

// In-memory cache for ad placements (10m TTL)
const adPlacementCache = new Map<string, { data: ActiveAdPlacement | null; timestamp: number }>();
const AD_CACHE_TTL = 10 * 60 * 1000;

export const getAdPlacement = async (zone: string): Promise<ActiveAdPlacement | null> => {
  const cached = adPlacementCache.get(zone);
  if (cached && Date.now() - cached.timestamp < AD_CACHE_TTL) {
    return cached.data;
  }

  // 1. Try serverless API
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/ads?zone=${encodeURIComponent(zone)}`);
      if (res.ok) {
        const json = await res.json();
        const placement = json?.placement || null;
        adPlacementCache.set(zone, { data: placement, timestamp: Date.now() });
        return placement;
      }
    }
  } catch {}

  // 2. Repository fallback
  const placement = await AdRepository.getInstance().getActivePlacementForZone(zone);
  adPlacementCache.set(zone, { data: placement, timestamp: Date.now() });
  return placement;
};

export const trackAdImpression = (campaignId: string, placementId: string): void => {
  if (!campaignId || !placementId) return;

  // Non-blocking beacon or fetch
  if (typeof window !== 'undefined' && navigator.sendBeacon) {
    const data = JSON.stringify({ campaignId, placementId, type: 'impression' });
    navigator.sendBeacon('/api/ads', data);
  } else {
    AdRepository.getInstance().recordImpression(campaignId, placementId);
  }
};

export const trackAdClick = (campaignId: string, placementId: string): void => {
  if (!campaignId || !placementId) return;

  if (typeof window !== 'undefined' && navigator.sendBeacon) {
    const data = JSON.stringify({ campaignId, placementId, type: 'click' });
    navigator.sendBeacon('/api/ads', data);
  } else {
    AdRepository.getInstance().recordClick(campaignId, placementId);
  }
};

export const getAdvertisersList = async (): Promise<AdvertiserRecord[]> => {
  return AdRepository.getInstance().getAdvertisers();
};

export const getCampaignsList = async (): Promise<AdCampaignRecord[]> => {
  return AdRepository.getInstance().getCampaigns();
};

export const getAdAnalytics = async (campaignId?: string) => {
  return AdRepository.getInstance().getAggregatedMetrics(campaignId);
};
