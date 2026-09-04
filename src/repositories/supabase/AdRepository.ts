import { supabase } from '../../lib/supabase';
import { AdvertiserRecord, AdCampaignRecord, AdPlacementRecord } from '../types';

export class AdRepository {
  private static instance: AdRepository;

  public static getInstance(): AdRepository {
    if (!AdRepository.instance) {
      AdRepository.instance = new AdRepository();
    }
    return AdRepository.instance;
  }

  /**
   * Fetch active first-party campaign placements for a given zone (A1 to A7).
   * Note: If none active, caller falls back to Google AdSense slot.
   */
  public async getActivePlacementForZone(zone: string): Promise<{
    campaignId: string;
    placementId: string;
    advertiserName: string;
    creativeText: string;
    destinationUrl: string;
    mediaUrl?: string;
    altText?: string;
  } | null> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('ad_placements')
        .select(`
          id, zone, campaign_id,
          campaigns (
            id, name, start_at, end_at, status,
            advertisers (name),
            ad_creatives (id, type, headline, destination_url, alt_text, media_id, media(public_url))
          )
        `)
        .eq('zone', zone)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (error || !data || !data.campaigns) return null;

      const campaign: any = data.campaigns;
      if (campaign.status !== 'active') return null;
      if (campaign.start_at && campaign.start_at > now) return null;
      if (campaign.end_at && campaign.end_at < now) return null;

      const creative = Array.isArray(campaign.ad_creatives) && campaign.ad_creatives.length > 0
        ? campaign.ad_creatives[0]
        : null;

      if (!creative) return null;

      return {
        campaignId: campaign.id,
        placementId: data.id,
        advertiserName: campaign.advertisers?.name || 'Sponsored Partner',
        creativeText: creative.headline || campaign.name,
        destinationUrl: creative.destination_url || '#',
        mediaUrl: creative.media?.public_url,
        altText: creative.alt_text || 'Sponsored advertisement',
      };
    } catch {
      return null;
    }
  }

  /**
   * Increment daily aggregated impressions for first-party ad campaign (never raw logs)
   */
  public async recordImpression(campaignId: string, placementId: string): Promise<void> {
    if (!campaignId || !placementId) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      await supabase.rpc('increment_ad_metric', {
        p_campaign_id: campaignId,
        p_placement_id: placementId,
        p_date: today,
        p_impressions: 1,
        p_clicks: 0,
      });
    } catch (err) {
      console.warn('Ad impression aggregation notice:', err);
    }
  }

  /**
   * Increment daily aggregated clicks for first-party ad campaign
   */
  public async recordClick(campaignId: string, placementId: string): Promise<void> {
    if (!campaignId || !placementId) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      await supabase.rpc('increment_ad_metric', {
        p_campaign_id: campaignId,
        p_placement_id: placementId,
        p_date: today,
        p_impressions: 0,
        p_clicks: 1,
      });
    } catch (err) {
      console.warn('Ad click aggregation notice:', err);
    }
  }

  /**
   * List all advertisers for admin
   */
  public async getAdvertisers(): Promise<AdvertiserRecord[]> {
    try {
      const { data, error } = await supabase
        .from('advertisers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map((d) => ({
        id: d.id,
        name: d.name,
        company: d.company,
        contactEmail: d.contact_email,
        status: d.status,
        createdAt: d.created_at || undefined,
      }));
    } catch {
      return [];
    }
  }

  /**
   * List all campaigns with placements and creatives
   */
  public async getCampaigns(): Promise<AdCampaignRecord[]> {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          id, advertiser_id, name, start_at, end_at, status, created_at,
          ad_creatives (id, campaign_id, type, media_id, destination_url, alt_text, headline, created_at)
        `)
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map((c: any) => ({
        id: c.id,
        advertiserId: c.advertiser_id,
        name: c.name,
        startAt: c.start_at,
        endAt: c.end_at,
        status: c.status,
        createdAt: c.created_at || undefined,
        creatives: Array.isArray(c.ad_creatives)
          ? c.ad_creatives.map((cr: any) => ({
              id: cr.id,
              campaignId: cr.campaign_id,
              type: cr.type,
              mediaId: cr.media_id,
              destinationUrl: cr.destination_url,
              altText: cr.alt_text,
              headline: cr.headline,
              createdAt: cr.created_at || undefined,
            }))
          : [],
      }));
    } catch {
      return [];
    }
  }

  /**
   * Fetch daily aggregated metrics for campaigns
   */
  public async getAggregatedMetrics(campaignId?: string): Promise<Array<{
    campaignId: string;
    placementId: string;
    date: string;
    impressions: number;
    clicks: number;
  }>> {
    try {
      let query = supabase
        .from('ad_analytics_daily')
        .select('campaign_id, placement_id, date, impressions, clicks')
        .order('date', { ascending: false })
        .limit(30);

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;
      if (error || !data) return [];
      return data.map((r: any) => ({
        campaignId: r.campaign_id,
        placementId: r.placement_id,
        date: r.date,
        impressions: Number(r.impressions) || 0,
        clicks: Number(r.clicks) || 0,
      }));
    } catch {
      return [];
    }
  }
}
