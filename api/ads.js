// @ts-nocheck
import './_suppressWarnings.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bogjmdyolhazzvicjrjl.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZ2ptZHlvbGhhenp2aWNqcmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDcxNDAsImV4cCI6MjEwNDAyMzE0MH0.taOdcGmN6pQ3sfuIC2UIVkSV-8j0Y_wuXS-7Un4xo_0';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export default async function handler(req, res) {
  const method = req.method;

  if (method === 'GET') {
    const zone = (req.query?.zone || '').trim();
    if (!zone) {
      return res.status(400).json({ error: 'zone required' });
    }

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

      if (error || !data || !data.campaigns) {
        res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120');
        return res.status(200).json({ placement: null });
      }

      const campaign = data.campaigns;
      if (campaign.status !== 'active' || (campaign.start_at && campaign.start_at > now) || (campaign.end_at && campaign.end_at < now)) {
        res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120');
        return res.status(200).json({ placement: null });
      }

      const creative = Array.isArray(campaign.ad_creatives) && campaign.ad_creatives.length > 0
        ? campaign.ad_creatives[0]
        : null;

      if (!creative) {
        res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120');
        return res.status(200).json({ placement: null });
      }

      const payload = {
        campaignId: campaign.id,
        placementId: data.id,
        advertiserName: campaign.advertisers?.name || 'Sponsored Partner',
        creativeText: creative.headline || campaign.name,
        destinationUrl: creative.destination_url || '#',
        mediaUrl: creative.media?.public_url,
        altText: creative.alt_text || 'Sponsored advertisement',
      };

      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=300');
      return res.status(200).json({ placement: payload });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (method === 'POST') {
    let body = {};
    if (typeof req.body === 'string') {
      try {
        body = JSON.parse(req.body);
      } catch {}
    } else {
      body = req.body || {};
    }

    const { campaignId, placementId, type } = body;
    if (!campaignId || !placementId) {
      return res.status(400).json({ error: 'campaignId and placementId required' });
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const isClick = type === 'click';

      await supabase.rpc('increment_ad_metric', {
        p_campaign_id: campaignId,
        p_placement_id: placementId,
        p_date: today,
        p_impressions: isClick ? 0 : 1,
        p_clicks: isClick ? 1 : 0,
      });

      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ success: true, recorded: type });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
