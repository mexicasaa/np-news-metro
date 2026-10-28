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
   * Fetch active first-party campaign placements for a given zone (A1 to A8).
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
    isExplicitlyDisabled?: boolean;
  } | null> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('ad_placements')
        .select(`
          id, zone, campaign_id, is_active,
          campaigns (
            id, name, start_at, end_at, status,
            advertisers (name),
            ad_creatives (id, type, headline, destination_url, alt_text, media_id, media(public_url))
          )
        `)
        .eq('zone', zone)
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;

      // If placement is explicitly closed/disabled in DB
      if (data.is_active === false) {
        return { isExplicitlyDisabled: true } as any;
      }

      if (!data.campaigns) return null;

      const campaign: any = data.campaigns;
      if (campaign.status !== 'active') {
        return { isExplicitlyDisabled: true } as any;
      }
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
   * Toggle a zone open or closed in Supabase Database.
   * Updates ad_placements (is_active) and campaigns (status: active/paused).
   */
  public async toggleZoneStatus(
    zone: string,
    isActive: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: existing } = await supabase
        .from('ad_placements')
        .select('id, campaign_id')
        .eq('zone', zone);

      if (existing && existing.length > 0) {
        // Update all placements for this zone
        await supabase
          .from('ad_placements')
          .update({ is_active: isActive })
          .eq('zone', zone);

        // Update corresponding campaigns
        for (const p of existing) {
          if (p.campaign_id) {
            await supabase
              .from('campaigns')
              .update({ status: isActive ? 'active' : 'paused' })
              .eq('id', p.campaign_id);
          }
        }
      } else {
        // If no placement row exists yet for this zone, create one to persist the open/closed state
        await supabase.from('ad_placements').insert({
          zone,
          is_active: isActive,
        });
      }

      return { success: true };
    } catch (err: any) {
      console.error('Failed to toggle zone status in Supabase:', err);
      return { success: false, error: err?.message };
    }
  }

  /**
   * Get all ad placements currently configured in Supabase.
   */
  public async getAllPlacements(): Promise<Array<{ id: string; zone: string; is_active: boolean; campaign_id: string | null }>> {
    try {
      const { data, error } = await supabase
        .from('ad_placements')
        .select('id, zone, is_active, campaign_id');

      if (error || !data) return [];
      return data;
    } catch {
      return [];
    }
  }

  /**
   * Fetch all direct ads configured in Supabase with associated campaign and creative.
   */
  public async getAllDirectAds(): Promise<Array<{
    id: string;
    zone: string;
    advertiserName: string;
    creativeText: string;
    destinationUrl: string;
    mediaUrl?: string;
    altText?: string;
    ctaText?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    impressionsCount?: number;
    clicksCount?: number;
  }>> {
    try {
      const { data, error } = await supabase
        .from('ad_placements')
        .select(`
          id, zone, campaign_id, is_active, created_at,
          campaigns (
            id, name, start_at, end_at, status, created_at,
            advertisers (id, name),
            ad_creatives (id, headline, destination_url, alt_text, media_id, media (public_url))
          )
        `);

      if (error || !data) return [];

      const list: any[] = [];
      for (const item of data) {
        if (!item.campaigns || !item.zone) continue;
        const c: any = item.campaigns;
        const cr = Array.isArray(c.ad_creatives) && c.ad_creatives.length > 0 ? c.ad_creatives[0] : null;

        list.push({
          id: c.id,
          zone: item.zone,
          advertiserName: c.advertisers?.name || c.name || `Partner ${item.zone}`,
          creativeText: cr?.headline || c.name,
          destinationUrl: cr?.destination_url || '#',
          mediaUrl: cr?.media?.public_url || '',
          altText: cr?.alt_text || c.name,
          ctaText: cr?.destination_url?.startsWith('tel:') ? 'Call Now' : 'Learn More',
          isActive: Boolean(item.is_active && c.status === 'active'),
          createdAt: c.created_at || item.created_at,
          updatedAt: c.created_at || item.created_at,
          impressionsCount: 0,
          clicksCount: 0,
        });
      }
      return list;
    } catch {
      return [];
    }
  }

  /**
   * Delete ad campaign, placement, creatives, and analytics from Supabase Database.
   * Completely purges the ad from the database so it will never reappear.
   */
  public async deleteCampaignAndPlacement(
    zone: string,
    campaignId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const targetCampaignIds: string[] = [];
      const targetPlacementIds: string[] = [];

      // 1. Find all placements matching the zone
      if (zone) {
        const { data: placementsByZone } = await supabase
          .from('ad_placements')
          .select('id, campaign_id')
          .eq('zone', zone);

        if (Array.isArray(placementsByZone)) {
          placementsByZone.forEach((p) => {
            if (p.id) targetPlacementIds.push(p.id);
            if (p.campaign_id) targetCampaignIds.push(p.campaign_id);
          });
        }
      }

      // 2. If a specific campaignId was passed, include it
      if (campaignId && !campaignId.startsWith('direct-ad-') && !campaignId.startsWith('mock-')) {
        targetCampaignIds.push(campaignId);

        // Also check if any placements reference this campaignId
        const { data: placementsByCampaign } = await supabase
          .from('ad_placements')
          .select('id')
          .eq('campaign_id', campaignId);

        if (Array.isArray(placementsByCampaign)) {
          placementsByCampaign.forEach((p) => {
            if (p.id) targetPlacementIds.push(p.id);
          });
        }
      }

      const uniqueCampaignIds = Array.from(new Set(targetCampaignIds.filter(Boolean)));
      const uniquePlacementIds = Array.from(new Set(targetPlacementIds.filter(Boolean)));

      // 3. Delete from ad_analytics_daily
      for (const pId of uniquePlacementIds) {
        await supabase.from('ad_analytics_daily').delete().eq('placement_id', pId);
      }
      for (const cId of uniqueCampaignIds) {
        await supabase.from('ad_analytics_daily').delete().eq('campaign_id', cId);
      }

      // 4. Delete placements
      if (zone) {
        await supabase.from('ad_placements').delete().eq('zone', zone);
      }
      for (const pId of uniquePlacementIds) {
        await supabase.from('ad_placements').delete().eq('id', pId);
      }

      // 5. Delete creatives
      for (const cId of uniqueCampaignIds) {
        await supabase.from('ad_creatives').delete().eq('campaign_id', cId);
      }

      // 6. Delete campaigns
      for (const cId of uniqueCampaignIds) {
        await supabase.from('campaigns').delete().eq('id', cId);
      }

      return { success: true };
    } catch (err: any) {
      console.error('Failed to delete ad from Supabase DB:', err);
      return { success: false, error: err?.message || 'Database deletion error' };
    }
  }

  /**
   * Save or update an ad in Supabase Database.
   * Keeps campaigns, ad_creatives, and ad_placements in sync.
   */
  public async saveCampaignAndPlacement(ad: {
    id?: string;
    zone: string;
    advertiserName: string;
    creativeText: string;
    destinationUrl: string;
    mediaUrl?: string;
    altText?: string;
    isActive: boolean;
  }): Promise<{ success: boolean; campaignId?: string; error?: string }> {
    try {
      const now = new Date().toISOString();

      // Check for existing placement by zone
      const { data: existingPlacements } = await supabase
        .from('ad_placements')
        .select('id, campaign_id')
        .eq('zone', ad.zone)
        .limit(1);

      let campaignId = existingPlacements?.[0]?.campaign_id;
      let placementId = existingPlacements?.[0]?.id;

      if (campaignId) {
        // Update existing campaign
        await supabase
          .from('campaigns')
          .update({
            name: ad.advertiserName || `Zone ${ad.zone} Campaign`,
            status: ad.isActive ? 'active' : 'paused',
          })
          .eq('id', campaignId);

        // Update or insert creative
        const { data: existingCreatives } = await supabase
          .from('ad_creatives')
          .select('id')
          .eq('campaign_id', campaignId)
          .limit(1);

        if (existingCreatives && existingCreatives.length > 0) {
          await supabase
            .from('ad_creatives')
            .update({
              headline: ad.creativeText,
              destination_url: ad.destinationUrl || '#',
              alt_text: ad.altText || ad.advertiserName,
            })
            .eq('id', existingCreatives[0].id);
        } else {
          await supabase.from('ad_creatives').insert({
            campaign_id: campaignId,
            type: 'banner',
            headline: ad.creativeText,
            destination_url: ad.destinationUrl || '#',
            alt_text: ad.altText || ad.advertiserName,
          });
        }

        // Update placement
        if (placementId) {
          await supabase
            .from('ad_placements')
            .update({
              is_active: ad.isActive,
            })
            .eq('id', placementId);
        }
      } else {
        // Create new campaign
        const { data: newCampaign, error: campErr } = await supabase
          .from('campaigns')
          .insert({
            name: ad.advertiserName || `Zone ${ad.zone} Campaign`,
            status: ad.isActive ? 'active' : 'paused',
            start_at: now,
          })
          .select('id')
          .single();

        if (campErr || !newCampaign) {
          return { success: false, error: campErr?.message };
        }

        campaignId = newCampaign.id;

        // Insert creative
        await supabase.from('ad_creatives').insert({
          campaign_id: campaignId,
          type: 'banner',
          headline: ad.creativeText,
          destination_url: ad.destinationUrl || '#',
          alt_text: ad.altText || ad.advertiserName,
        });

        // Insert or update placement
        if (placementId) {
          await supabase
            .from('ad_placements')
            .update({
              campaign_id: campaignId,
              is_active: ad.isActive,
            })
            .eq('id', placementId);
        } else {
          await supabase.from('ad_placements').insert({
            zone: ad.zone,
            campaign_id: campaignId,
            is_active: ad.isActive,
          });
        }
      }

      return { success: true, campaignId };
    } catch (err: any) {
      console.error('Failed to save ad to Supabase DB:', err);
      return { success: false, error: err?.message };
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
